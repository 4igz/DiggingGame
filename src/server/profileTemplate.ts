import { mapConfig } from "shared/config/mapConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { TargetItem } from "shared/networkTypes";
import { shovelConfig } from "shared/config/shovelConfig";
import { fullTargetConfig, targetConfig } from "shared/config/targetConfig";
import Object from "@rbxts/object-utils";
import { gameConstants } from "shared/constants";
import { boatConfig } from "shared/config/boatConfig";
import { last } from "@rbxts/sift/out/Array";
import { potionConfig } from "shared/config/potionConfig";

// Define the profile template and let TypeScript infer its type
export const profileTemplate = {
	equippedShovel: "StarterShovel" as keyof typeof shovelConfig,
	equippedDetector: "StarterDetector" as keyof typeof metalDetectorConfig,
	equippedTreasure: "" as keyof typeof targetConfig,
	currentMap: "Grasslands" as keyof typeof mapConfig,
	money: "0;10000",

	// Dailies
	lastDailyClaimed: 0,
	dailyStreak: 0,

	// Level data
	level: 1,
	experience: 0,

	// Skills
	skillPoints: 0,
	strength: 1,
	detection: 1,
	luck: 1,
	inventorySize: gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY,

	// Devproducts
	multiDigLevel: 0,

	// Luck multiplier
	potionLuckMultiplier: 1,
	activePotions: new Map<keyof typeof potionConfig, number>(),

	targetInventory: new Array<TargetItem>(),
	previouslyFoundTargets: new Set<keyof typeof targetConfig>(),
	detectorInventory: ["StarterDetector", "CommonDetector"] as Array<keyof typeof metalDetectorConfig>,
	shovelInventory: ["StarterShovel", "SilverShovel"] as Array<keyof typeof shovelConfig>,
	potionInventory: ["Small Luck Potion", "Large Luck Potion"] as Array<keyof typeof potionConfig>,

	ownedBoats: new Map(Object.keys(boatConfig).map((boatName) => [boatName, false])),
	ownedGamepasses: new Map(Object.keys(gameConstants.GAMEPASS_IDS).map((id) => [id, false])),

	isFirstJoin: true, // Replicated to client, then set to false. Subsequent joins will replicate false.
};

// Export the inferred type for use in other files
export type ProfileTemplate = typeof profileTemplate;

export default profileTemplate;
