import { MetalDetector } from "./config/metalDetectorConfig";
import { Shovel, shovelConfig } from "./config/shovelConfig";
import { targetConfig, TargetConfig } from "./config/targetConfig";

export interface Target extends TargetConfig {
	name: keyof typeof targetConfig;
	position: Vector3;
	weight: number;
	digProgress: number;
	maxProgress: number;
	activelyDigging: boolean;
	itemId: string;
	base: BasePart;
	mapName: string;
	owner: Player;
}

export interface PlayerDigInfo {
	strength: number;
	shovel: keyof typeof shovelConfig;
}

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret";
export type ItemType = "MetalDetectors" | "Shovels" | "Target";
export type Item = (
	| (MetalDetector & { type: "MetalDetectors" })
	| (Shovel & { type: "Shovels" })
	| (Target & { type: "Target" })
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
