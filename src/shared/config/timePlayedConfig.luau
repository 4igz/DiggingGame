--!optimize 2
--!strict
local MINUTE = 60
local HOUR = 60 * MINUTE

type PlaytimeReward = {
	unlockTime: number,
	rewardType: "Money"
		| "LuckMultiplier"
		| "MetalDetectors"
		| "Shovels"
		| "Boats"
		| "Potions"
		| "SkillPoints"
		| "Experience",
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
		rewardType = "Money",
		rewardAmount = 100,
		unlockTime = 5,
	},
	{
		rewardType = "Experience",
		rewardAmount = 25,
		unlockTime = minutes(3),
	},
	{
		rewardType = "Money",
		rewardAmount = 500,
		unlockTime = minutes(5),
	},
	{
		rewardType = "Potions",
		itemName = "S.Strength Potion",
		unlockTime = minutes(7),
	},
	{
		rewardType = "Experience",
		rewardAmount = 125,
		unlockTime = minutes(10),
	},
	{
		rewardType = "Money",
		rewardAmount = 2000,
		unlockTime = minutes(15),
	},
	{
		rewardType = "Potions",
		itemName = "S.Luck Potion",
		unlockTime = minutes(20),
	},
	{
		rewardType = "Money",
		rewardAmount = 10000,
		unlockTime = minutes(30),
	},
	{
		rewardType = "Potions",
		itemName = "M.Strength Potion",
		unlockTime = minutes(45),
	},
	{
		rewardType = "Potions",
		itemName = "M.Luck Potion",
		unlockTime = minutes(60),
	},
	{
		rewardType = "Money",
		rewardAmount = 50000,
		unlockTime = minutes(90),
	},
	{
		rewardType = "Potions",
		itemName = "L.Luck Potion",
		unlockTime = hours(2),
	},
}
assert(#timePlayedRewards > 0, "timePlayedRewards must have at least one reward")
assert(#timePlayedRewards <= 12, "timePlayedRewards can't be more than 12 rewards")
return {
	timePlayedRewards = timePlayedRewards,
}
