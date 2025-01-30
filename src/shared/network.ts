import { Networking } from "@flamework/networking";
import { Item, ItemType, PlayerDigInfo, SkillName, Target } from "./networkTypes";
import { metalDetectorConfig } from "./config/metalDetectorConfig";
import { shovelConfig } from "./config/shovelConfig";
import { fullTargetConfig, targetConfig } from "./config/targetConfig";
import { gameConstants } from "./constants";

interface ClientToServerEvents {
	dig: () => void;
	sellAll: () => void;
	sellTarget: (id: string) => void;
	buyItem(
		itemType: Exclude<ItemType, "Target">,
		itemName: keyof typeof metalDetectorConfig | keyof typeof shovelConfig | keyof typeof targetConfig,
	): void;
	equipItem(itemType: Exclude<ItemType, "Target">, itemName: string): void;
	/** Used for cancelling digging and cancelling detecting a target. */
	endDiggingClient: () => void;
	upgradeSkill: (skillName: SkillName) => void;
	equipTreasure: (targetName: string) => void;
	beginDetectorLuckRoll: () => void;
	endDetectorLuckRoll: () => void;
	/** A bit dumb, but we assume player rolls a 10 luck detector automatically here */
	nextTargetAutoDigger: () => void;
}

interface ServerToClientEvents {
	beginDigging: (target: Target, digInfo: PlayerDigInfo) => void;
	endDiggingServer: (itemId?: string) => void;
	targetAdded: (itemName: keyof typeof fullTargetConfig, weight: number) => void;
	updateLuckRoll: (roll: number, serverTime: number) => void;
	targetSpawnSuccess(position: Vector3): void;
	targetDespawned(): void;
	createWaypointVisualization: (targetPosition: Vector3, detectorName: string, isNearby: boolean) => void;
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
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
