--!optimize 2

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret"

type BoatConfig = {
	price: number,
	itemImage: string,
	speed: number,
	rarityType: Rarity,
	notForSale: boolean?,
	obtainLocation: string?, -- Tell the user where the boat can be obtained, otherwise, it will not appear in the shop

	turnSpeed: number,
}

local DEFAULT_BOAT_TURN_SPEED = 1000
local DEFAULT_BOAT_SPEED = 1000
local boatConfig: { [string]: BoatConfig } = {
	["Wooden boat"] = {
		price = 1000,
		itemImage = "rbxassetid://119081046401633",
		rarityType = "Common",
		turnSpeed = 2,
		speed = 1,
	},
	Raft = {
		price = 25000,
		itemImage = "rbxassetid://104891560607438",
		rarityType = "Common",
		turnSpeed = 5,
		speed = 2,
	},
	Jetski = {
		price = 1000000,
		itemImage = "rbxassetid://112528662391629",
		rarityType = "Uncommon",
		turnSpeed = 2,
		speed = 4,

		notForSale = true,
		obtainLocation = "Daily Reward",
	},
	["Turbo boat"] = {
		price = 5000000,
		itemImage = "rbxassetid://85149294604733",
		rarityType = "Uncommon",
		turnSpeed = 5,
		speed = 6,
	},
	["Fishing boat"] = {
		price = 10000000,
		itemImage = "rbxassetid://93418622283531",
		rarityType = "Rare",
		turnSpeed = 20,
		speed = 8,
	},
	["Deck boat"] = {
		price = 25000000,
		itemImage = "rbxassetid://91008365917073",
		rarityType = "Legendary",
		turnSpeed = 30,
		speed = 10,
	},
	Yacht = {
		price = 100000000,
		itemImage = "rbxassetid://84685643148288",
		rarityType = "Mythical",
		turnSpeed = 100,
		speed = 20,

		notForSale = true,
		obtainLocation = "Daily Reward",
	},
}
return {
	DEFAULT_BOAT_TURN_SPEED = DEFAULT_BOAT_TURN_SPEED,
	DEFAULT_BOAT_SPEED = DEFAULT_BOAT_SPEED,
	boatConfig = boatConfig,
}
