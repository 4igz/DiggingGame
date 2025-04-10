import { Rarity } from "../networkTypes";

export const BASE_SHOVEL_STRENGTH = 1;

export interface Shovel {
	strengthMult: number;
	rarityType: Rarity;
	itemImage: string;
	price: number;

	notForSale?: boolean;
	obtainLocation?: string;
}

export type ShovelModule = Readonly<Record<string, Shovel>>;

export const shovelConfig: ShovelModule;
