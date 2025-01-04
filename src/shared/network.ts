import { Networking } from "@flamework/networking";
import { EN, Item, ItemType, PlayerDigInfo, SkillName, Target } from "./networkTypes";
import { metalDetectorConfig } from "./config/metalDetectorConfig";
import { shovelConfig } from "./config/shovelConfig";
import { targetConfig } from "./config/targetConfig";

interface ClientToServerEvents {
	dig: () => void;
	sellAll: () => void;
	sellTarget: (id: string) => void;
	buyItem(
		itemType: Exclude<ItemType, "Target">,
		itemName: keyof typeof metalDetectorConfig | keyof typeof shovelConfig | keyof typeof targetConfig,
	): void;
	equipItem(itemType: ItemType, itemName: string): void;
	endDiggingClient: () => void;
	upgradeSkill: (skillName: SkillName) => void;
	equipTreasure: (targetName: string) => void;
	beginDetectorLuckRoll: () => void;
	endDetectorLuckRoll: () => void;
}

interface ServerToClientEvents {
	beginDigging: (target: Target, digInfo: PlayerDigInfo) => void;
	endDiggingServer: () => void;
	updateLuckRoll: (roll: number, serverTime: number) => void;
	targetSpawnSuccess(position: Vector3): void;
	targetDespawned(): void;
	createWaypointVisualization: (targetPosition: Vector3, detectorName: string, isNearby: boolean) => void;
	updateMoney: (money: string) => void;
	updateLevelUi: (level: number, experience: number, nextLevelExperience: number) => void;
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
}

interface ClientToServerFunctions {
	getMoneyShortString: () => string;
	getLevelData: () => { level: number; xp: number; xpMax: number };
	getInventory: (inventoryType: ItemType) => [
		{
			equippedShovel: keyof typeof shovelConfig;
			equippedDetector: keyof typeof metalDetectorConfig;
			equippedTreasure: keyof typeof targetConfig;
		},
		Array<Item>,
	];
	getSkills: () => Record<SkillName, number>;
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
