import { targetConfig } from "./targetConfig";

interface MapConfig {
	targetList: Array<keyof typeof targetConfig>;
	requiredLuck: number;
}

export const mapConfig: Record<string, MapConfig> = {
	Grasslands: {
		targetList: ["Treasure Chest", "Ring", "Necklace", "Diamond", "Bag of coins", "Ancient Artifact"],
		requiredLuck: 0,
	},
	Volcano: {
		targetList: ["Ring", "Necklace", "Diamond", "Bag of coins", "Ancient Artifact", "Dragon Egg"],
		requiredLuck: 100,
	},
};
