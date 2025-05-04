type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret"

type MetalDetector = {
	strength: number,	
	rarityType: Rarity,
	luck: number,
	searchRadius: number,
	itemImage: string,
	price: number,

	notForSale: boolean?,
	obtainLocation: string?, -- If not specified it won't show in shop.
}

local BASE_DETECTOR_STRENGTH = 175
local metalDetectorConfig: { [string]: MetalDetector } = {
	StarterDetector = {
		strength = 1,
		luck = 1,
		searchRadius = 50,
		itemImage = "rbxassetid://108661613310540",
		rarityType = "Common",
		price = 0,
	},
	CommonDetector = {
		strength = 1.25,
		luck = 5,
		searchRadius = 45,
		itemImage = "rbxassetid://123445201960643",
		rarityType = "Common",
		price = 750,
	},
	SilverDetector = {
		strength = 1.5,
		luck = 7.5,
		searchRadius = 42.5,
		itemImage = "rbxassetid://135924805977158",
		rarityType = "Common",
		price = 2000,
	},
	GoldDetector = {
		strength = 1.5,
		luck = 10,
		searchRadius = 40,
		itemImage = "rbxassetid://124439509844599",
		rarityType = "Common",
		price = 5000,
	},
	DiamondDetector = {
		strength = 1.75,
		luck = 15,
		searchRadius = 37.5,
		itemImage = "rbxassetid://102615131234174",
		rarityType = "Uncommon",
		price = 10000,
	},
	AmethystDetector = {
		strength = 2,
		luck = 20,
		searchRadius = 35,
		itemImage = "rbxassetid://123979343978192",
		rarityType = "Uncommon",
		price = 25000,
	},
	RubyDetector = {
		strength = 2.25,
		luck = 25,
		searchRadius = 32.5,
		itemImage = "rbxassetid://80842349596350",
		rarityType = "Rare",
		price = 100000,
	},
	EnchantedDetector = {
		strength = 2.50,
		luck = 30,
		searchRadius = 30,
		itemImage = "rbxassetid://100950657608323",
		rarityType = "Rare",
		price = 250000,
	},
	DemonicDetector = {
		strength = 2.75,
		luck = 35,
		searchRadius = 27.5,
		itemImage = "rbxassetid://76078468216770",
		rarityType = "Epic",
		price = 750000,
	},
	HeavenlyDetector = {
		strength = 3,
		luck = 40,
		searchRadius = 25,
		itemImage = "rbxassetid://133401921939429",
		rarityType = "Epic",
		price = 2000000,
	},

	-- New additions:
	NatureDetector = {
		strength = 1.5,
		luck = 8,
		searchRadius = 40,
		rarityType = "Epic",
		itemImage = "rbxassetid://83905633434794",
		price = 200,

		notForSale = true,

		-- This is here as an example to show that you can indicate to the player how to obtain a non-purchaseable item. If not specified then it won't show in the shop
		-- obtainLocation = "Limited Offer!",
	},
	RetroDetector = {
		strength = 2,
		luck = 28,
		searchRadius = 30,
		rarityType = "Epic",
		itemImage = "rbxassetid://82188544537251",
		price = 200,

		notForSale = true,
	},
	SteampunkDetector = {
		strength = 3,
		luck = 40,
		searchRadius = 25,
		rarityType = "Epic",
		itemImage = "rbxassetid://99214897672719",
		price = 200,

		notForSale = true,
	},
	--

	CyberDetector = {
		strength = 3.25,
		luck = 45,
		searchRadius = 22.5,
		itemImage = "rbxassetid://121233275974009",
		rarityType = "Legendary",
		price = 10000000,
	},
	AlienDetector = {
		strength = 3.50,
		luck = 50,
		searchRadius = 20,
		itemImage = "rbxassetid://70623998291755",
		rarityType = "Legendary",
		price = 50000000,
	},
	MonsterDetector = {
		strength = 3.75,
		luck = 55,
		searchRadius = 17.5,
		itemImage = "rbxassetid://110685529014774",
		rarityType = "Mythical",
		price = 250000000,
	},
	PureDetector = {
		strength = 4,
		luck = 60,
		searchRadius = 15,
		itemImage = "rbxassetid://98289595849939",
		rarityType = "Secret",
		price = 1000000000,
	},
}
return {
	BASE_DETECTOR_STRENGTH = BASE_DETECTOR_STRENGTH,
	metalDetectorConfig = metalDetectorConfig,
}
