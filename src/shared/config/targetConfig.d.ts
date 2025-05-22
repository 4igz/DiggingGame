import { Rarity } from "../networkTypes";

export interface TargetConfig {
	rarity: number; // The higher the chance, the less likely it will spawn
	baseWeight: NumberRange; // Base weight of the target
	basePrice: number; // Base sell price of the target
	rarityType: Rarity;
	itemImage: string;
	animationName?: string; // If not specified, will just be default tool animation.
	description?: string; // Optional description of the item
	indexRarity?: number; // Optional index rarity of the item
	hasCutscene?: boolean;
}

export type TargetModule = Readonly<Record<string, TargetConfig>>;

export const targetConfig: TargetModule;

// Where we store trash items, those that are obtained when the player has 0 luckMult
export const trashConfig: TargetModule;

export const fullTargetConfig: TargetModule;
