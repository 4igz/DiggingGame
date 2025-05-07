--!optimize 2
--!strict

type Reward = {
	rewardType: "Money"
		| "LuckMultiplier"
		| "MetalDetectors"
		| "Shovels"
		| "Boats"
		| "Potions"
		| "SkillPoints"
		| "Experience",
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
		rewardType = "Boats",
		itemName = "Jetski",
	},
	{
		rewardType = "Potions",
		itemName = "M.Luck Potion",
	},
	{
		rewardType = "Potions",
		itemName = "M.Strength Potion",
	},
	{
		rewardType = "Money",
		rewardAmount = 100000,
	},
	{
		rewardType = "Potions",
		itemName = "L.Luck Potion",
	},
	{
		rewardType = "Boats",
		itemName = "Yacht",
	},
}
return {
	DAILY_REWARD_COOLDOWN = DAILY_REWARD_COOLDOWN,
	dailyRewards = dailyRewards,
}
