import { Reward } from "shared/networkTypes";

// interface Reward {
//     rewardType: RewardType; -- "Money" | "LuckMultiplier" | "SkillPoints" | "Experience" | ItemType;
//     rewardLength?: number; // In seconds
//     itemName?: ItemName; // Required if rewardType is ItemType
//     rewardAmount?: number; // Defaults to 1
// }

export default {
	itemName: "SilverDetector",
	rewardType: "MetalDetectors",
} as Reward;
