import { Rarity } from "shared/networkTypes";

export const DEFAULT_BOAT_TURN_SPEED = 1000;
export const DEFAULT_BOAT_SPEED = 5000;

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

		speed: 1,
		turnSpeed: 2,
	},
};
