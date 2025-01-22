import { mapConfig } from "shared/config/mapConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { Target } from "shared/networkTypes";
import { shovelConfig } from "shared/config/shovelConfig";
import { targetConfig } from "shared/config/targetConfig";

// Define the profile template and let TypeScript infer its type
export const profileTemplate = {
	equippedShovel: "StarterShovel" as keyof typeof shovelConfig,
	equippedDetector: "StarterDetector" as keyof typeof metalDetectorConfig,
	equippedTreasure: "" as keyof typeof targetConfig,
	currentMap: "Grasslands" as keyof typeof mapConfig,
	money: "1;100",

	// Level data
	level: 1,
	experience: 0,

	// Skills
	skillPoints: 100,
	strength: 1,
	detection: 1,
	luck: 1,

	targetInventory: new Array<Target>(),
	detectorInventory: ["StarterDetector", "CommonDetector"] as Array<keyof typeof metalDetectorConfig>,
	shovelInventory: ["StarterShovel", "SilverShovel"] as Array<keyof typeof shovelConfig>,
};

// Export the inferred type for use in other files
export type ProfileTemplate = typeof profileTemplate;

export default profileTemplate;
