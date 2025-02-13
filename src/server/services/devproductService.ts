import { Service, OnStart, OnTick } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";
import { getDevProduct, handlePurchase } from "shared/config/devproducts";
import { Signals } from "shared/signals";
import { ProfileService } from "./profileService";
import { gameConstants } from "shared/constants";
import { Events, Functions } from "server/network";
import { interval } from "shared/util/interval";
import { LevelService } from "./levelService";

const SEC = interval(1);

@Service({})
export class DevproductService implements OnStart, OnTick {
	private trackedServerLuckMultipliers = new Map<Player, number>();

	constructor(private readonly profileService: ProfileService, private readonly levelService: LevelService) {}

	verifyCanBuyDevProduct(player: Player, productId: number) {
		const productInfo = getDevProduct(productId);
		const profile = this.profileService.getProfile(player);
		if (!profile) return false;
		switch (productInfo?.name) {
			case "Multi Digging":
				if (profile?.Data.multiDigLevel >= gameConstants.MAX_MULTIDIG_LEVEL) {
					return false;
				}
		}
		return true;
	}

	public giveLuckMultiplier(player: Player, length: number) {
		const timeLeft = (this.trackedServerLuckMultipliers.get(player) ?? 0) + length;

		this.trackedServerLuckMultipliers.set(player, timeLeft);
		Events.updateServerLuckMultiplier(player, 1, timeLeft);
	}

	onStart() {
		Players.PlayerRemoving.Connect((player) => {
			this.trackedServerLuckMultipliers.delete(player);
		});

		MarketplaceService.ProcessReceipt = (receiptInfo) => {
			const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
			if (!player) return Enum.ProductPurchaseDecision.NotProcessedYet;

			const canBuy = this.verifyCanBuyDevProduct(player, receiptInfo.ProductId);
			if (!canBuy) return Enum.ProductPurchaseDecision.NotProcessedYet;

			return handlePurchase(player, receiptInfo.ProductId);
		};

		Signals.resetSkills.Connect((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;
			profile.Data.skillPoints = profile.Data.level - 1;
			profile.Data.strength = 1;
			profile.Data.detection = 1;
			profile.Data.luck = 1;
			this.profileService.setProfile(player, profile);
			Events.updateSkills(player, {
				detection: profile.Data.detection,
				strength: profile.Data.strength,
				luck: profile.Data.luck,
			});
			this.levelService.addExperience(player, 0); // updates level ui
		});

		Signals.giveMultiDig.Connect((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;
			profile.Data.multiDigLevel++;
			this.profileService.setProfile(player, profile);
			Events.updateMultiDigLevel(player, profile.Data.multiDigLevel);
		});

		Signals.buyServerLuckMultiplier.Connect((player) => {
			const lmTimeLeft =
				(this.trackedServerLuckMultipliers.get(player) ?? 0) + gameConstants.SERVER_LUCK_MULTIPLIER_DURATION;

			this.trackedServerLuckMultipliers.set(player, lmTimeLeft);
			Events.updateServerLuckMultiplier(player, 1, lmTimeLeft);
		});

		Functions.getMultiDigLevel.setCallback((player: Player) => {
			return this.profileService.getProfile(player)?.Data.multiDigLevel ?? 0;
		});
	}

	onTick() {
		for (const [player, timeLeft] of this.trackedServerLuckMultipliers) {
			if (!SEC(player.UserId)) continue;
			if (timeLeft <= 0) {
				this.trackedServerLuckMultipliers.delete(player);
				Events.updateServerLuckMultiplier(player, 1, 0);
			} else {
				this.trackedServerLuckMultipliers.set(player, timeLeft - 1);
				Events.updateServerLuckMultiplier(player, 1, timeLeft - 1);
			}
		}
	}

	serverLuckMultiplier(player: Player) {
		return this.trackedServerLuckMultipliers.has(player) ? 2 : 1;
	}
}
