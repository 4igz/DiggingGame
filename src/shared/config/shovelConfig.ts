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
		itemImage: "rbxassetid://86157037222201",
		shopOrder: -2,
		price: 0,
	},
	CommonShovel: {
		strengthMult: 2,
		rarityType: "Common",
		itemImage: "rbxassetid://94770951918498",
		shopOrder: -1,
		price: 100,
	},
	SilverShovel: {
		strengthMult: 5,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://84978234143786",
		shopOrder: 0,
		price: 1000,
	},
	GoldShovel: {
		strengthMult: 2,
		rarityType: "Common",
		itemImage: "rbxassetid://133385114213421",
		shopOrder: 1,
		price: 300,
	},
	DiamondShovel: {
		strengthMult: 3,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://80305961963756",
		shopOrder: 2,
		price: 600,
	},
	AmethystShovel: {
		strengthMult: 4,
		rarityType: "Uncommon",
		itemImage: "rbxassetid://137452283112320",
		shopOrder: 3,
		price: 1200,
	},
	RubyShovel: {
		strengthMult: 5,
		rarityType: "Rare",
		itemImage: "rbxassetid://128554784882437",
		shopOrder: 4,
		price: 2500,
	},
	EnchantedShovel: {
		strengthMult: 6,
		rarityType: "Rare",
		itemImage: "rbxassetid://137008399562821",
		shopOrder: 5,
		price: 5000,
	},
	HeavenlyShovel: {
		strengthMult: 7,
		rarityType: "Epic",
		itemImage: "rbxassetid://115558690172113",
		shopOrder: 6,
		price: 10000,
	},
	DemonicShovel: {
		strengthMult: 8,
		rarityType: "Epic",
		itemImage: "rbxassetid://77934386944359",
		shopOrder: 7,
		price: 20000,
	},
	CyberShovel: {
		strengthMult: 9,
		rarityType: "Legendary",
		itemImage: "rbxassetid://129273316911656",
		shopOrder: 8,
		price: 40000,
	},
	AlienShovel: {
		strengthMult: 10,
		rarityType: "Legendary",
		itemImage: "rbxassetid://109719408760835",
		shopOrder: 9,
		price: 80000,
	},
	MonsterShovel: {
		strengthMult: 11,
		rarityType: "Mythical",
		itemImage: "rbxassetid://76160408546441",
		shopOrder: 10,
		price: 150000,
	},
	PureShovel: {
		strengthMult: 12,
		rarityType: "Secret",
		itemImage: "rbxassetid://117172719154128",
		shopOrder: 11,
		price: 300000,
	},
};
