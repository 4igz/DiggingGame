//!optimize 2
//!native

import { MarketplaceService } from "@rbxts/services";

// Define a cache to store developer product info
const cachedProducts = new Map<number, DeveloperProductInfo | GamePassProductInfo>();

/**
 * Retrieves developer product info from an ID and caches the result.
 * @param productId - The ID of the developer product to fetch info for.
 * @returns A Promise resolving to the DeveloperProductInfo.
 */
export async function getDeveloperProductInfo(
	productId: number,
	productType: Enum.InfoType.Product | Enum.InfoType.GamePass,
): Promise<DeveloperProductInfo | GamePassProductInfo | undefined> {
	// Check if the info is already in the cache
	const cachedInfo = cachedProducts.get(productId);
	if (cachedInfo) {
		return cachedInfo;
	}

	try {
		// Fetch product info using the Roblox API
		const info = MarketplaceService.GetProductInfo(productId, productType) as
			| DeveloperProductInfo
			| GamePassProductInfo
			| undefined;

		if (info !== undefined) {
			// Cache the result
			cachedProducts.set(productId, info);

			return info;
		} else {
			throw `Invalid data for product ID: ${productId}`;
		}
	} catch (err) {
		warn(`[getDeveloperProductInfo] Error fetching product info: ${tostring(err)}`);
	}
}
