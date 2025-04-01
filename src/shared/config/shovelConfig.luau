-- Compiled with roblox-ts v3.0.0
local BASE_SHOVEL_STRENGTH = 1
local shovelConfig = {
	StarterShovel = {
		strengthMult = 1,
		rarityType = "Common",
		itemImage = "rbxassetid://86157037222201",
		price = 0,
	},
	CommonShovel = {
		strengthMult = 1.75,
		rarityType = "Common",
		itemImage = "rbxassetid://94770951918498",
		price = 750,
	},
	SilverShovel = {
		strengthMult = 2.50,
		rarityType = "Common",
		itemImage = "rbxassetid://84978234143786",
		price = 2000,
	},
	GoldShovel = {
		strengthMult = 3.50,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://133385114213421",
		price = 5000,
	},
	DiamondShovel = {
		strengthMult = 4.50,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://80305961963756",
		price = 10000,
	},
	AmethystShovel = {
		strengthMult = 7,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://137452283112320",
		price = 25000,
	},
	RubyShovel = {
		strengthMult = 10,
		rarityType = "Rare",
		itemImage = "rbxassetid://128554784882437",
		price = 100000,
	},
	EnchantedShovel = {
		strengthMult = 17.5,
		rarityType = "Rare",
		itemImage = "rbxassetid://137008399562821",
		price = 250000,
	},
	DemonicShovel = {
		strengthMult = 25,
		rarityType = "Epic",
		itemImage = "rbxassetid://77934386944359",
		price = 750000,
	},

	HeavenlyShovel = {
		strengthMult = 35,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		price = 2000000,
	},

	-- New additions:
	NatureShovel = {
		strengthMult = 35,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		price = 200,
	},
	RetroShovel = {
		strengthMult = 35,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		price = 200,
	},
	SteampunkShovel = {
		strengthMult = 35,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		price = 200,
	},
	--

	CyberShovel = {
		strengthMult = 50,
		rarityType = "Legendary",
		itemImage = "rbxassetid://129273316911656",
		price = 10000000,
	},
	AlienShovel = {
		strengthMult = 65,
		rarityType = "Legendary",
		itemImage = "rbxassetid://109719408760835",
		price = 50000000,
	},
	MonsterShovel = {
		strengthMult = 80,
		rarityType = "Mythical",
		itemImage = "rbxassetid://76160408546441",
		price = 250000000,
	},
	PureShovel = {
		strengthMult = 100,
		rarityType = "Secret",
		itemImage = "rbxassetid://117172719154128",
		price = 1000000000,
	},


}
return {
	BASE_SHOVEL_STRENGTH = BASE_SHOVEL_STRENGTH,
	shovelConfig = shovelConfig,
}
