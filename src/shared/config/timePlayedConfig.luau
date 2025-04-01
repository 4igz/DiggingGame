--!optimize 2
--!strict
-- Compiled with roblox-ts v3.0.0
local MINUTE = 60
local HOUR = 60 * MINUTE

type PlaytimeReward = {
	unlockTime: number,
	rewardType: "Money" | "LuckMultiplier" | "MetalDetectors" | "Shovels" | "Boats" | "Potions",
	rewardLength: number?,
	itemName: string?,
	rewardAmount: number?,
}

local minutes = function(minutes: number)
	return minutes * MINUTE
end
local hours = function(hours: number)
	return hours * HOUR
end

local timePlayedRewards: { PlaytimeReward } = {
	{ -- Can have up to 12, these should be in order in terms of how much time they take
		rewardType = "Shovels",
		itemName = "EnchantedShovel",
		unlockTime = 10,
	},
	{
		rewardType = "Potions",
		itemName = "Small Strength Potion",
		unlockTime = 15,
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(3),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(4),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(5),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(6),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(7),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(8),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(9),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = minutes(10),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = hours(1),
	},
	{
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = hours(2),
	},
}
assert(#timePlayedRewards > 0, "timePlayedRewards must have at least one reward")
assert(#timePlayedRewards <= 12, "timePlayedRewards can't be more than 12 rewards")
return {
	timePlayedRewards = timePlayedRewards,
}
