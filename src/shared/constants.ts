import { MetalDetector, metalDetectorConfig } from "./config/metalDetectorConfig";
import { ItemType, Rarity } from "./networkTypes";
import { Shovel, shovelConfig } from "./config/shovelConfig";

export const gameConstants = {
	DIG_BAR_UI: "DiggingBar",
	SIDEBAR_UI: "SidebarUi",
	INVENTORY_MENU: "BackpackUi",
	TOOLBAR_UI: "ToolbarUi",
	MAIN_UI: "MainUi",
	MONEY_UI: "Money",
	SELL_UI: "SellUi",
	SHOP_UI: "ShopUi",
	LUCKBAR_UI: "LuckBar",
	COMPASS_UI: "CompassUi",

	PLAYER_COLGROUP: "Player",
	DIRT_COLGROUP: "Dirt",

	DIG_RANGE: 5,
	DIG_TIME_SEC: 0.01, // Ratelimit the speed of digging

	SHOP_CONFIGS: {
		MetalDetectors: metalDetectorConfig,
		Shovels: shovelConfig,
	} as Record<ItemType, Readonly<Record<string, MetalDetector | Shovel>>>,

	RARITY_COLORS: {
		Common: new Color3(1, 1, 1),
		Uncommon: new Color3(0, 1, 0),
		Rare: new Color3(0, 0, 1),
		Epic: new Color3(0.5, 0, 1),
		Legendary: new Color3(1, 0.5, 0),
		Mythical: new Color3(1, 0, 0),
		Secret: new Color3(0.3, 0.3, 0.3),
	} as Record<Rarity, Color3>,
};
