import { Rarity } from "../networkTypes";

export interface TargetConfig {
	reqStrength: number; // Required strength to detect the target
	rarity: number; // The higher the chance, the less likely it will spawn
	baseWeight: NumberRange; // Base weight of the target
	basePrice: number; // Base sell price of the target
	rarityType: Rarity;
	itemImage: string;
}

export type TargetModule = Readonly<Record<string, TargetConfig>>;

export const targetConfig: TargetModule = {
	"Bag of coins": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://0",
	},
	Ring: {
		reqStrength: 10,
		rarity: 10,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 20,
		itemImage: "rbxassetid://0",
	},
	Necklace: {
		reqStrength: 15,
		rarity: 15,
		rarityType: "Common",
		baseWeight: new NumberRange(10, 30),
		basePrice: 30,
		itemImage: "rbxassetid://0",
	},
	"Treasure Chest": {
		reqStrength: 50,
		rarity: 500,
		rarityType: "Uncommon",
		baseWeight: new NumberRange(20, 100),
		basePrice: 100,
		itemImage: "rbxassetid://0",
	},
	Diamond: {
		reqStrength: 30,
		rarity: 500,
		rarityType: "Rare",
		baseWeight: new NumberRange(5, 15),
		basePrice: 500,
		itemImage: "rbxassetid://0",
	},
	"Ancient Artifact": {
		reqStrength: 100,
		rarity: 1000,
		rarityType: "Legendary",
		baseWeight: new NumberRange(20, 100),
		basePrice: 1000,
		itemImage: "rbxassetid://0",
	},
};
