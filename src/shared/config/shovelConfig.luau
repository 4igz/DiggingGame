type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret"

type Shovel = {
	strengthMult: number,
	rarityType: Rarity,
	itemImage: string,
	price: number,

	notForSale: boolean?,
	obtainLocation: string?, -- If not specified then it won't show
}

local BASE_SHOVEL_STRENGTH = 1
local shovelConfig: { [string]: Shovel } = {
	StarterShovel = {
		strengthMult = 3,
		rarityType = "Common",
		itemImage = "rbxassetid://86157037222201",
		price = 0,
	},
	CommonShovel = {
		strengthMult = 3.5,
		rarityType = "Common",
		itemImage = "rbxassetid://94770951918498",
		price = 750,
	},
	SilverShovel = {
		strengthMult = 4,
		rarityType = "Common",
		itemImage = "rbxassetid://84978234143786",
		price = 2_000,
	},
	GoldShovel = {
		strengthMult = 6,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://133385114213421",
		price = 5_000,
	},
	DiamondShovel = {
		strengthMult = 8,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://80305961963756",
		price = 10_000,
	},
	AmethystShovel = {
		strengthMult = 12,
		rarityType = "Uncommon",
		itemImage = "rbxassetid://137452283112320",
		price = 25_000,
	},
	RubyShovel = {
		strengthMult = 14,
		rarityType = "Rare",
		itemImage = "rbxassetid://128554784882437",
		price = 100_000,
	},
	EnchantedShovel = {
		strengthMult = 17.5,
		rarityType = "Rare",
		itemImage = "rbxassetid://137008399562821",
		price = 250_000,
	},
	DemonicShovel = {
		strengthMult = 30,
		rarityType = "Rare",
		itemImage = "rbxassetid://77934386944359",
		price = 750_000,
	},

	HeavenlyShovel = {
		strengthMult = 40,
		rarityType = "Epic",
		itemImage = "rbxassetid://115558690172113",
		price = 2_000_000,
	},

	-- New additions:
	NatureShovel = {
		strengthMult = 9,
		rarityType = "Epic",
		itemImage = "rbxassetid://139803613068379",
		price = 200,

		notForSale = true,
		-- This is here as an example to show that you can indicate to the player how to obtain a non-purchaseable item. If not specified then it won't show in the shop
		-- obtainLocation = "Limited Offer!",
	},
	RetroShovel = {
		strengthMult = 32.5,
		rarityType = "Epic",
		itemImage = "rbxassetid://112571376118059",
		price = 200,

		notForSale = true,
	},
	SteampunkShovel = {
		strengthMult = 13,
		rarityType = "Rare",
		itemImage = "rbxassetid://82871848306408",
		price = 200,

		notForSale = true,
	},
	--

	CyberShovel = {
		strengthMult = 55,
		rarityType = "Epic",
		itemImage = "rbxassetid://129273316911656",
		price = 10_000_000,
	},
	AlienShovel = {
		strengthMult = 65,
		rarityType = "Legendary",
		itemImage = "rbxassetid://109719408760835",
		price = 50_000_000,
	},
	MonsterShovel = {
		strengthMult = 80,
		rarityType = "Legendary",
		itemImage = "rbxassetid://76160408546441",
		price = 250_000_000,
	},
	PureShovel = {
		strengthMult = 100,
		rarityType = "Legendary",
		itemImage = "rbxassetid://117172719154128",
		price = 1_000_000_000,
	},
	CactusShovel = {
		strengthMult = 110,
		rarityType = "Mythical",
		itemImage = "rbxassetid://123859103472525",
		price = 1_500_000_000,
	},
	EgyptianShovel = {
		strengthMult = 120,
		rarityType = "Secret",
		itemImage = "rbxassetid://117583872039962",
		price = 2_000_000_000,
	},
}

return {
	BASE_SHOVEL_STRENGTH = BASE_SHOVEL_STRENGTH,
	shovelConfig = shovelConfig,
}
