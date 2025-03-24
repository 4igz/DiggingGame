--!optimize 2
--!native
local ReplicatedStorage = game:GetService("ReplicatedStorage")
-- Compiled with roblox-ts v3.0.0
local boatConfig = require(ReplicatedStorage.TS.config.boatConfig)
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local metalDetectorConfig =
	TS.import(script, game:GetService("ReplicatedStorage"), "TS", "config", "metalDetectorConfig").metalDetectorConfig
local shovelConfig =
	TS.import(script, game:GetService("ReplicatedStorage"), "TS", "config", "shovelConfig").shovelConfig
local ROLL_TYPES = {
	Bad = "Bad..",
	Okay = "Okay.",
	Great = "Great!",
	Wow = "Wow!!",
	Super = "Super!!",
	Perfect = "PERFECT!!",
}
local REWARD_IMAGES = {
	Money = "rbxassetid://96446480715038",
	LuckMultiplier = "rbxassetid://83833460426334",
}
local gameConstants = {
	-- Gameplay constants
	DIG_PROGRESS_MULTIPLIER = 20,
	SHOP_PROMPT_RANGE = 10,
	AUTO_DIG_FAILURE_THRESHOLD = 5,
	SERVER_LUCK_MULTIPLIER_DURATION = 60 * 60,
	MAX_MULTIDIG_LEVEL = 6,
	DIG_RANGE = 5,
	DIG_TIME_SEC = 1 / 20,
	BATCH_SEND_INTERVAL = 1 / 3,
	AUTO_DIG_CLICK_INTERVAL = 0.2,
	POTION_DURATION = 300,
	BAR_DECREASE_RATE = 0.05,
	HIGH_ROLL_THRESHOLD = 6.5,
	SUCCESSFUL_DIG_COOLDOWN = 1, -- Prevent player from immediately digging again after just finishing digging
	MAX_DIG_REPLICATE_DISTANCE = 200,

	-- Player Stats
	LEVEL_INCREASE_EXPONENT = 1.01, -- math.floor(BASE_EXP * currentLevel^LEVEL_INCREASE_EXPONENT)
	BASE_EXP = 100,

	TARGET_INVENTORY_DEFAULT_CAPACITY = 50,
	BIGGER_BACKPACK_SIZE_MODIFIER = 2,

	-- Skills modifiers
	STRENGTH_MODIFIER = 0.1,
	DETECTION_MODIFIER = 0.1,
	LUCK_MODIFIER = 0.1,

	SHOP_CONFIGS = {
		MetalDetectors = metalDetectorConfig,
		Shovels = shovelConfig,
		Boats = boatConfig.boatConfig,
	},

	DEVPRODUCT_IDS = {
		x2Luck = 3236554282,
		StarterPack = 3236554871,
		MoreDigging = 3236554633,
		MediumPack = 3236554589,
		RefundPoints = 3236554800,
		["2.5k Money Pack"] = 3236554045,
		["7.5k Money Pack"] = 3236554465,
		["15k Money Pack"] = 3236553863,
		["40k Money Pack"] = 3236554350,
		["75k Medium Money Pack"] = 3236554527,
		["250k Big Money Pack"] = 3236554148,
		["1M Massive Money Pack"] = 3236553972,
		["Unlock All Playtime Rewards"] = 3236554940,
	},

	GAMEPASS_IDS = {
		BiggerBackpack = 1098304454,
		SellEverywhere = 1098278343,
		x2Strength = 1097762136,
		x2Luck = 1098158597,
		x2Cash = 1098088676,
	},

	MAP_THEME_COLORS = {
		Grasslands = Color3.new(0.03, 0.86, 0),
		Volcano = Color3.new(0.86, 0.03, 0),
		Frozen = Color3.fromRGB(15, 151, 255),
	},

	ROLL_LUCK_VALUES = {
		Bad = 0,
		Okay = 3,
		Great = 4.5,
		Wow = 6.5,
		Super = 9,
		Perfect = 9.9,
	},

	ROLL_COLORS = {
		Bad = ColorSequence.new(Color3.new(1, 1, 1), Color3.new(0.35, 0.35, 0.35)),
		Okay = ColorSequence.new(Color3.new(0.2, 1, 0), Color3.new(0, 0.9, 0)),
		Great = ColorSequence.new(Color3.new(0, 1, 1), Color3.new(0, 0.8, 0.8)),
		Wow = ColorSequence.new(Color3.new(1, 0, 1), Color3.new(0.8, 0, 0.8)),
		Super = ColorSequence.new(Color3.new(1, 0.5, 0), Color3.new(1, 0.77, 0)),
		Perfect = ColorSequence.new(Color3.new(1, 0.15, 0), Color3.new(1, 0.37, 0)),
	},

	RARITY_COLORS = {
		Common = Color3.new(1, 1, 1),
		Uncommon = Color3.new(0, 1, 0),
		Rare = Color3.new(0, 0, 1),
		Epic = Color3.new(0.5, 0, 1),
		Legendary = Color3.new(1, 0.5, 0),
		Mythical = Color3.new(1, 0, 0),
		Secret = Color3.new(0.3, 0.3, 0.3),
	},

	RARITY_BACKGROUND_IMAGE = "rbxassetid://83809962362409",

	MULTI_DIG_ANIMATION_SPRITESHEET = "rbxassetid://80311363716942",

	-- UI registry names
	DIG_BAR_UI = "DiggingBar",
	SIDEBAR_UI = "SidebarUi",
	INVENTORY_MENU = "BackpackUi",
	TOOLBAR_UI = "ToolbarUi",
	MAIN_UI = "MainUi",
	RIGHT_SIDE_HUD = "Money",
	SELL_UI = "SellUi",
	SHOP_UI = "ShopUi",
	LUCKBAR_UI = "LuckBar",
	COMPASS_UI = "CompassUi",
	GAMEPASS_SHOP_UI = "GamepassShop",
	POPUP_UI = "ItemPopupUi",
	ISLE_POPUP_UI = "ZonePopupUi",
	BOAT_SHOP_UI = "BoatShopUi",
	DAILY_REWARD_UI = "DailyRewardUi",
	PLAYTIME_REWARD_UI = "PlaytimeRewardUi",
	DIALOG_PROMPT = "DialogPromptUi",
	DETECTOR_HINT_TEXT = "DetectorHintText",
	QUEST_INFO_SIDEBUTTON = "QuestInfoSideButton",

	-- Attributes
	BOAT_DRIVER_SITTING = "SittingInBoatDriverSeat",
	AREA_INDICATOR_POS = "OriginalPosition",
	TREASURE_MODEL_ORIGIN = "TrackedOrigin",

	-- Collision Groups
	PLAYER_COLGROUP = "Player",
	NOCHARACTERCOLLISION_COLGROUP = "NoCollideWithCharacters",
	BOAT_COLGROUP = "Boat",

	-- CS Tags
	SPAWN_TAG = "MapSpawn",
	ISLE_ZONE_TAG = "IsleZone",
}
return {
	ROLL_TYPES = ROLL_TYPES,
	REWARD_IMAGES = REWARD_IMAGES,
	gameConstants = gameConstants,
}
