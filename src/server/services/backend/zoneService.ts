import { Service, OnStart, OnInit } from "@flamework/core";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/gameConstants";
import { ProfileService } from "./profileService";
import Signal from "@rbxts/goodsignal";
import { Events } from "server/network";
import Object from "@rbxts/object-utils";

@Service({})
export class ZoneService implements OnStart {
	private zoneMap: Map<string, Zone> = new Map();
	private spawnedPlayers: Set<Player> = new Set();
	public changedMap = new Signal<(player: Player, zoneName: keyof typeof mapConfig) => void>();

	constructor(private readonly profileService: ProfileService) {}

	onStart(): void {
		for (const mapName of Object.keys(mapConfig)) {
			const map = CollectionService.GetTagged("Map").filter((instance) => instance.Name === mapName)[0];
			if (!map) {
				warn(`Couldn't find map for Map: ${mapName} when trying to create zone spawns.`);
				continue;
			}
			const zoneSpawnFolder = map.FindFirstChild("SpawnLocation");
			if (!zoneSpawnFolder) {
				warn(`Couldn't find SpawnLocation for Map: ${mapName}`);
				continue;
			}
		}

		for (const zonePart of CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG)) {
			if (zonePart.IsA("PVInstance")) {
				const zone = new Zone(zonePart);
				zone.playerEntered.Connect((player) => this.onZoneEntered(player, zonePart.Name));
				this.zoneMap.set(zonePart.Name, zone);
			}
		}

		Events.teleportSuccess.connect((player) => {
			if (!this.spawnedPlayers.has(player)) {
				this.spawnedPlayers.add(player);
				player.SetAttribute("Spawned", true);
			}

			const character = player.Character || player.CharacterAdded.Wait()[0];
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			const hrp = character.WaitForChild("HumanoidRootPart") as BasePart;
			humanoid.WalkSpeed = 16;
			hrp.Anchored = false;
		});

		Players.PlayerRemoving.Connect((player) => {
			this.spawnedPlayers.delete(player);
		});

		// Incase profile loaded before zone service
		for (const [player, profile] of this.profileService.getLoadedProfiles()) {
			if (player.Character) {
				this.spawnPlayer(player, profile.Data.currentMap);
			}
			player.CharacterAdded.Connect((char) => {
				const currentProfile = this.profileService.getProfile(player);
				if (!currentProfile) return;
				this.spawnPlayer(player, currentProfile.Data.currentMap);
			});
		}

		Events.requestSpawn.connect((player) => {
			if (!this.spawnedPlayers.has(player)) {
				const currentProfile = this.profileService.getProfileLoaded(player).expect();
				this.spawnPlayer(player, currentProfile.Data.currentMap);
			}
		});

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

		// task.spawn(() => {
		// 	while (true) {
		// 		task.wait(3);
		// 		for (const player of Players.GetPlayers()) {
		// 			if (!this.spawnedPlayers.has(player)) {
		// 				const currentProfile = this.profileService.getProfile(player);
		// 				if (!currentProfile) continue;
		// 				this.spawnPlayer(player, currentProfile.Data.currentMap);
		// 			}
		// 		}
		// 	}
		// });
	}

	isPlayerAtSeas(player: Player): boolean {
		let isAtSeas = true;
		for (const [_, zone] of this.zoneMap) {
			if (zone.findPlayer(player)) {
				isAtSeas = false;
				break;
			}
		}
		return isAtSeas;
	}

	async streamSpawn(player: Player, zoneName: keyof typeof mapConfig) {
		const map = CollectionService.GetTagged("Map").filter((instance) => instance.Name === zoneName)[0];
		const spawn = map.FindFirstChild("SpawnLocation") as Model;
		if (!spawn) {
			warn(`SpawnLocation not found for zone ${zoneName}`);
			return;
		}
		player.RequestStreamAroundAsync(spawn.GetPivot().Position);
	}

	spawnPlayer(player: Player, zoneName: keyof typeof mapConfig) {
		const map = CollectionService.GetTagged("Map").filter((instance) => instance.Name === zoneName)[0];
		const spawn = map.FindFirstChild("SpawnLocation") as Model;
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
			const hrp = player.Character?.WaitForChild("HumanoidRootPart") as BasePart;
			if (hrp) {
				hrp.Anchored = true;
			}
		});
		this.streamSpawn(player, zoneName);
		Events.teleportToIsland(player, zoneName);
	}

	onZoneEntered(player: Player, zoneName: keyof typeof mapConfig) {
		if (!this.spawnedPlayers.has(player)) return;
		const profile = this.profileService.getProfile(player);
		if (!profile) {
			return;
		}
		if (profile.Data.currentMap === zoneName) return;
		profile.Data.currentMap = zoneName;
		this.profileService.setProfile(player, profile);
		this.changedMap.Fire(player, zoneName);
	}
}
