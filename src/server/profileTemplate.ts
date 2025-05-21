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
import { PotionEffect } from "./services/gameplay/inventoryService";
import { ReplicatedStorage } from "@rbxts/services";

// !If you change this store name, it will reset all player data!
export let PROFILE_STORE_NAME = "test31DataStore";

if (game.PlaceId === 91664813726836) {
	// Failsafe to ensure the store name stays consistent on main game
	PROFILE_STORE_NAME = "DataStore";
}

ReplicatedStorage.SetAttribute("CurrentStore", PROFILE_STORE_NAME);

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
	strength: 0,
	detection: 0,
	luck: 0,
	inventorySize: gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY,

	// Devproducts
	multiDigLevel: 0,
	claimedLimitedOffer: 0,

	// Luck multiplier
	potionLuckMultiplier: 1,
	potionStrengthMultiplier: 1,
	activePotions: new Array<PotionEffect>(),

	targetInventory: new Array<TargetItem>(),
	previouslyFoundTargets: new Set<keyof typeof targetConfig>(),
	detectorInventory: ["StarterDetector"] as Array<keyof typeof metalDetectorConfig>,
	shovelInventory: ["StarterShovel"] as Array<keyof typeof shovelConfig>,
	potionInventory: [] as Array<keyof typeof potionConfig>,
	redeemedCodes: [] as Array<string>,

	lastQuestReset: 0,

	// This being marked means that the player is an exploiter, and is either going to be marked for future ban waves, or will not show up on leaderboards.
	// We might also use this flag to be more strict on them when it comes to serverside checks.
	isExploiter: false,
	exploitReasons: new Array<string>(),
	selfReports: 0,

	banTimes: 0,

	claimedTimedReward: false,
	claimedTutorialRewards: false,
	isFirstJoin: true,
	autoGaveDetector: false,
	firedWrongEventDataTimes: 0,
	claimedFreeReward: false,

	ownedBoats: new Map<string, boolean>(Object.keys(boatConfig).map((boatName) => [boatName, false])),
	ownedGamepasses: new Map(Object.keys(gameConstants.GAMEPASS_IDS).map((id) => [id, false])),

	questProgress: new Map<keyof typeof questConfig, QuestProgress>(
		Object.keys(questConfig).map((questName) => [questName, { stage: 0, active: false, completed: false }]),
	),
};

export type ProfileTemplate = typeof profileTemplate;

export default profileTemplate;
