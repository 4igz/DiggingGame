//!optimize 2
import { Rarity } from "shared/networkTypes";

const minute = 60;

export enum PotionKind {
	LUCK,
	STRENGTH,
}

export interface PotionConfig {
	kind: PotionKind;
	rarityType: Rarity;
	multiplier: number;
	duration: number;
	itemImage: string;
}

export const potionConfig: Record<string, PotionConfig> = {
	["S.Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 1.2,
		duration: minute * 5,
		itemImage: "rbxassetid://129013287605588",
		rarityType: "Common",
	},
	["M.Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 1.5,
		duration: minute * 10,
		itemImage: "rbxassetid://84624488885351",
		rarityType: "Uncommon",
	},
	["L.Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 2,
		duration: minute * 15,
		itemImage: "rbxassetid://105628174237609",
		rarityType: "Rare",
	},

	["S.Strength Potion"]: {
		kind: PotionKind.STRENGTH,
		multiplier: 1.2,
		duration: minute * 5,
		itemImage: "rbxassetid://129013287605588",
		rarityType: "Common",
	},
	["M.Strength Potion"]: {
		kind: PotionKind.STRENGTH,
		multiplier: 1.5,
		duration: minute * 10,
		itemImage: "rbxassetid://84624488885351",
		rarityType: "Uncommon",
	},
	["L.Strength Potion"]: {
		kind: PotionKind.STRENGTH,
		multiplier: 2,
		duration: minute * 15,
		itemImage: "rbxassetid://105628174237609",
		rarityType: "Rare",
	},
};
