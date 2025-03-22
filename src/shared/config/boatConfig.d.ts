//!optimize 2
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

export const boatConfig: Record<string, BoatConfig>;
