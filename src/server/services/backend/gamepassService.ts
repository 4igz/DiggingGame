import { Service, OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { MarketplaceService } from "@rbxts/services";
import { gameConstants } from "shared/gameConstants";
import { ProfileService } from "./profileService";
import { Events, Functions } from "server/network";
import { spaceWords } from "shared/util/nameUtil";

const GAME_CREATOR_ID = game.CreatorId;

@Service({})
export class GamepassService implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	private gamepassIdToName = new Map(
		Object.values(gameConstants.GAMEPASS_IDS).map((value, index) => [
			value,
			Object.keys(gameConstants.GAMEPASS_IDS)[index],
		]),
	);

	onStart() {
		this.profileService.onProfileLoaded.Connect((player, profile) => {
			for (const [id, name] of this.gamepassIdToName) {
				if (profile.Data.ownedGamepasses.get(name) === true) continue;
				const ownsGamepass = MarketplaceService.UserOwnsGamePassAsync(player.UserId, id);
				if (ownsGamepass) {
					profile.Data.ownedGamepasses.set(name, true);
				}
			}
			this.profileService.setProfile(player, profile);
			Events.updateOwnedGamepasses(player, profile.Data.ownedGamepasses);
		});

		MarketplaceService.PromptGamePassPurchaseFinished.Connect((player, assetId, wasPurchased) => {
			if (!wasPurchased) return;
			const gamepassName = this.gamepassIdToName.get(assetId);
			if (!gamepassName) {
				error("What are you buying??", assetId);
			}

			const profile = this.profileService.getProfile(player);

			if (!profile) {
				// User somehow bought a gamepass without a profile
				// All good though, because when they rejoin it will check their gamepasses
				// when the cache resets
				return;
			}

			profile.Data.ownedGamepasses.set(gamepassName, true);
			this.profileService.setProfile(player, profile);
			Events.updateOwnedGamepasses(player, profile.Data.ownedGamepasses);

			Events.notifyBought(player, spaceWords(gamepassName), Enum.InfoType.Product);
		});

		Functions.getOwnedGamepasses.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.ownedGamepasses;
		});

		// Valiate all gamepasses in gameConstants.GAMEPASS_IDS are valid and owned by the game 😃
		for (const [id, name] of this.gamepassIdToName) {
			task.defer(() => {
				try {
					const info = MarketplaceService.GetProductInfo(id, Enum.InfoType.GamePass);

					// Furthermore, validate that the owner of the gamepass is the creator of the game
					if (info.Creator.CreatorTargetId !== GAME_CREATOR_ID) {
						error(`Gamepass ${name} is not owned by the game creator`);
					}
				} catch (error) {
					warn(`Failed to validate gamepass ${name} :: ${id} for:`, error);
				}
			});
		}
	}

	public ownsGamepass(player: Player, gamepassId: number) {
		assert(this.gamepassIdToName.has(gamepassId), "Invalid gamepass ID (use gameConstants.GAMEPASS_IDS)");
		const gamepassName = this.gamepassIdToName.get(gamepassId)!;
		const profile = this.profileService.getProfile(player);
		if (!profile) return false;
		return profile.Data.ownedGamepasses.get(gamepassName) ?? false;
	}
}
