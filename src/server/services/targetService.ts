import { Service, OnStart, OnTick } from "@flamework/core";
import { CollectionService, HttpService, PhysicsService, Players, RunService } from "@rbxts/services";
import { Events } from "server/network";
import { gameConstants } from "shared/constants";
import {
	fullTargetConfig,
	TargetConfig as TargetConfig,
	targetConfig,
	TargetModule,
	trashConfig,
} from "shared/config/targetConfig";
import { ProfileService } from "./profileService";
import { BASE_SHOVEL_STRENGTH, shovelConfig } from "shared/config/shovelConfig";
import { Target } from "shared/networkTypes";
import { InventoryService } from "./inventoryService";
import { BASE_DETECTOR_STRENGTH, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { LevelService } from "./levelService";
import { mapConfig } from "shared/config/mapConfig";
import { findFurthestPointWithinRadius } from "shared/util/detectorUtil";
import { MoneyService } from "./moneyService";
import { Signals } from "shared/signals";
import { GamepassService } from "./gamepassService";
import { DevproductService } from "./devproductService";
import Object from "@rbxts/object-utils";
import Sift from "@rbxts/sift";
import { ZoneService } from "./zoneService";

const Maps = CollectionService.GetTagged("Map");

@Service({})
export class TargetService implements OnStart, OnTick {
	// Here we store all active targets in a map to track them.
	// The key is a unique identifier for the target, and the value is the target itself.
	// This allows us to track targets on the server with the client having no knowledge of the targets whereabouts.
	public activeTargets: Array<Target> = new Array();
	public playerDigCooldown: Map<Player, boolean> = new Map();
	public playerDiggingTargets: Map<Player, Target> = new Map();
	private playerLastSuccessfulDigCooldown: Set<Player> = new Set();

	private rng = new Random(tick());

	private readonly SUCCESSFUL_DIG_COOLDOWN = 1; // Prevent player from immediately digging again after just finishing digging

	constructor(
		private readonly profileService: ProfileService,
		private readonly inventoryService: InventoryService,
		private readonly levelService: LevelService,
		private readonly moneyService: MoneyService,
		private readonly gamepassService: GamepassService,
		private readonly devproductService: DevproductService,
		private readonly zoneService: ZoneService,
	) {}

	onStart() {
		math.randomseed(tick());

		if (!PhysicsService.IsCollisionGroupRegistered(gameConstants.NOCHARACTERCOLLISION_COLGROUP)) {
			PhysicsService.RegisterCollisionGroup(gameConstants.NOCHARACTERCOLLISION_COLGROUP);
		}
		if (!PhysicsService.IsCollisionGroupRegistered(gameConstants.PLAYER_COLGROUP)) {
			PhysicsService.RegisterCollisionGroup(gameConstants.PLAYER_COLGROUP);
		}

		PhysicsService.CollisionGroupSetCollidable(
			gameConstants.NOCHARACTERCOLLISION_COLGROUP,
			gameConstants.PLAYER_COLGROUP,
			false,
		);

		this.zoneService.ChangedMap.Connect((player, zoneName) => {
			const target = this.getPlayerTarget(player);
			if (target && target.mapName !== zoneName) {
				this.activeTargets = this.activeTargets.filter((t) => t !== target);
				this.playerDiggingTargets.delete(player);
				Events.targetDespawned.fire(player);
			}
		});

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

			const cfg = fullTargetConfig[target.name];
			this.moneyService.giveMoney(player, target.weight * cfg.basePrice);

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

			Events.soldItem(player, target.name, cfg.rarityType, target.weight * cfg.basePrice);
		});

		Events.sellAll.connect((player) => {
			let profile = this.profileService.getProfile(player);
			if (!profile) return;
			const count = profile.Data.targetInventory.size();
			if (count === 0) return;
			const total = profile.Data.targetInventory.reduce((acc, item) => {
				const cfg = fullTargetConfig[item.name];
				return acc + item.weight * cfg.basePrice;
			}, 0);
			this.moneyService.giveMoney(player, total);
			profile.Data.targetInventory = [];
			this.profileService.setProfile(player, profile);
			if (profile.Data.equippedTreasure !== "") {
				this.inventoryService.equipTreasure(player, profile.Data.equippedTreasure);
			}
			profile = this.profileService.getProfile(player);

			Events.updateInventory(player, "Target", [
				{
					equippedShovel: profile!.Data.equippedShovel,
					equippedDetector: profile!.Data.equippedDetector,
					equippedTreasure: profile!.Data.equippedTreasure,
				},
				[],
			]);
			Events.soldAllItems(player, count, total);
		});

		Events.endDiggingClient.connect((player) => {
			this.endDigging(player);
		});

		Events.dig.connect((player) => {
			// Check if the player is already digging
			if (this.playerDigCooldown.get(player)) {
				return;
			}
			if (this.playerLastSuccessfulDigCooldown.has(player)) return;

			let target = this.getPlayerTarget(player);
			if (!target) {
				// If the player has no target, it's likely because they're digging without detecting anything first.
				// Realistically, just digging in a a random spot would rarely yield anything of value.
				// We'll spawn a target, but it won't be good.
				const targetResult = this.createTarget(player, 0); // Spawn with 0 luck, which means it will be a trash item.
				if (targetResult === undefined) return;
				const [target, mapName] = targetResult;
				const character = player.Character;
				if (!character) return;

				const map = Maps.find((map) => map.Name === mapName) as Folder | undefined;
				if (!map) return;

				const profile = this.profileService.getProfile(player);
				if (!profile) return;

				const shovel = character.FindFirstChild(profile.Data.equippedShovel) as Tool;

				if (!shovel) {
					// They are trying to dig without a shovel equipped.
					// This is likely due to latency
					return;
				}

				// Get the spawn bases from the map
				const spawnBaseFolder = map.WaitForChild("SpawnBases");

				const bases = spawnBaseFolder.GetChildren().filter((inst) => inst.IsA("BasePart"));
				const position = findFurthestPointWithinRadius(
					character.GetPivot().Position,
					bases,
					gameConstants.DIG_RANGE,
				);
				if (!position) {
					// Can't dig here probably.
					warn("Can't dig here.");
					return;
				}

				target.position = position;
				target.base = spawnBaseFolder.GetChildren()[
					this.rng.NextInteger(0, spawnBaseFolder.GetChildren().size() - 1)
				] as BasePart;
				target.mapName = map.Name;

				// Add the target to the active targets
				this.activeTargets.push(target);
				Events.targetSpawnSuccess.fire(player, position);

				// Start digging immediately:
				Signals.startDigging.Fire(player, target);
				return;
			}
			const targetDistance = player.Character?.PrimaryPart?.Position.sub(target.position).Magnitude;
			if (targetDistance === undefined) {
				// This can happen when their character is destroyed, forex, they fell into void or reset.
				Events.endDiggingServer.fire(player, target.itemId);
				return;
			}
			// Ensure exploiters can't dig from far away
			if (targetDistance > gameConstants.DIG_RANGE * 2) {
				Events.endDiggingServer.fire(player, target.itemId); // End, incase this is a person trying to dig from far away.
				// If we didn't end then their dig wouldn't end until the timer ran out and they would be stuck.
				return;
			}

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

		// Add the target to the player's inventory
		this.inventoryService.addItemToTargetInventory(player, target);

		// For multi-dig, we will spawn another random target and give it to them for each level.
		const multiDigLevel = profile.Data.multiDigLevel;

		for (let i = 0; i < multiDigLevel; i++) {
			const targetResult = this.createTarget(player, target.usedLuckMult);
			if (!targetResult) continue;
			const [extraTarget] = targetResult;
			this.inventoryService.addItemToTargetInventory(player, extraTarget);
		}

		// Add experience to the player
		// TODO: Take rarity, or if it's trash into account.
		this.levelService.addExperience(player, target.weight * 10);

		this.playerLastSuccessfulDigCooldown.add(player);

		task.delay(this.SUCCESSFUL_DIG_COOLDOWN, () => {
			this.playerLastSuccessfulDigCooldown.delete(player);
		});
	}

	private dig(player: Player, target: Target) {
		const character = player.Character;
		if (!character || !character.Parent) return;

		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		this.playerDigCooldown.set(player, true);

		const cfg = shovelConfig[profile.Data.equippedShovel];
		assert(cfg, `Shovel config for ${profile.Data.equippedShovel} not found`);

		// Update the digging progress by incrementing the digProgress
		let digStrength = profile.Data.strength + cfg.strengthMult * BASE_SHOVEL_STRENGTH;

		if (this.gamepassService.ownsGamepass(player, gameConstants.GAMEPASS_IDS.x2Strength)) {
			digStrength *= 2;
		}

		target.digProgress += digStrength;
		const maxProgress = target.maxProgress;

		// Check if the target is fully dug
		if (target.digProgress >= maxProgress) {
			// Remove the target from the active targets
			target.activelyDigging = false;
			// print(`${player.Name} dug up ${target.name} with weight ${target.weight}`);

			this.endDigging(player);
			this.digSuccess(player, target);
		}

		// End dig cooldown
		task.delay(gameConstants.DIG_TIME_SEC, () => {
			this.playerDigCooldown.set(player, false);
		});
	}

	public endDigging(player: Player, reparentDetector = true) {
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

		Events.endDiggingServer.fire(player, target?.itemId);
		const character = player.Character;
		if (!character || !character.Parent) return;
		const humanoid = character.WaitForChild("Humanoid") as Humanoid;
		humanoid.WalkSpeed = 16;

		// Equip the metal detector back from their backpack and unequip the shovel
		const backpack = player.WaitForChild("Backpack");
		const shovel = character.FindFirstChild(profile.Data.equippedShovel);
		if (shovel && shovel.IsA("Tool") && (target?.usedLuckMult ?? 0) > 0) {
			shovel.Parent = backpack;
			const detector = backpack.FindFirstChild(profile.Data.equippedDetector) as Tool;
			if (detector) {
				// We use attributes to reliably replicate the last dig time in time for the client to see the parented
				detector.SetAttribute("LastSuccessfulDigTime", tick()); // For the client to know when they last successfully dug
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

		if (!profile) return false;

		const map = Maps.find((map) => map.Name === profile.Data.currentMap) as Folder | undefined;
		if (!map) return false;

		// Get the spawn bases from the map
		const spawnBaseFolder = map.WaitForChild("SpawnBases");
		const playerDetectorConfig = metalDetectorConfig[profile.Data.equippedDetector];

		const radius = BASE_DETECTOR_STRENGTH / playerDetectorConfig.strength;
		const randomScaleFactor = 0.75 + math.random() * 0.25; // Essentially ensures that the target is within 0.75-1x the detectors range
		const adjustedRadius = radius * randomScaleFactor;

		const playerPosition = player.Character?.PrimaryPart?.Position;

		if (!playerPosition) return false;

		const position = findFurthestPointWithinRadius(
			playerPosition,
			spawnBaseFolder.GetChildren().filter((inst) => inst.IsA("BasePart")),
			adjustedRadius,
		);

		if (!position) return false;

		const targetResult = this.createTarget(player, luckMult);
		if (!targetResult) return false;
		const [target] = targetResult;

		if (!target) return false;

		target.position = position;
		target.base = spawnBaseFolder.GetChildren()[
			this.rng.NextInteger(0, spawnBaseFolder.GetChildren().size() - 1)
		] as BasePart;
		target.mapName = map.Name;

		// Add the target to the active targets
		this.activeTargets.push(target);

		Events.targetSpawnSuccess.fire(player, position);
		Events.createWaypointVisualization(player, position, profile.Data.equippedDetector);

		return true;
	}

	private createTarget(player: Player, luckMult: number): [Target, keyof typeof mapConfig] | undefined {
		const profile = this.profileService.getProfile(player);

		if (!profile) {
			return;
		}

		const playerDetectorConfig = metalDetectorConfig[profile.Data.equippedDetector];

		const ADDED_LUCK_PERCENT = 0.02;
		const DETECTOR_LUCK_MODIFIER = 0.05;
		const LUCK_SKILL_LEVEL_ADDITION = 0.01;

		let totalLuck =
			(playerDetectorConfig.luck * DETECTOR_LUCK_MODIFIER + profile.Data.luck * LUCK_SKILL_LEVEL_ADDITION) *
			ADDED_LUCK_PERCENT *
			this.devproductService.serverLuckMultiplier(player) *
			luckMult;

		totalLuck = math.clamp(totalLuck, 0, 1);

		const targetData = this.rollTarget(profile.Data.currentMap, totalLuck);

		if (!targetData) {
			return;
		}

		const [name, targetConfig] = targetData;

		// Determine the weight of the target.
		const weightRange = targetConfig.baseWeight.Max - targetConfig.baseWeight.Min;
		const adjustedWeight = targetConfig.baseWeight.Min + weightRange * totalLuck;
		const weight = this.rng.NextNumber(targetConfig.baseWeight.Min, adjustedWeight);
		const maxProgress = weight * 20;

		const targetInstance = {
			...targetConfig,
			name,
			position: new Vector3(),
			weight,
			digProgress: maxProgress / 2, // Start at half progress
			maxProgress,
			activelyDigging: false,
			itemId: HttpService.GenerateGUID(),

			// We dont use these unless they are assigned and I don't want to fight the typechecker with partial types
			base: undefined as unknown as BasePart,
			mapName: profile.Data.currentMap,

			usedLuckMult: luckMult,
			owner: player,
		};

		return [targetInstance, profile.Data.currentMap];
	}

	private rollTarget(
		currentMap: keyof typeof mapConfig,
		addLuck: number,
	): [keyof typeof fullTargetConfig, TargetConfig] | undefined {
		// Retrieve the player's profile
		// Retrieve the map data based on the player's current map
		const mapData = mapConfig[currentMap];
		if (!mapData || !mapData.targetList) {
			return undefined;
		}

		// Initialize variables for cumulative weights
		let cumulativeWeight = 0;
		const cumulativeMap = new Map<keyof typeof fullTargetConfig, number>();

		// If luck is 0, they are getting trash buddy
		const cfg = addLuck > 0 ? targetConfig : trashConfig;

		// Adjust weights with scaling
		for (const [name, targetInfo] of pairs(cfg)) {
			if (!mapData.targetList.includes(name)) continue;

			// Apply the adjusted weight formula
			const weight = math.pow(1 / targetInfo.rarity, 1 - addLuck);
			cumulativeWeight += weight;
			cumulativeMap.set(name, cumulativeWeight);
		}

		if (cumulativeMap.size() === 0) {
			warn("No valid targets for the map:", currentMap);
			return undefined;
		}

		// Generate a random roll within the cumulative weight range
		const roll = this.rng.NextNumber(0, cumulativeWeight);

		// Find the matching target based on the roll
		let selectedTarget: keyof typeof fullTargetConfig | undefined;

		// Manually convert Map to an array of key-value pairs
		const mapArray: [string, number][] = [];
		for (const [key, value] of cumulativeMap) {
			mapArray.push([key, value]);
		}

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
		return [selectedTarget, cfg[selectedTarget]];
	}

	private _rollTarget2(
		currentMap: keyof typeof mapConfig,
		addLuck: number,
	): [keyof typeof fullTargetConfig, TargetConfig] | undefined {
		// 1) Retrieve the map data
		const mapData = mapConfig[currentMap];
		if (!mapData || !mapData.targetList) {
			return undefined;
		}

		// If luck is 0, they are getting "trash" items, else normal items
		const cfg = addLuck > 0 ? targetConfig : trashConfig;

		// 2) Compute each item's weight and build a cumulative sum
		let totalWeight = 0;
		const cumulativeMap = new Map<keyof typeof fullTargetConfig, number>();

		for (const [name, targetInfo] of pairs(cfg)) {
			// Skip items not in this map’s targetList
			if (!mapData.targetList.includes(name)) continue;

			// Example formula: weight = (1 / rarity) * addLuck
			// (Feel free to tweak or clamp addLuck as needed.)
			const weight = (1 / targetInfo.rarity) * (addLuck > 0 ? addLuck : 1);

			if (weight <= 0) continue; // Avoid weird edge cases

			totalWeight += weight;
			cumulativeMap.set(name, totalWeight);
		}

		if (cumulativeMap.size() === 0) {
			warn("No valid targets for the map:", currentMap);
			return undefined;
		}

		// 3) Roll a random number in [0, totalWeight)
		const roll = this.rng.NextNumber(0, totalWeight);

		// 4) Find the first item whose cumulative weight is >= roll
		// Convert to an array, then sort ascending by the cumulative sum
		let sortedCumulative: [keyof typeof fullTargetConfig, number][] = [...Object.entries(cumulativeMap)];
		sortedCumulative = Sift.Array.sort(sortedCumulative, (a, b) => a[1] > b[1]);

		let selectedTarget: keyof typeof fullTargetConfig | undefined;

		for (const [name, cumulative] of sortedCumulative) {
			if (roll <= cumulative) {
				selectedTarget = name;
				break;
			}
		}

		if (!selectedTarget) {
			// Theoretically shouldn't happen if totalWeight is correct,
			// but just in case:
			warn("Roll failed to match any target, roll =", roll);
			return undefined;
		}

		// 5) Return the chosen item + config
		return [selectedTarget, cfg[selectedTarget]];
	}

	private rollTargetWithLuck(
		currentMap: keyof typeof mapConfig,
		luck: number = 1,
	): [string, TargetConfig] | undefined {
		// Luck should be a positive number from 1 -> ∞ or 0 if rolling trash items.
		if ((luck < 1 && luck > 0) || luck < 0) {
			warn("Potentially invalid luck value:", luck);
		}

		// Retrieve the player's profile
		// Retrieve the map data based on the player's current map
		const mapData = mapConfig[currentMap];
		if (!mapData || !mapData.targetList) {
			return undefined;
		}
		// 1) Build a map of itemName → weight = (1 / rarity).
		//    Also accumulate totalWeight for all items.
		let totalWeight = 0;
		const weightMap = new Map<string, number>();

		let mapTargets = Sift.Array.shuffle(mapData.targetList);
		if (luck > 0) {
			mapTargets = mapTargets.filter((name) => targetConfig[name] !== undefined); // Filter out trash items
		}

		const targets: Record<string, TargetConfig> = {};

		mapTargets.forEach((element: string) => {
			targets[element] = fullTargetConfig[element];
		});

		for (const [itemName, config] of Object.entries(targets)) {
			if (config.rarity <= 0) {
				// Edge case: avoid dividing by zero or negative
				continue;
			}
			const weight = 1 / config.rarity;
			weightMap.set(itemName, weight);
			totalWeight += weight;
		}

		// 2) Generate a random float [0, totalWeight], then divide by luck
		const rawRoll = math.random() * totalWeight;
		const scaledRoll = rawRoll / luck;

		// 3) We want to find an item whose (weight) is > scaledRoll,
		//    but among those, it has the smallest weight.
		//    (Same logic as your Lua code.)
		let chosenItem: string | undefined = undefined;
		let smallestWeightAboveRoll = math.huge;

		for (const [itemName, weight] of Object.entries(weightMap)) {
			if (scaledRoll < weight && weight < smallestWeightAboveRoll) {
				smallestWeightAboveRoll = weight;
				chosenItem = itemName;
			}
		}

		// 4) If nothing matched, it means scaledRoll was bigger than all item weights
		if (chosenItem === undefined) {
			return undefined;
		}

		// Return the item name + the config
		return [chosenItem, targets[chosenItem]];
	}
}
