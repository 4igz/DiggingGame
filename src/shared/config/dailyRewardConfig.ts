//!optimize 2
import { Reward } from "shared/networkTypes";

// 18 hours
export const DAILY_REWARD_COOLDOWN = 60 * 60 * 18;

export const dailyRewards = [
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "LuckMultiplier", rewardAmount: 2, rewardLength: 60 * 10 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
	{ rewardType: "Money", rewardAmount: 100 },
] as Reward[];
