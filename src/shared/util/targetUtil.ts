//!optimize 2
//!native
import { mapConfig } from "shared/config/mapConfig"; // your map data
import { fullTargetConfig, targetConfig, trashConfig } from "shared/config/targetConfig";

/**
 * Returns the first map where a given target item appears.
 *
 * @param itemName Name of item to find map for.
 * @returns
 */
export function getMapFromTarget(itemName: string): string | undefined {
	for (const [mapName, mapData] of pairs(mapConfig)) {
		if (mapData.targetList.includes(itemName as keyof typeof targetConfig)) {
			return mapName;
		}
	}
	return undefined;
}

/**
 * Returns a "1 in X" chance for an item on a specific map,
 * factoring in whether luck is applied (i.e., targetConfig vs trashConfig).
 *
 * @param itemName The name of the item to compute the chance for.
 * @param mapName The current map name the player is on.
 * @param addLuck The player's luck. "1" means normal rarity weighting,
 *                higher > 1 intensifies it, 0 uses trashConfig.
 */
export function getOneInXChance(itemName: string, mapName: string, addLuck: number = 1): number {
	// 1) Find the map data
	const mapData = mapConfig[mapName];
	if (!mapData) {
		warn(`No map data found for '${mapName}'`);
		return 0;
	}
	const allowedItems = mapData.targetList;
	if (!allowedItems || allowedItems.size() === 0) {
		warn(`No targetList for map '${mapName}'`);
		return 0;
	}

	const cfg = trashConfig[itemName] ? fullTargetConfig : targetConfig;

	if (!allowedItems.includes(itemName as keyof typeof cfg)) {
		return 0;
	}

	let totalWeight = 0;
	for (const [name, info] of pairs(cfg)) {
		if (allowedItems.includes(name)) {
			const weight = math.pow(1 / info.rarity, addLuck);
			totalWeight += weight;
		}
	}

	// 5) Calculate the target item's weight
	const itemConfig = cfg[itemName as keyof typeof cfg];
	if (!itemConfig) {
		return 0;
	}
	const itemWeight = math.pow(1 / itemConfig.rarity, addLuck);

	// 6) Probability = itemWeight / totalWeight
	const probability = itemWeight / totalWeight;

	// Convert to "1 in X"
	const oneInX = math.ceil(1 / probability);
	return oneInX;
}
