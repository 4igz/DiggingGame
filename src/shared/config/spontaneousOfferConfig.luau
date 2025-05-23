type Reward = {
	rewardType: "Money"
		| "LuckMultiplier"
		| "SkillPoints"
		| "Experience"
		| "MetalDetectors"
		| "Shovels"
		| "Boats"
		| "Potions",
	itemName: string?, -- Only used if rewardType is Boat, MetalDetectors, or Shovels, must be the exact *name of the item (*index in the respective config).
	rewardAmount: number?, -- Ignored if rewardType is MetalDetectors, Shovels, or Boats.
	rewardLength: number?,
}

local minute = 60
local MIN_TIME = minute / 2
local MAX_TIME = minute * 10

-- When player tries to leave within the avg retention window, prompt
--  a reward to try to keep them slightly longer.
local config: { Reward } = {
	{
		rewardType = "Potions",
		itemName = "L.Luck Potion",
	},
	{
		rewardType = "Potions",
		itemName = "L.Strength Potion",
	},
	{
		rewardType = "Money",
		rewardAmount = 2_000,
	},
}

return {
	spontaneousOfferConfig = config,
	MAX_TIME = MAX_TIME,
	MIN_TIME = MIN_TIME,
}
