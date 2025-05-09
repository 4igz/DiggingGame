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
	release = { -- Example code reward
		{
			rewardType = "Money",
			rewardAmount = 5000,
		},
		{
			rewardType = "MetalDetectors",
			itemName = "GoldDetector",
		},
	},
}

return {
	codes = codes,
}
