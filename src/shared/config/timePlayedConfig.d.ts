//!optimize 2
import { Reward } from "shared/networkTypes";

export interface PlaytimeReward extends Reward {
	unlockTime: number;
}

export const timePlayedRewards: PlaytimeReward[];
