//!optimize 2
//!native
import { Reward } from "shared/networkTypes";

export interface PlaytimeReward extends Reward {
	unlockTime: number;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;

const minutes = (minutes: number) => minutes * MINUTE;
const hours = (hours: number) => hours * HOUR;

export const timePlayedRewards: PlaytimeReward[] = [
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(1) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(2) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(3) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(4) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(5) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(6) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(7) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(8) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(9) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: minutes(10) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: hours(1) },
	{ rewardType: "Money", rewardAmount: 100, unlockTime: hours(2) },
];

assert(timePlayedRewards.size() > 0, "timePlayedRewards must have at least one reward");
assert(timePlayedRewards.size() <= 12, "timePlayedRewards can't be more than 12 rewards");
