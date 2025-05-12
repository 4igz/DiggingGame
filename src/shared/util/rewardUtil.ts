import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { shovelConfig } from "shared/config/shovelConfig";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { ItemType, Reward } from "shared/networkTypes";

export interface ItemStat {
	key: string;
	value: string | number;
	icon: string; // Asset ID
	type?: "time" | "multiplier";
}

export const getRewardImage = (reward: Reward) => {
	return (
		REWARD_IMAGES[reward.rewardType] ??
		gameConstants.SHOP_CONFIGS[reward.rewardType as ItemType][reward.itemName!]?.itemImage ??
		undefined
	);
};

export function getRewardStats(reward: Reward): ItemStat[] {
	const stats: ItemStat[] = [];

	if (!reward.itemName) {
		return stats;
	}

	switch (reward.rewardType) {
		case "Shovels": {
			const shovel = shovelConfig[reward.itemName];
			if (shovel) {
				// Add strength stat
				stats.push({
					key: "strength",
					value: shovel.strengthMult || 1,
					icon: "rbxassetid://100052274681629",
				});

				// Add quantity if more than 1
				if (reward.rewardAmount && reward.rewardAmount > 1) {
					stats.push({
						key: "quantity",
						value: reward.rewardAmount,
						icon: "rbxassetid://115275171647711",
					});
				}
			}
			break;
		}

		case "MetalDetectors": {
			const detector = metalDetectorConfig[reward.itemName];
			if (detector) {
				// Add detection distance stat
				stats.push({
					key: "detectionDistance",
					value: detector.strength || 1,
					icon: "rbxassetid://136640572681412",
				});

				// Add luck stat
				stats.push({
					key: "luck",
					value: detector.luck || 1,
					icon: "rbxassetid://85733831609212",
				});

				// Add quantity if more than 1
				if (reward.rewardAmount && reward.rewardAmount > 1) {
					stats.push({
						key: "quantity",
						value: reward.rewardAmount,
						icon: "rbxassetid://115275171647711",
					});
				}
			}
			break;
		}

		default:
			// Handle other reward types if needed
			break;
	}

	return stats;
}
