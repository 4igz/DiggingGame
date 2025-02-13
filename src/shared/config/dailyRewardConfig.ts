import { ItemName, ItemType } from "shared/networkTypes";

export type RewardType = "Money" | "LuckMultiplier" | ItemType;

export interface DailyReward {
	rewardType: RewardType;
	rewardLength?: number; // In seconds
	itemName?: ItemName; // Required if rewardType is ItemType
	rewardAmount?: number; // Defaults to 1
}

// 18 hours
export const REWARD_COOLDOWN = 60 * 60 * 18;

export const dailyRewardImages = {
	Money: "rbxassetid://96446480715038",
	LuckMultiplier: "rbxassetid://83833460426334",
} as Record<RewardType, string>;

export const dailyRewards = [
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "LuckMultiplier", rewardAmount: 2, rewardLength: 60 * 10 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
];
