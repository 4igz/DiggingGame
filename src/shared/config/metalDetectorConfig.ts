import { Rarity } from "../networkTypes";

export const BASE_DETECTOR_STRENGTH = 175;

export interface MetalDetector {
	strength: number; // The distance at which you will find a target area
	rarityType: Rarity; // Rarity of the detector
	luck: number; // 0-1
	searchRadius: number; // Determines the radius that is provided to the player to find a nearby target.
	itemImage: string;
	price: number;
	shopOrder?: number;
}

export type MetalDetectorModule = Readonly<Record<string, MetalDetector>>;

export const metalDetectorConfig: MetalDetectorModule = {
	StarterDetector: {
		strength: 1,
		luck: 0,
		searchRadius: 50,
		itemImage: "rbxassetid://108661613310540",
		rarityType: "Common",
		price: 0,
		shopOrder: -2,
	},
	CommonDetector: {
		strength: 1.5,
		luck: 1,
		searchRadius: 50,
		itemImage: "rbxassetid://123445201960643",
		rarityType: "Uncommon",
		price: 100,
		shopOrder: -1,
	},
	// SilverDetector: {
	// 	strength: 2,
	// 	luck: 1,
	// 	searchRadius: 50,
	// 	itemImage: "rbxassetid://0",
	// 	rarityType: "Uncommon",
	// 	price: 1000,
	// 	shopOrder: 0,
	// },
	GoldDetector: {
		strength: 2,
		luck: 0.1,
		searchRadius: 60,
		itemImage: "rbxassetid://123726628867857",
		rarityType: "Common",
		price: 500,
		shopOrder: 1,
	},
	DiamondDetector: {
		strength: 3,
		luck: 0.2,
		searchRadius: 65,
		itemImage: "rbxassetid://111376990320136",
		rarityType: "Uncommon",
		price: 1000,
		shopOrder: 2,
	},
	AmethystDetector: {
		strength: 4,
		luck: 0.3,
		searchRadius: 70,
		itemImage: "rbxassetid://139875368014727",
		rarityType: "Uncommon",
		price: 2500,
		shopOrder: 3,
	},
	RubyDetector: {
		strength: 5,
		luck: 0.4,
		searchRadius: 75,
		itemImage: "rbxassetid://117934543088369",
		rarityType: "Rare",
		price: 5000,
		shopOrder: 4,
	},
	EnchantedDetector: {
		strength: 6,
		luck: 0.5,
		searchRadius: 80,
		itemImage: "rbxassetid://118495594910510",
		rarityType: "Rare",
		price: 10000,
		shopOrder: 5,
	},
	HeavenlyDetector: {
		strength: 7,
		luck: 0.6,
		searchRadius: 85,
		itemImage: "rbxassetid://120481505185960",
		rarityType: "Epic",
		price: 20000,
		shopOrder: 6,
	},
	DemonicDetector: {
		strength: 8,
		luck: 0.7,
		searchRadius: 90,
		itemImage: "rbxassetid://106667142719773",
		rarityType: "Epic",
		price: 50000,
		shopOrder: 7,
	},
	CyberDetector: {
		strength: 9,
		luck: 0.8,
		searchRadius: 95,
		itemImage: "rbxassetid://91292725797639",
		rarityType: "Legendary",
		price: 100000,
		shopOrder: 8,
	},
	AlienDetector: {
		strength: 10,
		luck: 0.9,
		searchRadius: 100,
		itemImage: "rbxassetid://74608225119992",
		rarityType: "Legendary",
		price: 250000,
		shopOrder: 9,
	},
	MonsterDetector: {
		strength: 11,
		luck: 1,
		searchRadius: 105,
		itemImage: "rbxassetid://96492297652952",
		rarityType: "Mythical",
		price: 500000,
		shopOrder: 10,
	},
	PureDetector: {
		strength: 12,
		luck: 1.1,
		searchRadius: 110,
		itemImage: "rbxassetid://137152701253651",
		rarityType: "Secret",
		price: 1000000,
		shopOrder: 11,
	},
};
