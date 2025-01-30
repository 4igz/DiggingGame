type RewardType = "Coins" | "Gems" | "Item";

export interface DailyReward {
	rewardType: RewardType;
}

export const dailyRewards = new Array();
