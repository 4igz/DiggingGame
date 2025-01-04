import { targetConfig } from "./targetConfig";

interface MapConfig {
	targetList: Array<keyof typeof targetConfig>;
	targetCount: number;
}

export const mapConfig: Record<string, MapConfig> = {
	Grasslands: {
		targetList: ["Treasure Chest", "Ring", "Necklace", "Diamond", "Bag of coins", "Ancient Artifact"],
		targetCount: 5,
	},
};
