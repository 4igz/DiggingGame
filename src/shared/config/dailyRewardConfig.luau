--!optimize 2
--!strict
-- Compiled with roblox-ts v3.0.0

type Reward = {
	rewardType: "Money" | "LuckMultiplier" | "MetalDetectors" | "Shovels" | "Boats" | "Potions",
	itemName: string?, -- Only used if rewardType is Boat, MetalDetectors, or Shovels, must be the exact *name of the item (*index in the respective config).
	rewardAmount: number?, -- Ignored if rewardType is MetalDetectors, Shovels, or Boats.
	rewardLength: number?,
}

-- 18 hours
local DAILY_REWARD_COOLDOWN = 60 * 60 * 18

local dailyRewards: { Reward } = {
	{ -- Index corresponds to day, so this first one is day 1, and the last one is day 7.
		rewardType = "Money",
		rewardAmount = 100,
	},
	{
		rewardType = "LuckMultiplier",
		rewardAmount = 2,
		rewardLength = 60 * 10,
	},
	{
		rewardType = "Shovels",
		itemName = "EnchantedShovel",
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
	},
	{
		rewardType = "Boats",
		itemName = "Jetski",
	},
}
return {
	DAILY_REWARD_COOLDOWN = DAILY_REWARD_COOLDOWN,
	dailyRewards = dailyRewards,
}
