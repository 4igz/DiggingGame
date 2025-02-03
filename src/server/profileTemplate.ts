import { mapConfig } from "shared/config/mapConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { TargetItem } from "shared/networkTypes";
import { shovelConfig } from "shared/config/shovelConfig";
import { fullTargetConfig, targetConfig } from "shared/config/targetConfig";
import Object from "@rbxts/object-utils";
import { gameConstants } from "shared/constants";
import { boatConfig } from "shared/config/boatConfig";

// Define the profile template and let TypeScript infer its type
export const profileTemplate = {
	equippedShovel: "StarterShovel" as keyof typeof shovelConfig,
	equippedDetector: "StarterDetector" as keyof typeof metalDetectorConfig,
	equippedTreasure: "" as keyof typeof targetConfig,
	currentMap: "Grasslands" as keyof typeof mapConfig,
	money: "1;10",

	// Level data
	level: 1,
	experience: 0,

	// Skills
	skillPoints: 100,
	strength: 1,
	detection: 1,
	luck: 1,

	// Devproducts
	multiDigLevel: 0,

	targetInventory: new Array<TargetItem>(),
	previouslyFoundTargets: new Set<keyof typeof targetConfig>(),
	detectorInventory: ["StarterDetector", "CommonDetector"] as Array<keyof typeof metalDetectorConfig>,
	shovelInventory: ["StarterShovel", "SilverShovel"] as Array<keyof typeof shovelConfig>,

	ownedBoats: new Map(Object.keys(boatConfig).map((boatName) => [boatName, false])),
	ownedGamepasses: new Map(Object.keys(gameConstants.GAMEPASS_IDS).map((id) => [id, false])),
};

// Export the inferred type for use in other files
export type ProfileTemplate = typeof profileTemplate;

export default profileTemplate;
