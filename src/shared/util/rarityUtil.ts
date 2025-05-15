//!optimize 2
import { gameConstants } from "shared/gameConstants";
import { Rarity } from "shared/networkTypes";

export const getOrderFromRarity = (rarity: Rarity, statValue: number = 0): number => {
	const rarityBase =
		rarity === "Secret"
			? 100000
			: rarity === "Mythical"
			? 200000
			: rarity === "Legendary"
			? 300000
			: rarity === "Epic"
			? 400000
			: rarity === "Rare"
			? 500000
			: rarity === "Uncommon"
			? 600000
			: rarity === "Common"
			? 700000
			: 800000;

	// Calculate offset based on the stat value (strength/luck)
	// Multiply by -100 to ensure higher stats appear first within the same rarity
	// Then round to ensure we get an integer
	const statOffset = statValue > 0 ? math.floor(-100 * statValue) : 0;

	// Return combined integer value (still ensuring higher stats are shown first)
	return rarityBase + statOffset;
};

export const potionSizeFromRarity = (rarity: Rarity): "Small" | "Medium" | "Large" | "Unknown" => {
	return rarity === "Common" ? "Small" : rarity === "Uncommon" ? "Medium" : rarity === "Rare" ? "Large" : "Unknown";
};
