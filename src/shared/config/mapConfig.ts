import Object from "@rbxts/object-utils";
import { targetConfig, trashConfig } from "./targetConfig";

export const difficulties = {
	Easy: new Color3(0, 1, 0),
	Medium: new Color3(1, 0.5, 0),
	Hard: new Color3(1, 0, 0),
};

interface MapConfig {
	targetList: Array<keyof typeof targetConfig>;
	requiredStrength: number;
	difficulty: keyof typeof difficulties;
}

export const mapConfig: Record<string, MapConfig> = {
	Grasslands: {
		targetList: [
			"Treasure Chest",
			"Ring",
			"Necklace",
			"Diamond",
			"Bag of coins",
			"Ancient Artifact",
			...Object.keys(trashConfig),
		],
		requiredStrength: 0,
		difficulty: "Easy",
	},

	Volcano: {
		targetList: [
			"Volcano rock",
			"Volcano's tear",
			"Ammonoids",
			"Heat rock",
			"Lava bucket",
			"Obsidian shard",
			"Coal artifact",
			...Object.keys(trashConfig),
		],
		requiredStrength: 100,
		difficulty: "Medium",
	},

	Frozen: {
		targetList: [
			"Ice shard",
			"Old mitten",
			"Sapphire gem",
			"Viking dagger",
			"Viking sword",
			...Object.keys(trashConfig),
		],
		requiredStrength: 500,
		difficulty: "Hard",
	},
};
