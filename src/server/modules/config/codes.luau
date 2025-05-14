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
}

return {
	codes = codes,
}
