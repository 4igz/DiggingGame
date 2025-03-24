-- Compiled with roblox-ts v3.0.0
local BASE_SHOVEL_STRENGTH = 1
local shovelConfig = {
	StarterShovel = {
		strengthMult = 1,
		rarityType = "Common",
		itemImage = "rbxassetid://86157037222201",
		shopOrder = -2,
		price = 0,
	},
	CommonShovel = {
		strengthMult = 1.75,
		rarityType = "Common",
		itemImage = "rbxassetid://94770951918498",
		shopOrder = 1,
		price = 750,
	},
	SilverShovel = {
		strengthMult = 2.50,
		rarityType = "Common",
		itemImage = "rbxassetid://84978234143786",
		shopOrder = 2,
		price = 2000,
	},
	GoldShovel = {
		strengthMult = 3.50,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://133385114213421",
		shopOrder = 3,
		price = 5000,
	},
	DiamondShovel = {
		strengthMult = 4.50,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://80305961963756",
		shopOrder = 4,
		price = 10000,
	},
	AmethystShovel = {
		strengthMult = 7,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://137452283112320",
		shopOrder = 5,
		price = 25000,
	},
	RubyShovel = {
		strengthMult = 10,
		rarityType = "Rare",
		itemImage = "rbxassetid://128554784882437",
		shopOrder = 6,
		price = 100000,
	},
	EnchantedShovel = {
		strengthMult = 17.5,
		rarityType = "Rare",
		itemImage = "rbxassetid://137008399562821",
		shopOrder = 7,
		price = 250000,
	},
	DemonicShovel = {
		strengthMult = 25,
		rarityType = "Epic",
		itemImage = "rbxassetid://77934386944359",
		shopOrder = 9,
		price = 750000,
	},

	HeavenlyShovel = {
		strengthMult = 35,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		shopOrder = 8,
		price = 2000000,
	},

	CyberShovel = {
		strengthMult = 50,
		rarityType = "Legendary",
		itemImage = "rbxassetid://129273316911656",
		shopOrder = 10,
		price = 10000000,
	},
	AlienShovel = {
		strengthMult = 65,
		rarityType = "Legendary",
		itemImage = "rbxassetid://109719408760835",
		shopOrder = 11,
		price = 50000000,
	},
	MonsterShovel = {
		strengthMult = 80,
		rarityType = "Mythical",
		itemImage = "rbxassetid://76160408546441",
		shopOrder = 12,
		price = 250000000,
	},
	PureShovel = {
		strengthMult = 100,
		rarityType = "Secret",
		itemImage = "rbxassetid://117172719154128",
		shopOrder = 13,
		price = 1000000000,
	},
}
return {
	BASE_SHOVEL_STRENGTH = BASE_SHOVEL_STRENGTH,
	shovelConfig = shovelConfig,
}
