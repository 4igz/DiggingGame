import { MetalDetector, metalDetectorConfig } from "./config/metalDetectorConfig";
import { ItemType, Rarity } from "./networkTypes";
import { Shovel, shovelConfig } from "./config/shovelConfig";

export const gameConstants = {
	DIG_BAR_UI: "DiggingBar",
	SIDEBAR_UI: "SidebarUi",
	INVENTORY_MENU: "BackpackUi",
	TOOLBAR_UI: "ToolbarUi",
	MAIN_UI: "MainUi",
	RIGHT_SIDE_HUD: "Money",
	SELL_UI: "SellUi",
	SHOP_UI: "ShopUi",
	LUCKBAR_UI: "LuckBar",
	COMPASS_UI: "CompassUi",
	GAMEPASS_SHOP_UI: "GamepassShop",

	PLAYER_COLGROUP: "Player",
	DIRT_COLGROUP: "Dirt",

	DIG_RANGE: 5,
	DIG_TIME_SEC: 0.01, // Ratelimit the speed of digging

	// Maps itemType name to config
	SHOP_CONFIGS: {
		MetalDetectors: metalDetectorConfig,
		Shovels: shovelConfig,
	} as Record<ItemType, Readonly<Record<string, MetalDetector | Shovel>>>,

	DEVPRODUCT_IDS: {
		RefundPoints: 0,
		x2Luck: 2683149065,
		StarterPack: 2683148216,
		MoreDigging: 2683148761,
		MediumPack: 2683148387,
		"1k Money Pack": 2683146655,
		"2.5k Money Pack": 2683146887,
		"7.5k Money Pack": 2683147047,
		"15k Money Pack": 2683147418,
		"40k Money Pack": 2683147564,
		"75k Medium Money Pack": 2683147732,
		"250k Big Money Pack": 2683147863,
		"1M Massive Money Pack": 2683148034,
	},

	GAMEPASS_IDS: {
		x2Strength: 1014663108,
		x2Cash: 1015008881,
		x2Speed: 1038652835,
		BiggerBackpack: 1014776887,
		SellEverywhere: 1014879019,
	},

	RARITY_COLORS: {
		Common: new Color3(1, 1, 1),
		Uncommon: new Color3(0, 1, 0),
		Rare: new Color3(0, 0, 1),
		Epic: new Color3(0.5, 0, 1),
		Legendary: new Color3(1, 0.5, 0),
		Mythical: new Color3(1, 0, 0),
		Secret: new Color3(0.3, 0.3, 0.3),
	} as Record<Rarity, Color3>,

	RARITY_BACKGROUND_IMAGES: {
		Common: "rbxassetid://97770625093617",
		Uncommon: "rbxassetid://115961701437829",
		Rare: "rbxassetid://138485485031094",
		Epic: "rbxassetid://101550702784937",
		Legendary: "rbxassetid://132205041343382",
		Mythical: "rbxassetid://129739451092946",
	} as Record<Rarity, string>,

	MULTI_DIG_ANIMATION_SPRITESHEET: "rbxassetid://80311363716942",

	// MULTI_DIG_ANIMATION_LUT: [
	// 	"http://www.roblox.com/asset/?id=106506846640616",
	// 	"http://www.roblox.com/asset/?id=129839500155115",
	// 	"http://www.roblox.com/asset/?id=131463666526939",
	// 	"http://www.roblox.com/asset/?id=90514093194318",
	// 	"http://www.roblox.com/asset/?id=94488229451492",
	// 	"http://www.roblox.com/asset/?id=88493822484072",
	// ],
};
