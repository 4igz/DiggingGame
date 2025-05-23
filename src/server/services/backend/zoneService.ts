import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/gameConstants";
import { ProfileService } from "./profileService";
import Signal from "@rbxts/goodsignal";
import { Events, Functions } from "server/network";
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

			this.profileService.getProfileLoaded(player).then((profile) => {
				const island = CollectionService.GetTagged("Map").filter(
					(instance) => instance.Name === profile.Data.currentMap,
				)[0];
				const spawnLocation = island.WaitForChild("SpawnLocation") as Model;
				const spawnPos = spawnLocation.GetPivot();
				if (hrp.Position.sub(spawnPos.Position).Magnitude > 30) {
					character.PivotTo(spawnPos.add(new Vector3(0, 5, 0)));
				}
			});

			humanoid.WalkSpeed = 20;
			hrp.Anchored = false;
		});

		Players.PlayerRemoving.Connect((player) => {
			this.spawnedPlayers.delete(player);
		});

		Functions.requestSpawn.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const map = profile.Data.currentMap;

			this.immobilizeCharacter(player);
			this.streamSpawn(player, map).await();
			return map;
		});
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

	immobilizeCharacter(player: Player) {
		// Before they spawn, set their walkspeed to 0 so they don't move around while loading
		const humanoid = player.Character?.WaitForChild("Humanoid") as Humanoid;
		if (humanoid) {
			humanoid.WalkSpeed = 0;
		}
		const hrp = player.Character?.WaitForChild("HumanoidRootPart") as BasePart;
		if (hrp) {
			hrp.Anchored = true;
		}
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
