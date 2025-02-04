import { BoatConfig } from "./config/boatConfig";
import { MetalDetector } from "./config/metalDetectorConfig";
import { Shovel, shovelConfig } from "./config/shovelConfig";
import { targetConfig, TargetConfig } from "./config/targetConfig";

// What is actually saved in the player profile and replicated.
export interface TargetItem {
	itemId: string;
	weight: number;
	/**To keep data storage low, we only store the name of the target,
	 * then we can look up the target in the targetConfig for the rest of the data.  */
	name: keyof typeof targetConfig;
}

// What is spawned into the world.
export interface Target extends TargetConfig, TargetItem {
	position: Vector3;
	digProgress: number;
	maxProgress: number;
	activelyDigging: boolean;
	base: BasePart;
	mapName: string;
	owner: Player;

	/** The luck multiplier originally used to detect this target. */
	usedLuckMult: number;
}

export interface PlayerDigInfo {
	strength: number;
	shovel: keyof typeof shovelConfig;
}

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret";
export type ItemType = "MetalDetectors" | "Shovels" | "Target" | "Boats";
export type Item =
	| (
			| (MetalDetector & { type: "MetalDetectors" })
			| (Shovel & { type: "Shovels" })
			| (TargetItem & { type: "Target" })
	  ) & { name: string };

export type SkillName = "strength" | "luck" | "detection";

/**
 * Represents an EternityNum object, capable of handling very large numbers.
 */
export type EN = {
	/** The sign of the number (-1 for negative, 0 for zero, 1 for positive). */
	Sign: number;

	/** The layer of magnitude (e.g., exponential layer). */
	Layer: number;

	/** The exponent or value at the current layer. */
	Exp: number;
};
