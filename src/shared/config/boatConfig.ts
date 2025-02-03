import { Rarity } from "shared/networkTypes";

export const DEFAULT_BOAT_SPEED = 25;

export interface BoatConfig {
	price: number;
	itemImage: string;
	speed: number;
	rarityType: Rarity;

	turnSpeed: number; // Not displayed anywhere, but different boats need to turn quicker than others depending on size.
}

export const boatConfig: Record<string, BoatConfig> = {
	Raft: {
		price: 1000,
		itemImage: "rbxassetid://113782765462239",
		rarityType: "Common",

		speed: 1,
		turnSpeed: 1,
	},
};
