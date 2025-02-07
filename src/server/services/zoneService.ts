import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/constants";
import { ProfileService } from "./profileService";
import Signal from "@rbxts/goodsignal";
import { Events } from "server/network";

@Service({})
export class ZoneService {
	private zoneMap: Map<string, Zone> = new Map();
	private spawnedPlayers: Set<Player> = new Set();
	public ChangedMap = new Signal<(player: Player, zoneName: keyof typeof mapConfig) => void>();

	constructor(private readonly profileService: ProfileService) {
		for (const zonePart of CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG)) {
			if (zonePart.IsA("PVInstance")) {
				const zone = new Zone(zonePart);
				zone.playerEntered.Connect((player) => this.onZoneEntered(player, zonePart.Name));
				this.zoneMap.set(zonePart.Name, zone);
			}
		}

		this.profileService.onProfileLoaded.Connect((player, profile) => {
			if (player.Character) {
				this.spawnPlayer(player, profile.Data.currentMap);
			}
			player.CharacterAdded.Connect((char) => {
				const currentProfile = this.profileService.getProfile(player);
				if (!currentProfile) return;
				this.spawnPlayer(player, currentProfile.Data.currentMap);
			});
		});

		Events.teleportSuccess.connect((player) => {
			if (!this.spawnedPlayers.has(player)) {
				this.spawnedPlayers.add(player);
			}

			const character = player.Character || player.CharacterAdded.Wait()[0];
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			humanoid.WalkSpeed = 16;
		});

		Players.PlayerRemoving.Connect((player) => {
			this.spawnedPlayers.delete(player);
		});
	}

	spawnPlayer(player: Player, zoneName: keyof typeof mapConfig) {
		const map = Workspace.WaitForChild(zoneName);
		const spawn = map.FindFirstChild("SpawnLocation") as SpawnLocation;
		if (!spawn) {
			warn(`SpawnLocation not found for zone ${zoneName}`);
			return;
		}
		// Before they spawn, set their walkspeed to 0 so they don't move around while loading
		task.spawn(() => {
			const humanoid = player.Character?.WaitForChild("Humanoid") as Humanoid;
			if (humanoid) {
				humanoid.WalkSpeed = 0;
			}
		});
		print("Request stream around", spawn.Position);
		player.RequestStreamAroundAsync(spawn.Position);
		Events.teleportToIsland(player, zoneName);
	}

	onZoneEntered(player: Player, zoneName: keyof typeof mapConfig) {
		if (!this.spawnedPlayers.has(player)) return;
		const profile = this.profileService.getProfile(player);
		if (!profile) {
			const connection = this.profileService.onProfileLoaded.Connect((plr) => {
				if (!player.IsDescendantOf(Players)) {
					connection.Disconnect();
					return;
				}
				if (plr !== player) return;
				this.onZoneEntered(player, zoneName);
				connection.Disconnect();
			});
			return;
		}
		if (profile.Data.currentMap === zoneName) return;
		profile.Data.currentMap = zoneName;
		this.profileService.setProfile(player, profile);
		this.ChangedMap.Fire(player, zoneName);
	}
}
