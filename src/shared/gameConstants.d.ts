import { MetalDetector, metalDetectorConfig } from "./config/metalDetectorConfig";
import { ItemType, Rarity, RewardType } from "./networkTypes";
import { Shovel, shovelConfig } from "./config/shovelConfig";
import { mapConfig } from "./config/mapConfig";
import { BoatConfig } from "./config/boatConfig";

export declare const ROLL_TYPES: {
	Bad: "Bad..";
	Okay: "Okay.";
	Great: "Great!";
	Wow: "Wow!!";
	Super: "Super!!";
	Perfect: "PERFECT!!";
};

export const REWARD_IMAGES: Record<RewardType, string>;

export declare const gameConstants: {
	readonly DIG_BAR_UI: string;
	readonly SIDEBAR_UI: string;
	readonly INVENTORY_MENU: string;
	readonly TOOLBAR_UI: string;
	readonly MAIN_UI: string;
	readonly RIGHT_SIDE_HUD: string;
	readonly SELL_UI: string;
	readonly SHOP_UI: string;
	readonly LUCKBAR_UI: string;
	readonly COMPASS_UI: string;
	readonly GAMEPASS_SHOP_UI: string;
	readonly POPUP_UI: string;
	readonly ISLE_POPUP_UI: string;
	readonly BOAT_SHOP_UI: string;
	readonly DAILY_REWARD_UI: string;
	readonly PLAYTIME_REWARD_UI: string;
	readonly DIALOG_PROMPT: string;
	readonly DETECTOR_HINT_TEXT: string;
	readonly QUEST_INFO_SIDEBUTTON: string;
	readonly FREE_REWARD_UI: string;
	readonly PACK_FRAME_UI: string;
	readonly UPDATE_LOG_UI: string;
	readonly BOTTOM_RIGHT_HUD: string;

	readonly STARTER_PACK_DISCOUNTED_PRICE: number;

	readonly BOAT_DRIVER_SITTING: "SittingInBoatDriverSeat";
	readonly AREA_INDICATOR_POS: "OriginalPosition";
	readonly TREASURE_MODEL_ORIGIN: "TrackedOrigin";

	readonly PLAYER_COLGROUP: string;
	readonly NOCHARACTERCOLLISION_COLGROUP: string;
	readonly BOAT_COLGROUP: string;
	readonly SPAWN_TAG: string;
	readonly ISLE_ZONE_TAG: string;

	readonly SHOP_PROMPT_RANGE: number;

	readonly DIG_PROGRESS_MULTIPLIER: number;
	readonly AUTO_DIG_FAILURE_THRESHOLD: number; // If autodig fails this many times consecutively, it will teleport to the nearest map spawn to reset itself.
	readonly SERVER_LUCK_MULTIPLIER_DURATION: number;
	readonly MAX_MULTIDIG_LEVEL: number;
	readonly DIG_RANGE: number;
	readonly DIG_TIME_SEC: number; // Ratelimit the speed of digging
	readonly BATCH_SEND_INTERVAL: number;
	readonly AUTO_DIG_CLICK_INTERVAL: number; // Seconds between each auto dig click
	readonly POTION_DURATION: number; // 5 minutes
	readonly TARGET_INVENTORY_DEFAULT_CAPACITY: number;
	readonly BAR_DECREASE_RATE: number;
	readonly BASE_EXP: number;
	readonly SUCCESSFUL_DIG_COOLDOWN: number; // Prevent player from immediately digging again after just finishing digging
	readonly MAX_DIG_REPLICATE_DISTANCE: number;
	readonly BIGGER_BACKPACK_SIZE_MODIFIER: number;
	readonly MIN_DIG_REQ_DIST: number;

	readonly LEVEL_INCREASE_EXPONENT: number;

	readonly STRENGTH_MODIFIER: number;
	readonly DETECTION_MODIFIER: number;
	readonly LUCK_MODIFIER: number;

	// Maps itemType name to config
	readonly SHOP_CONFIGS: Record<ItemType, Readonly<Record<string, MetalDetector | Shovel | BoatConfig>>>;

	readonly DEVPRODUCT_IDS: Record<string, number>;

	readonly GAMEPASS_IDS: Record<string, number>;

	readonly MAP_THEME_COLORS: Record<keyof typeof mapConfig, Color3>;

	readonly ROLL_LUCK_VALUES: Record<keyof typeof ROLL_TYPES, number>;

	readonly HIGH_ROLL_THRESHOLD: number;

	readonly ROLL_COLORS: Record<keyof typeof ROLL_TYPES, ColorSequence>;

	readonly RARITY_COLORS: Record<Rarity, Color3>;

	readonly RARITY_BACKGROUND_IMAGE: string;

	readonly MULTI_DIG_ANIMATION_SPRITESHEET: "rbxassetid://80311363716942";
};
