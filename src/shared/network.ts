import { Networking } from "@flamework/networking";
import { Item, ItemType, NetworkedTarget, PlayerDigInfo, QuestProgress, SkillName, Target } from "./networkTypes";
import { MetalDetector, metalDetectorConfig } from "./config/metalDetectorConfig";
import { Shovel, shovelConfig } from "./config/shovelConfig";
import { fullTargetConfig, targetConfig } from "./config/targetConfig";
import { gameConstants } from "./constants";
import { mapConfig } from "./config/mapConfig";
import { BoatConfig, boatConfig } from "./config/boatConfig";
import { potionConfig } from "./config/potionConfig";
import { questConfig, QuestRewardType } from "./config/questConfig";

interface ClientToServerEvents {
	dig: () => void;
	sellAll: () => void;
	sellTarget: (id: string) => void;
	buyItem(
		itemType: Exclude<Exclude<ItemType, "Target">, "Boats">,
		itemName: keyof typeof metalDetectorConfig | keyof typeof shovelConfig | keyof typeof targetConfig,
	): void;
	buyBoat(boatName: keyof typeof boatConfig): void;
	equipItem(itemType: Exclude<Exclude<ItemType, "Target">, "Boats">, itemName: string): void;
	drinkPotion(potionName: keyof typeof potionConfig): void;
	/** Used for cancelling digging and cancelling detecting a target. */
	endDiggingClient: () => void;
	upgradeSkill: (skillName: SkillName) => void;
	equipTreasure: (targetName: string) => void;
	beginDetectorLuckRoll: () => void;
	endDetectorLuckRoll: () => void;
	/** A bit dumb, but we assume player rolls a 10 luck detector automatically here */
	nextTargetAutoDigger: () => void;
	spawnBoat: (boatName: keyof typeof boatConfig) => void;
	teleportSuccess: () => void;
	claimDailyReward: () => void;
	startNextQuest: (questName: keyof typeof questConfig) => void;

	// Anti exploit event
	selfReport: (flag: string) => void;
}

interface ServerToClientEvents {
	beginDigging: (target: NetworkedTarget, digInfo: PlayerDigInfo) => void;
	endDiggingServer: (diggingComplete: boolean, itemId?: string) => void;
	targetAdded: (itemName: keyof typeof fullTargetConfig, weight: number, mapName: keyof typeof mapConfig) => void;
	updateLuckRoll: (roll: number, serverTime: number) => void;
	targetSpawnSuccess(position: Vector3): void;
	targetDespawned(): void;
	targetSpawnFailure(): void;
	createWaypointVisualization: (targetPosition: Vector3, detectorName: string) => void;
	updateMoney: (money: string) => void;
	updateLevelUi: (level: number, experience: number, nextLevelExperience: number, skillPoints: number) => void;
	updateInventory: (
		inventoryType: ItemType,
		inventory: [
			{
				equippedShovel: keyof typeof shovelConfig;
				equippedDetector: keyof typeof metalDetectorConfig;
				equippedTreasure: keyof typeof targetConfig;
			},
			Array<Item>,
		],
	) => void;
	updateSkills: (skills: Record<SkillName, number>) => void;
	updateMultiDigLevel: (level: number) => void;
	updateServerLuckMultiplier: (multiplier: 1 | 2, timeLeft: number) => void;
	updateUnlockedTargets: (unlockedTargets: Set<keyof typeof targetConfig>) => void;
	updateBoatInventory: (ownedBoats: Map<keyof typeof boatConfig, boolean>) => void;
	soldItem: (
		itemName: keyof typeof fullTargetConfig,
		itemRarity: keyof typeof gameConstants.RARITY_COLORS,
		sellAmount: number,
	) => void;
	soldAllItems: (count: number, sellAmount: number) => void;
	boughtItem: (itemName: string, itemType: ItemType, itemConfig: Shovel | MetalDetector | BoatConfig) => void;
	purchaseFailed: (itemType: ItemType) => void;
	teleportToIsland: (islandName: keyof typeof mapConfig) => void;
	updateDailyStreak: (streak: number, lastClaimTime: number) => void;
	updateInventorySize: (size: number) => void;
	updateTreasureCount: (count: number) => void;
	updateOwnedGamepasses: (ownedGamepasses: Map<keyof typeof gameConstants.GAMEPASS_IDS, boolean>) => void;
	levelUp: (newLevel: number) => void;
	boughtPlaytimeRewardSkip: () => void;
	updateQuestProgress: (questProgress: Map<keyof typeof questConfig, QuestProgress>) => void;
	profileReady: () => void;
	replicateDig: (target: NetworkedTarget) => void;
	endDigReplication: (itemId: string) => void;
}

interface ClientToServerFunctions {
	getMoneyShortString: () => string;
	getLevelData: () => { level: number; xp: number; xpMax: number; skillPoints: number };
	getInventory: (inventoryType: ItemType) => [
		{
			equippedShovel: keyof typeof shovelConfig;
			equippedDetector: keyof typeof metalDetectorConfig;
			equippedTreasure: keyof typeof targetConfig;
		},
		Array<Item>,
	];
	getSkills: () => Record<SkillName, number>;
	getOwnedGamepasses: () => Map<keyof typeof gameConstants.GAMEPASS_IDS, boolean>;
	getMultiDigLevel: () => number;
	getUnlockedTargets: () => Set<keyof typeof targetConfig>;
	getOwnedBoats: () => Map<keyof typeof boatConfig, boolean>;
	getOwnsBoat: (boatName: keyof typeof boatConfig) => boolean;
	getLastDailyClaimTime: () => number | undefined;
	getDailyStreak: () => number | undefined;
	getInventorySize: () => number;
	claimPlaytimeReward: (rewardIndex: number) => boolean;
	getQuestProgress: () => Map<keyof typeof questConfig, QuestProgress> | undefined;
	isQuestComplete: (questName: keyof typeof questConfig) => boolean;
	requestTurnInQuest: (questName: keyof typeof questConfig) => boolean;
	requestDigging: () => boolean;
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
