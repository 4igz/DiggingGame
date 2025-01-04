import { gameConstants } from "../constants";
import { Rarity } from "../networkTypes";

export interface ItemConfig {
	rarity: Rarity;
}

export const itemConfig: Readonly<Record<string, ItemConfig>> = {
	TestItem: {
		rarity: "Common",
	},
};
