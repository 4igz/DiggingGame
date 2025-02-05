import { Rarity } from "shared/networkTypes";

export const DEFAULT_BOAT_TURN_SPEED = 1000;
export const DEFAULT_BOAT_SPEED = 1000;

export interface BoatConfig {
	price: number;
	itemImage: string;
	speed: number;
	rarityType: Rarity;

	turnSpeed: number; // Not displayed anywhere, but different boats need to turn quicker than others depending on size.
}

export const boatConfig: Record<string, BoatConfig> = {
	["Wooden boat"]: {
		price: 1000,
		itemImage: "rbxassetid://119081046401633",
		rarityType: "Common",

		turnSpeed: 2,
		speed: 1,
	},
	["Raft"]: {
		price: 15000,
		itemImage: "rbxassetid://104891560607438",
		rarityType: "Common",

		turnSpeed: 5,
		speed: 2,
	},
	["Jetski"]: {
		price: 17000,
		itemImage: "rbxassetid://112528662391629",
		rarityType: "Uncommon",

		turnSpeed: 2,
		speed: 5,
	},
	["Turbo boat"]: {
		price: 20000,
		itemImage: "rbxassetid://85149294604733",
		rarityType: "Uncommon",

		turnSpeed: 5,
		speed: 7,
	},
	["Fishing boat"]: {
		price: 30000,
		itemImage: "rbxassetid://93418622283531",
		rarityType: "Rare",

		turnSpeed: 20,
		speed: 4,
	},
	["Deck boat"]: {
		price: 40000,
		itemImage: "rbxassetid://91008365917073",
		rarityType: "Legendary",

		turnSpeed: 30,
		speed: 10,
	},
	["Yacht"]: {
		price: 50000,
		itemImage: "rbxassetid://84685643148288",
		rarityType: "Mythical",

		turnSpeed: 100,
		speed: 20,
	},
};
