//!optimize 2
import { Rarity } from "shared/networkTypes";

enum PotionKind {
	LUCK,
}

export interface PotionConfig {
	kind: PotionKind;
	rarityType: Rarity;
	multiplier: number;
	itemImage: string;
}

export const potionConfig: Record<string, PotionConfig> = {
	["Small Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 1.2,
		itemImage: "rbxassetid://93760012973987",
		rarityType: "Common",
	},
	["Medium Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 1.5,
		itemImage: "rbxassetid://79594618973792",
		rarityType: "Uncommon",
	},
	["Large Luck Potion"]: {
		kind: PotionKind.LUCK,
		multiplier: 2,
		itemImage: "rbxassetid://130939767297479",
		rarityType: "Rare",
	},
};
