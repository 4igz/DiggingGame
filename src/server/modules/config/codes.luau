type Reward = {
	rewardType: "Money"
		| "LuckMultiplier"
		| "SkillPoints"
		| "Experience"
		| "MetalDetectors"
		| "Shovels"
		| "Target"
		| "Boats"
		| "Potions",
	rewardLength: number?,
	itemName: string?,
	rewardAmount: number?,
}

local codes: { [string]: { Reward } } = {
	release = {
		{
			rewardType = "Money",
			rewardAmount = 1000,
		},
		{
			rewardType = "Potions",
			itemName = "M.Luck Potion",
		},
	},
	i2perfect1 = {
		{
			rewardType = "Potions",
			itemName = "S.Luck Potion",
		},
		{
			rewardType = "Potions",
			itemName = "S.Luck Potion",
		},
	},
	magia5 = {
		{
			rewardType = "Potions",
			itemName = "S.Strength Potion",
		},
		{
			rewardType = "Potions",
			itemName = "S.Strength Potion",
		},
	},
	["4igz"] = {
		{
			rewardType = "Potions",
			itemName = "M.Luck Potion",
		},
		{
			rewardType = "Money",
			rewardAmount = 1337,
		},
	},
	desert = {
		{
			rewardType = "Money",
			rewardAmount = 2000,
		},
		{
			rewardType = "Potions",
			itemName = "M.Luck Potion",
		},
	},
	aura4 = {
		{
			rewardType = "Potions",
			itemName = "M.Strength Potion",
		},
	},
}

return {
	codes = codes,
}
