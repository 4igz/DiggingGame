//!optimize 2
import { Rarity } from "shared/networkTypes";

export const getOrderFromRarity = (rarity: Rarity, modifier: number = 0): number => {
	return (
		(rarity === "Secret"
			? 100
			: rarity === "Mythical"
			? 200
			: rarity === "Legendary"
			? 300
			: rarity === "Epic"
			? 400
			: rarity === "Rare"
			? 500
			: rarity === "Uncommon"
			? 600
			: rarity === "Common"
			? 700
			: 0) - modifier
	);
};
