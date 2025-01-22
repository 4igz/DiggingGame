import { Service, OnStart, OnTick } from "@flamework/core";
import { CollectionService, HttpService, PhysicsService, Players, RunService } from "@rbxts/services";
import { Events } from "server/network";
import { gameConstants } from "shared/constants";
import { TargetConfig as TargetConfig, targetConfig } from "shared/config/targetConfig";
import { ProfileService } from "./profileService";
import { BASE_SHOVEL_STRENGTH, shovelConfig } from "shared/config/shovelConfig";
import { Target } from "shared/networkTypes";
import { InventoryService } from "./inventoryService";
import { BASE_DETECTOR_STRENGTH, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import EternityNum from "shared/util/eternityNum";
import { LevelService } from "./levelService";
import { mapConfig } from "shared/config/mapConfig";
import { findFurthestPointWithinRadius } from "shared/util/detectorUtil";
import { MoneyService } from "./moneyService";
import { Signals } from "shared/signals";

const Maps = CollectionService.GetTagged("Map");

@Service({})
export class TargetService implements OnStart, OnTick {
	// Here we store all active targets in a map to track them.
	// The key is a unique identifier for the target, and the value is the target itself.
	// This allows us to track targets on the server with the client having no knowledge of the targets whereabouts.
	public activeTargets: Array<Target> = new Array();
	public playerDigCooldown: Map<Player, boolean> = new Map();
	public playerDiggingTargets: Map<Player, Target> = new Map();

	private rng = new Random(tick());

	constructor(
		private readonly profileService: ProfileService,
		private readonly inventoryService: InventoryService,
		private readonly levelService: LevelService,
		private readonly moneyService: MoneyService,
	) {}

	onStart() {
		math.randomseed(tick());

		if (!PhysicsService.IsCollisionGroupRegistered(gameConstants.DIRT_COLGROUP)) {
			PhysicsService.RegisterCollisionGroup(gameConstants.DIRT_COLGROUP);
		}
		if (!PhysicsService.IsCollisionGroupRegistered(gameConstants.PLAYER_COLGROUP)) {
			PhysicsService.RegisterCollisionGroup(gameConstants.PLAYER_COLGROUP);
		}

		PhysicsService.CollisionGroupSetCollidable(gameConstants.DIRT_COLGROUP, gameConstants.PLAYER_COLGROUP, false);

		// TODO: Probably make an event for when the player changes maps and use that instead
		this.profileService.profileChanged.Connect((player, profile) => {
			const target = this.getPlayerTarget(player);
			if (target && target.mapName !== profile.Data.currentMap) {
				this.activeTargets = this.activeTargets.filter((t) => t !== target);
				this.playerDiggingTargets.delete(player);
				Events.targetDespawned.fire(player);
				// const map = Maps.find((map) => map.Name === profile.Data.currentMap);
				// if (map) {
				// 	this.retrySpawnTarget(map, player);
				// } else {
				// 	warn(`Failed to find map ${profile.Data.currentMap}`);
				// }
			}
		});

		// Spawn each player a target when they join
		// this.profileService.onProfileLoaded.Connect((player, profile) => {
		// 	const map = Maps.find((map) => map.Name === profile.Data.currentMap);
		// 	if (map) {
		// 		this.retrySpawnTarget(map, player);
		// 	} else {
		// 		warn(`Failed to find map ${profile.Data.currentMap}`);
		// 	}
		// });

		Players.PlayerRemoving.Connect((player) => {
			const target = this.getPlayerTarget(player);
			if (target) {
				const idx = this.activeTargets.findIndex((t) => t === target);
				if (idx !== -1) {
					this.activeTargets.remove(idx);
					Events.targetDespawned.fire(player);
					this.playerDiggingTargets.delete(player);
					this.playerDigCooldown.delete(player);
				}
			}
		});

		Events.sellTarget.connect((player, itemId) => {
			let profile = this.profileService.getProfile(player);
			if (!profile) return;
			const target = profile.Data.targetInventory.find((item) => item.itemId === itemId);
			if (!target) return;
			this.inventoryService.removeTargetItemFromInventory(player, itemId);

			this.moneyService.giveMoney(player, target.weight * target.basePrice);

			this.profileService.setProfile(player, profile);
			if (profile.Data.equippedTreasure !== "") {
				this.inventoryService.equipTreasure(player, profile.Data.equippedTreasure);
			}
			profile = this.profileService.getProfile(player);
			Events.updateInventory.fire(player, "Target", [
				{
					equippedShovel: profile!.Data.equippedShovel,
					equippedDetector: profile!.Data.equippedDetector,
					equippedTreasure: profile!.Data.equippedTreasure,
				},
				profile!.Data.targetInventory.map((item) => ({
					...item,
					name: item.name,
					type: "Target",
				})),
			]);
		});

		Events.sellAll.connect((player) => {
			let profile = this.profileService.getProfile(player);
			if (!profile) return;
			const total = profile.Data.targetInventory.reduce((acc, item) => acc + item.weight * item.basePrice, 0);
			this.moneyService.giveMoney(player, total);
			profile.Data.targetInventory = [];
			this.profileService.setProfile(player, profile);
			if (profile.Data.equippedTreasure !== "") {
				this.inventoryService.equipTreasure(player, profile.Data.equippedTreasure);
			}
			profile = this.profileService.getProfile(player);
			Events.updateInventory.fire(player, "Target", [
				{
					equippedShovel: profile!.Data.equippedShovel,
					equippedDetector: profile!.Data.equippedDetector,
					equippedTreasure: profile!.Data.equippedTreasure,
				},
				[],
			]);
		});

		Events.endDiggingClient.connect((player) => {
			this.endDigging(player);
		});

		Events.dig.connect((player) => {
			// Check if the player is already digging
			if (this.playerDigCooldown.get(player)) {
				return;
			}

			let target = this.getPlayerTarget(player);
			if (!target) return;
			const targetDistance = player.Character?.PrimaryPart?.Position.sub(target.position).Magnitude;
			if (targetDistance === undefined) return;
			// Ensure exploiters can't dig from far away
			if (targetDistance > gameConstants.DIG_RANGE * 2) return;

			this.dig(player, target);
		});

		Signals.detectorInitialized.Connect((player, detector) => {
			detector.Unequipped.Connect(() => {
				if (this.getPlayerTarget(player) && !this.playerDiggingTargets.get(player)) {
					this.endDigging(player);
				}
			});
		});
	}

	onTick(): void {
		for (const [_player, target] of this.playerDiggingTargets) {
			if (!target.activelyDigging) continue;
			target.digProgress = math.max(0, target.digProgress - target.maxProgress * 0.0005);
		}
	}

	public getPlayerTarget(player: Player): Target | undefined {
		return this.activeTargets.find((target) => target.owner === player);
	}

	private digSuccess(player: Player, target: Target) {
		// Final modifications
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		// target.weight *= profile.Data.luck;
		// Add the target to the player's inventory
		this.inventoryService.addItemToTargetInventory(player, target);

		if (profile) {
			// Now we can spawn a new target.
			// const map = Maps.find((map) => map.Name === profile?.Data.currentMap);
			// if (map) {
			// 	this.retrySpawnTarget(map, player);
			// }

			// Add experience to the player
			this.levelService.addExperience(player, target.weight * 10);
		}

		// Delete the debugPart in the base with the same position as this target
		if (RunService.IsStudio()) {
			for (const map of CollectionService.GetTagged("Map")) {
				if (!map) return false;
				const spawnBaseFolder = map.WaitForChild("SpawnBases");
				for (const base of spawnBaseFolder.GetChildren()) {
					if (base.IsA("BasePart")) {
						const debugPart = base.FindFirstChild(tostring(target.position));
						if (debugPart && debugPart.IsA("Part")) {
							debugPart.Destroy();
						}
					}
				}
			}
		}
	}

	private dig(player: Player, target: Target) {
		const character = player.Character;
		if (!character || !character.Parent) return;
		this.playerDigCooldown.set(player, true);

		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		const cfg = shovelConfig[profile.Data.equippedShovel];
		assert(cfg, `Shovel config for ${profile.Data.equippedShovel} not found`);

		// Update the digging progress by incrementing the digProgress
		target.digProgress += profile.Data.strength + cfg.strengthMult * BASE_SHOVEL_STRENGTH;
		const maxProgress = target.maxProgress;

		// Check if the target is fully dug
		if (target.digProgress >= maxProgress) {
			// Remove the target from the active targets
			target.activelyDigging = false;
			print(`${player.Name} dug up ${target.name} with weight ${target.weight}`);

			this.endDigging(player);
			this.digSuccess(player, target);
		}

		// End dig cooldown
		task.delay(gameConstants.DIG_TIME_SEC, () => {
			this.playerDigCooldown.set(player, false);
		});
	}

	public endDigging(player: Player) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		const target = this.getPlayerTarget(player);

		if (target && this.activeTargets.includes(target)) {
			// Remove the target from the active targets
			const idx = this.activeTargets.findIndex((t) => t === target);
			if (idx !== -1) {
				this.activeTargets.remove(idx);
				Events.targetDespawned.fire(player);
			} else {
				warn("Failed to remove target from active targets. Player may have dug up the same target twice.");
			}
		}
		this.playerDiggingTargets.delete(player);

		Events.endDiggingServer.fire(player);
		const character = player.Character;
		if (!character || !character.Parent) return;
		const humanoid = character.WaitForChild("Humanoid") as Humanoid;
		humanoid.WalkSpeed = 16;

		// Equip the metal detector back from their backpack and unequip the shovel
		const backpack = player.WaitForChild("Backpack");
		const shovel = character.FindFirstChild(profile.Data.equippedShovel);
		if (shovel && shovel.IsA("Tool")) {
			shovel.Parent = backpack;
			const detector = backpack.FindFirstChild(profile.Data.equippedDetector) as Tool;
			if (detector) {
				detector.Parent = character;
			}
		}
	}

	public retrySpawnTarget(player: Player, luckMult = 1) {
		if (!this.spawnTarget(player, luckMult)) {
			task.delay(1, () => {
				if (player.IsDescendantOf(Players)) {
					this.retrySpawnTarget(player, luckMult);
				}
			});
		}
	}

	// Spawn a target and assign it to a player.
	// Returns true if the target was successfully spawned, false otherwise.
	public spawnTarget(player: Player, luckMult: number): boolean {
		const profile = this.profileService.getProfile(player);

		if (!profile) {
			return false;
		}

		const map = Maps.find((map) => map.Name === profile.Data.currentMap) as Folder | undefined;
		if (!map) {
			return false;
		}

		// Get the spawn bases from the map

		const spawnBaseFolder = map.WaitForChild("SpawnBases");
		const base = spawnBaseFolder.GetChildren()[
			this.rng.NextInteger(0, spawnBaseFolder.GetChildren().size() - 1)
		] as BasePart;

		const playerPosition = player.Character?.PrimaryPart?.Position;

		if (!playerPosition) {
			return false;
		}

		const playerDetectorConfig = metalDetectorConfig[profile.Data.equippedDetector];

		const radius = BASE_DETECTOR_STRENGTH / playerDetectorConfig.strength;
		const randomScaleFactor = 0.75 + math.random() * 0.25;
		const adjustedRadius = radius * randomScaleFactor;

		const position = findFurthestPointWithinRadius(
			playerPosition,
			spawnBaseFolder.GetChildren().filter((inst) => inst.IsA("BasePart")),
			adjustedRadius,
		);

		if (!position) {
			return false;
		}

		const targetData = this.rollTarget(player, playerDetectorConfig.luck + profile.Data.luck * 0.02 * luckMult);

		if (!targetData) {
			return false;
		}

		const [name, target] = targetData;

		// Determine the weight of the target.
		const weight = this.rng.NextNumber(target.baseWeight.Min, target.baseWeight.Max); // TODO: Just random for now, later adjust for rarity and luck
		const maxProgress = weight * 20; // TODO: Later adjust for rarity

		this.activeTargets.push({
			...target,
			name,
			position,
			weight,
			digProgress: maxProgress / 2, // Start at half progress
			maxProgress,
			activelyDigging: false,
			itemId: HttpService.GenerateGUID(),
			base,
			mapName: map.Name,
			owner: player,
		});

		Events.targetSpawnSuccess.fire(player, position);

		// Just a part to visualize targets for debugging
		if (RunService.IsStudio()) {
			const debugPart = new Instance("Part");
			debugPart.Size = new Vector3(1, 1, 1);
			debugPart.Color = new Color3(1, 0, 0);
			debugPart.Anchored = true;
			debugPart.CanCollide = false;
			debugPart.Position = position.add(new Vector3(0, 1, 0));
			debugPart.Transparency = 0.5;
			// debugPart.Parent = base; // Parent it to the map for visibility
			debugPart.Name = tostring(position);
		}

		return true;
	}

	private rollTarget(player: Player, addLuck: number): [keyof typeof targetConfig, TargetConfig] | undefined {
		// Retrieve the player's profile
		const profile = this.profileService.getProfile(player);
		if (!profile) {
			return undefined;
		}

		// Retrieve the map data based on the player's current map
		const mapData = mapConfig[profile.Data.currentMap];
		if (!mapData || !mapData.targetList) {
			warn("Invalid map data for map:", profile.Data.currentMap);
			return undefined;
		}

		// Initialize variables for cumulative weights
		let cumulativeWeight = 0;
		const cumulativeMap = new Map<keyof typeof targetConfig, number>();

		// Adjust weights with scaling
		for (const [name, targetInfo] of pairs(targetConfig)) {
			if (!mapData.targetList.includes(name)) continue;

			// Apply the adjusted weight formula
			const weight = math.pow(1 / targetInfo.rarity, 1 - addLuck);
			cumulativeWeight += weight;
			cumulativeMap.set(name, cumulativeWeight);
		}

		if (cumulativeMap.size() === 0) {
			warn("No valid targets for the map:", profile.Data.currentMap);
			return undefined;
		}

		// Generate a random roll within the cumulative weight range
		const roll = this.rng.NextNumber(0, cumulativeWeight);

		// Find the matching target based on the roll
		let selectedTarget: keyof typeof targetConfig | undefined;

		// Manually convert Map to an array of key-value pairs
		const mapArray: [string, number][] = [];
		for (const [key, value] of cumulativeMap) {
			mapArray.push([key, value]);
		}

		// Custom sort using boolean return
		mapArray.sort((a, b) => {
			return a[1] < b[1];
		});

		for (const [name, cumulative] of mapArray) {
			if (roll <= cumulative) {
				selectedTarget = name;
				break; // Stop once the first matching target is found
			}
		}

		// If no target is selected, return undefined
		if (!selectedTarget) {
			warn("Roll failed to match any target");
			return undefined;
		}

		// Return the selected target and its configuration
		return [selectedTarget, targetConfig[selectedTarget]];
	}
}
