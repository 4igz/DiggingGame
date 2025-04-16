import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { ItemType, Reward } from "shared/networkTypes";

export const getRewardImage = (reward: Reward) => {
	return (
		REWARD_IMAGES[reward.rewardType] ??
		gameConstants.SHOP_CONFIGS[reward.rewardType as ItemType][reward.itemName!]?.itemImage ??
		undefined
	);
};
