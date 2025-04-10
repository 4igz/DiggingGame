import { Rarity } from "../networkTypes";

export const BASE_DETECTOR_STRENGTH = 175;

export interface MetalDetector {
	strength: number; // The distance at which you will find a target area
	rarityType: Rarity; // Rarity of the detector
	luck: number; // 0-100
	searchRadius: number; // Determines the radius that is provided to the player to find a nearby target.
	itemImage: string;
	price: number;

	notForSale?: boolean;
	obtainLocation?: string;
}

export type MetalDetectorModule = Readonly<Record<string, MetalDetector>>;

export const metalDetectorConfig: MetalDetectorModule;
