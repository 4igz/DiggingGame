import { Service, OnStart, OnTick, OnInit } from "@flamework/core";
import {
	CollectionService,
	HttpService,
	PhysicsService,
	Players,
	ReplicatedStorage,
	RunService,
	ServerStorage,
} from "@rbxts/services";
import { Events, Functions } from "server/network";
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

const targetTools = ServerStorage.WaitForChild("TargetTools");
const targetModels = ReplicatedStorage.WaitForChild("Assets").WaitForChild("TargetModels");

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
		PhysicsService.CollisionGroupSetCollidable(gameConstants.PLAYER_COLGROUP, gameConstants.PLAYER_COLGROUP, false);

		// Do some tests to make sure everything is in order.
		// Check if each target has a corresponding tool in TargetTools
		for (const model of targetModels.GetChildren()) {
			const targetName = model.Name;
			const tool = targetTools.FindFirstChild(targetName);
			if (!tool) {
				warn(`Target model '${targetName}' missing tool in ${targetTools.GetFullName()}`);
			}
			if (!fullTargetConfig[targetName]) {
				warn(`Target model '${targetName}' missing config`);
			}
			CollectionService.AddTag(model, "Treasure");
		}

		Players.PlayerRemoving.Connect((player) => {
			const target = this.getPlayerTarget(player);
			if (target) {
				const idx = this.activeTargets.findIndex((t) => t === target);
				if (idx !== -1) {
					this.activeTargets.remove(idx);
					// TODO: Replication event to remove the target from listening clients
				}
				this.playerDiggingTargets.delete(player);
				this.playerDigCooldown.delete(player);
			}
		});

		this.zoneService.changedMap.Connect((player, zoneName) => {
			const target = this.getPlayerTarget(player);
			if (target && target.mapName !== zoneName) {
				this.activeTargets = this.activeTargets.filter((t) => t !== target);
				this.playerDiggingTargets.delete(player);
				Events.targetDespawned.fire(player);
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
			const ownsSellEverywhere = this.gamepassService.ownsGamepass(
				player,
				gameConstants.GAMEPASS_IDS.SellEverywhere,
			);
			if (!ownsSellEverywhere) {
				// Ensure they're within range of a sell outpost
				const character = player.Character;
				if (!character) return;
				const currentPos = character.GetPivot().Position;
				let withinRange = false;
				for (const part of CollectionService.GetTagged("Sell")) {
					if (!part.IsA("BasePart")) continue;
					if (currentPos.sub(part.Position).Magnitude <= gameConstants.SHOP_PROMPT_RANGE * 1.2) {
						withinRange = true;
						break;
					}
				}
				// If they're not within range, don't sell
				// TODO: Let player know they need to be within range, incase they walked out of range
				if (!withinRange) return;
			}
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

		Signals.detectorInitialized.Connect((player, detector) => {
			detector.Unequipped.Connect(() => {
				// Sometimes the player will unequip the detector to equip their shovel before they reach the location.
				// We should NOT end the dig if this happens, and instead make them walk closer to the target.
				const target = this.getPlayerTarget(player);
				const character = player.Character;
				if (!character || !target) return;
				const distance = character.GetPivot().Position.sub(target.position).Magnitude;

				// If they are too far away, we should end the dig.
				const TOO_FAR_AWAY = gameConstants.DIG_RANGE * 4;
				if (distance > TOO_FAR_AWAY && !this.playerDiggingTargets.get(player)) {
					this.endDigging(player, true, false);
					return;
				}
			});
		});

		Events.endDiggingClient.connect((player) => {
			this.endDigging(player, true);
		});

		// "Dig Everywhere" dig request
		Functions.requestDigging.setCallback((player) => {
			if (this.playerLastSuccessfulDigCooldown.has(player)) return false;
			if (this.getPlayerTarget(player)) return false; // Why requesting to dig if they already have a target?

			const profile = this.profileService.getProfile(player);
			if (!profile) return false;

			// If the player has no target, it's likely because they're digging without detecting anything first.
			// Realistically, just digging in a a random spot would rarely yield anything of value.
			// We'll spawn a target, but it won't be good.
			const targetResult = this.createTarget(player, profile.Data.luck * gameConstants.LUCK_MODIFIER, true); // Spawn with 0 luck, which means it will be a trash item.
			if (targetResult === undefined) return false;
			const [target, mapName] = targetResult;
			const character = player.Character;
			if (!character) return false;

			const map = Maps.find((map) => map.Name === mapName) as Folder | undefined;
			if (!map) return false;

			// Check if inventory is full before we try doing anything
			if (profile.Data.targetInventory.size() >= profile.Data.inventorySize) {
				// This should only happen if their data is out of sync with the server
				// So sync them up here
				Events.updateInventorySize(player, profile.Data.inventorySize);
				return false;
			}

			const shovel = character.FindFirstChild(profile.Data.equippedShovel) as Tool;

			if (!shovel) {
				// They are trying to dig without a shovel equipped.
				// This is likely due to latency
				return false;
			}

			const spawnBaseFolder = map.WaitForChild("SpawnBases");

			const bases = spawnBaseFolder.GetChildren().filter((inst) => inst.IsA("BasePart"));
			const position = findFurthestPointWithinRadius(
				character.GetPivot().Position,
				bases,
				gameConstants.DIG_RANGE,
			);
			if (!position) {
				// Can't dig here probably.
				return false;
			}

			target.position = position;
			target.mapName = map.Name;

			// Add the target to the active targets
			this.activeTargets.push(target);
			Events.targetSpawnSuccess.fire(player, position);

			// Start digging immediately:
			Signals.startDigging.Fire(player, target);

			return true;
		});

		Events.dig.connect((player) => {
			if (this.playerDigCooldown.get(player)) {
				return;
			}

			let target = this.getPlayerTarget(player);
			if (!target) {
				return;
			}
			const targetDistance = player.Character?.GetPivot().Position.sub(target.position).Magnitude;
			if (targetDistance === undefined) {
				// This can happen when their character is destroyed, forex, they fell into void or reset.
				this.endDigging(player, true);
				return;
			}
			// Ensure exploiters can't dig from far away
			if (targetDistance > gameConstants.DIG_RANGE * 2) {
				// If we didn't end here, then their dig wouldn't end until the timer ran out and they would be stuck.
				this.endDigging(player, true);
				return;
			}

			this.dig(player, target);
		});
	}

	onTick(deltaTime: number): void {
		for (const [_player, target] of this.playerDiggingTargets) {
			if (!target.activelyDigging) continue;
			target.digProgress = math.max(
				0,
				target.digProgress - target.maxProgress * gameConstants.BAR_DECREASE_RATE * deltaTime,
			);

			if (target.digProgress <= 0) {
				this.endDigging(target.owner, true);
			}
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
			this.levelService.addExperience(player, extraTarget.weight * 10);
		}

		// Add experience to the player
		// TODO: Take rarity, or if it's trash into account.
		this.levelService.addExperience(player, target.weight * 10);

		this.playerLastSuccessfulDigCooldown.add(player);

		task.delay(gameConstants.SUCCESSFUL_DIG_COOLDOWN, () => {
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
		Events.replicateDig.except(player, {
			itemId: target.itemId,
			name: target.name,
			position: target.position,
			digProgress: target.digProgress,
			owner: player,
			mapName: target.mapName,
			maxProgress,
		});

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

	public endDigging(player: Player, failed: boolean = false, reparentDetector: boolean = true) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		const target = this.getPlayerTarget(player);

		const active = this.activeTargets.findIndex((t) => t === target);
		if (target && active !== -1) {
			// Remove the target from the active targets
			this.activeTargets.remove(active);
			Events.targetDespawned.fire(player);
			Events.endDigReplication.except(player, target.itemId);
		}

		this.playerDiggingTargets.delete(player);

		Events.endDiggingServer.fire(player, !failed, target?.itemId);
		const character = player.Character;
		if (!character || !character.Parent) return;
		const humanoid = character.WaitForChild("Humanoid") as Humanoid;
		humanoid.WalkSpeed = 16;

		// Equip the metal detector back from their backpack and unequip the shovel
		const backpack = player.WaitForChild("Backpack");
		const shovel = character.FindFirstChild(profile.Data.equippedShovel);
		if (shovel && shovel.IsA("Tool") && !target?.usingDigEverywhere && reparentDetector) {
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

		const playerPosition = player.Character?.GetPivot().Position;

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
		target.mapName = map.Name;

		// Add the target to the active targets
		this.activeTargets.push(target);

		Events.targetSpawnSuccess.fire(player, position);
		Events.createWaypointVisualization(player, position, profile.Data.equippedDetector);

		return true;
	}

	private createTarget(
		player: Player,
		luckMult: number,
		includeTrash: boolean = false,
	): [Target, keyof typeof mapConfig] | undefined {
		const profile = this.profileService.getProfile(player);

		if (!profile) {
			return;
		}

		const playerDetectorConfig = metalDetectorConfig[profile.Data.equippedDetector];

		const ADDED_LUCK_PERCENT = 0.02;
		const DETECTOR_LUCK_MODIFIER = 0.05;
		const LUCK_SKILL_LEVEL_ADDITION = gameConstants.LUCK_MODIFIER;

		let totalLuck =
			(playerDetectorConfig.luck * DETECTOR_LUCK_MODIFIER + profile.Data.luck * LUCK_SKILL_LEVEL_ADDITION) *
			ADDED_LUCK_PERCENT *
			this.devproductService.serverLuckMultiplier(player) *
			profile.Data.potionLuckMultiplier *
			luckMult;

		totalLuck = math.clamp(totalLuck, 0, 1);

		const targetData = this.rollTargetUsingWeights(profile.Data.currentMap, totalLuck, includeTrash);

		if (!targetData) {
			return;
		}

		const [name, targetConfig] = targetData;

		// Determine the weight of the target.
		const weightRange = targetConfig.baseWeight.Max - targetConfig.baseWeight.Min;
		const adjustedWeight = targetConfig.baseWeight.Min + weightRange * totalLuck;
		const weight = this.rng.NextNumber(targetConfig.baseWeight.Min, adjustedWeight);
		const maxProgress = weight * gameConstants.DIG_PROGRESS_MULTIPLIER;

		const targetInstance: Target = {
			...targetConfig,
			name,
			position: new Vector3(),
			weight,
			digProgress: maxProgress / 3, // Start at 1/3 progress
			maxProgress,
			activelyDigging: false,
			itemId: HttpService.GenerateGUID(),

			mapName: profile.Data.currentMap,

			usedLuckMult: luckMult,
			owner: player,
			usingDigEverywhere: includeTrash,
		};

		return [targetInstance, profile.Data.currentMap];
	}

	private rollTargetUsingWeights(
		currentMap: keyof typeof mapConfig,
		addLuck: number,
		includeTrash: boolean,
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
		const cfg = includeTrash ? fullTargetConfig : targetConfig;

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
}
