import { MetalDetector, metalDetectorConfig } from "./config/metalDetectorConfig";
import { ItemType, Rarity, RewardType } from "./networkTypes";
import { Shovel, shovelConfig } from "./config/shovelConfig";
import { mapConfig } from "./config/mapConfig";

export const ROLL_TYPES = {
	Bad: "Bad..",
	Okay: "Okay.",
	Great: "Great!",
	Wow: "Wow!!",
	Super: "Super!!",
	Perfect: "PERFECT!!",
};

export const REWARD_IMAGES = {
	Money: "rbxassetid://96446480715038",
	LuckMultiplier: "rbxassetid://83833460426334",
} as Record<RewardType, string>;

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
	POPUP_UI: "ItemPopupUi",
	ISLE_POPUP_UI: "ZonePopupUi",
	BOAT_SHOP_UI: "BoatShopUi",
	DAILY_REWARD_UI: "DailyRewardUi",
	PLAYTIME_REWARD_UI: "PlaytimeRewardUi",

	PLAYER_COLGROUP: "Player",
	NOCHARACTERCOLLISION_COLGROUP: "NoCollideWithCharacters",
	BOAT_COLGROUP: "Boat",
	SPAWN_TAG: "MapSpawn",
	ISLE_ZONE_TAG: "IsleZone",

	SHOP_PROMPT_RANGE: 10,

	AUTO_DIG_FAILURE_THRESHOLD: 5, // If autodig fails this many times consecutively, it will teleport to the nearest map spawn to reset itself.
	SERVER_LUCK_MULTIPLIER_DURATION: 60 * 60, // 1 hour
	MAX_MULTIDIG_LEVEL: 6,
	DIG_RANGE: 5,
	DIG_TIME_SEC: 0.01, // Ratelimit the speed of digging
	AUTO_DIG_CLICK_INTERVAL: 0.1, // Seconds between each auto dig click
	POTION_DURATION: 300, // 5 minutes
	TARGET_INVENTORY_DEFAULT_CAPACITY: 100,
	BAR_DECREASE_RATE: 0.0005,

	// Skills modifiers
	STRENGTH_MODIFIER: 0.1,
	DETECTION_MODIFIER: 0.1,
	LUCK_MODIFIER: 0.1,

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
		// x2Speed: 1038652835,
		BiggerBackpack: 1014776887,
		SellEverywhere: 1014879019,
	},

	MAP_THEME_COLORS: {
		Grasslands: new Color3(0.03, 0.86, 0),
		Volcano: new Color3(0.86, 0.03, 0),
		Frozen: Color3.fromRGB(15, 151, 255),
	} as Record<keyof typeof mapConfig, Color3>,

	ROLL_LUCK_VALUES: {
		Bad: 0,
		Okay: 3,
		Great: 4.5,
		Wow: 6.5,
		Super: 9,
		Perfect: 9.9,
	} as Record<keyof typeof ROLL_TYPES, number>,

	HIGH_ROLL_THRESHOLD: 6.5,

	ROLL_COLORS: {
		Bad: new ColorSequence(new Color3(1, 1, 1), new Color3(0.35, 0.35, 0.35)),
		Okay: new ColorSequence(new Color3(0.2, 1, 0), new Color3(0, 0.9, 0)),
		Great: new ColorSequence(new Color3(0, 1, 1), new Color3(0, 0.8, 0.8)),
		Wow: new ColorSequence(new Color3(1, 0, 1), new Color3(0.8, 0, 0.8)),
		Super: new ColorSequence(new Color3(1, 0.5, 0), new Color3(1, 0.77, 0)),
		Perfect: new ColorSequence(new Color3(1, 0.15, 0), new Color3(1, 0.37, 0)),
	} as Record<keyof typeof ROLL_TYPES, ColorSequence>,

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

	INDEX_RARITY_BACKGROUND_IMAGES: {
		Uncommon: "rbxassetid://106616263841751",
		Rare: "rbxassetid://97508814457340",
		Legendary: "rbxassetid://115729927097630",
		Mythical: "rbxassetid://126358206935930",
	} as Record<Rarity, string>,

	MULTI_DIG_ANIMATION_SPRITESHEET: "rbxassetid://80311363716942",
};
