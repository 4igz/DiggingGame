import { Rarity } from "../networkTypes";

export const BASE_SHOVEL_STRENGTH = 10;

export interface Shovel {
	strengthMult: number;
	rarityType: Rarity;
	itemImage: string;
	shopOrder?: number;
	price: number;
}

export type ShovelModule = Readonly<Record<string, Shovel>>;

export const shovelConfig: ShovelModule = {
	StarterShovel: {
		strengthMult: 1,
		rarityType: "Common",
		itemImage: "rbxassetid://0",
		shopOrder: -2,
		price: 0,
	},
	CommonShovel: {
		strengthMult: 2,
		rarityType: "Common",
		itemImage: "rbxassetid://0",
		shopOrder: -1,
		price: 100,
	},
	SilverShovel: {
		strengthMult: 5,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://0",
		shopOrder: 0,
		price: 1000,
	},
	GoldShovel: {
		strengthMult: 2,
		rarityType: "Common",
		itemImage: "rbxassetid://128794152769876",
		shopOrder: 1,
		price: 300,
	},
	DiamondShovel: {
		strengthMult: 3,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://136978516797149",
		shopOrder: 2,
		price: 600,
	},
	AmethystShovel: {
		strengthMult: 4,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://119683045387995",
		shopOrder: 3,
		price: 1200,
	},
	RubyShovel: {
		strengthMult: 5,
		rarityType: "Rare",
		itemImage: "rbxassetid://73110422623441",
		shopOrder: 4,
		price: 2500,
	},
	EnchantedShovel: {
		strengthMult: 6,
		rarityType: "Rare",
		itemImage: "rbxassetid://85758965214115",
		shopOrder: 5,
		price: 5000,
	},
	HeavenlyShovel: {
		strengthMult: 7,
		rarityType: "Epic",
		itemImage: "rbxassetid://71013142206423",
		shopOrder: 6,
		price: 10000,
	},
	DemonicShovel: {
		strengthMult: 8,
		rarityType: "Epic",
		itemImage: "rbxassetid://96039792416627",
		shopOrder: 7,
		price: 20000,
	},
	CyberShovel: {
		strengthMult: 9,
		rarityType: "Legendary",
		itemImage: "rbxassetid://117964017384961",
		shopOrder: 8,
		price: 40000,
	},
	AlienShovel: {
		strengthMult: 10,
		rarityType: "Legendary",
		itemImage: "rbxassetid://77008112614651",
		shopOrder: 9,
		price: 80000,
	},
	MonsterShovel: {
		strengthMult: 11,
		rarityType: "Mythical",
		itemImage: "rbxassetid://100298589210123",
		shopOrder: 10,
		price: 150000,
	},
	PureShovel: {
		strengthMult: 12,
		rarityType: "Secret",
		itemImage: "rbxassetid://104047380050417",
		shopOrder: 11,
		price: 300000,
	},
};
