--!strict
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

local limitedOffer: { { Reward } } = {
	-- Pack 1 (Starter pack)
	{
		{
			itemName = "NatureDetector",
			rewardType = "MetalDetectors",
		},
		{
			itemName = "NatureShovel",
			rewardType = "Shovels",
		},
		{
			rewardType = "Potions",
			itemName = "Medium Strength Potion",
			rewardAmount = 2,
		},
	},
	-- Pack 2 (Pro pack)
	{
		{
			itemName = "RetroDetector",
			rewardType = "MetalDetectors",
		},
		{
			itemName = "RetroShovel",
			rewardType = "Shovels",
		},
		{
			rewardType = "Potions",
			itemName = "Large Luck Potion",
			rewardAmount = 2,
		},
	},
}

return {
	limitedOffer = limitedOffer,
}
