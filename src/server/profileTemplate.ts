import { mapConfig } from "shared/config/mapConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { QuestProgress, TargetItem } from "shared/networkTypes";
import { shovelConfig } from "shared/config/shovelConfig";
import { targetConfig } from "shared/config/targetConfig";
import Object from "@rbxts/object-utils";
import { gameConstants } from "shared/gameConstants";
import { boatConfig } from "shared/config/boatConfig";
import { potionConfig } from "shared/config/potionConfig";
import { questConfig } from "shared/config/questConfig";

export const PROFILE_STORE_NAME = "pre_test4";

export const profileTemplate = {
	equippedShovel: "StarterShovel" as keyof typeof shovelConfig,
	equippedDetector: "StarterDetector" as keyof typeof metalDetectorConfig,
	equippedTreasure: "" as keyof typeof targetConfig,
	currentMap: "Grasslands" as keyof typeof mapConfig,
	money: "0;0",

	treasuresDug: 0,

	// Dailies
	lastDailyClaimed: 0,
	dailyStreak: 0,

	// Level data
	level: 1,
	experience: 0,

	// Skills
	skillPoints: 0,
	strength: 1,
	detection: 1,
	luck: 1,
	inventorySize: gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY,

	// Devproducts
	multiDigLevel: 0,

	// Luck multiplier
	potionLuckMultiplier: 1,
	activePotions: new Map<keyof typeof potionConfig, number>(),

	targetInventory: new Array<TargetItem>(),
	previouslyFoundTargets: new Set<keyof typeof targetConfig>(),
	detectorInventory: ["StarterDetector"] as Array<keyof typeof metalDetectorConfig>,
	shovelInventory: ["StarterShovel"] as Array<keyof typeof shovelConfig>,
	potionInventory: [] as Array<keyof typeof potionConfig>,

	ownedBoats: new Map(Object.keys(boatConfig).map((boatName) => [boatName, false])),
	ownedGamepasses: new Map(Object.keys(gameConstants.GAMEPASS_IDS).map((id) => [id, false])),

	questProgress: new Map<keyof typeof questConfig, QuestProgress>(
		Object.keys(questConfig).map((questName) => [questName, { stage: 0, active: false, completed: false }]),
	),
	lastQuestReset: 0,

	// This being marked means that the player is an exploiter, and is either going to be marked for future ban waves, or will not show up on leaderboards.
	// We might also use this flag to be more strict on them when it comes to serverside checks.
	isExploiter: false,
	exploitReasons: new Array<string>(),
	selfReports: 0,

	banTimes: 0,

	// Analytics
	isFirstJoin: true, // Replicated to client, then set to false. Subsequent joins will replicate false.
	firedWrongEventDataTimes: 0,
};

// Export the inferred type for use in other files
export type ProfileTemplate = typeof profileTemplate;

export default profileTemplate;
