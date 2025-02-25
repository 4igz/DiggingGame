--!strict
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Sift =
	TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "sift", "out")

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythical" | "Secret"
type TargetConfig = {
	rarity: number,
	baseWeight: NumberRange,
	basePrice: number,
	rarityType: Rarity,
	itemImage: string,
	animationName: string?,
	description: string?,
}

local targetConfig: { [string]: TargetConfig } = {
	-- Grasslands
	["Bag of coins"] = {
		rarity = 3,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 10,
		itemImage = "rbxassetid://82293616105219",
		animationName = "Hold",
		description = "A small bag filled with shiny coins. It's not worth much, but it's a nice find.",
	},

	["Cool shell"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 15,
		itemImage = "rbxassetid://118432059776108",
		description = "Woah dude, cool.",
	},

	["Jade fish"] = {
		rarity = 10,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 20,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},

	["Bejeweled pegleg"] = {
		rarity = 16,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 25,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},

	Necklace = {
		rarity = 32,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 30,
		itemImage = "rbxassetid://81302821988412",
		animationName = "Hold",
		description = "A necklace that was likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},

	Ring = {
		rarity = 48,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 35,
		itemImage = "rbxassetid://78683428732466",
		description = "A simple ring, likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},

	["Golden eyepatch"] = {
		rarity = 64,
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 40,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},

	["Gold chalice"] = {
		rarity = 128,
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 90,
		itemImage = "rbxassetid://118432059776108",
		description = "Shiny.",
	},

	["Treasure chest"] = {
		rarity = 256,
		rarityType = "Rare",
		baseWeight = NumberRange.new(30, 50),
		basePrice = 15,
		itemImage = "rbxassetid://116848950666878",
		animationName = "OverheadHold",
		description = "A chest filled with various treasures. It's quite heavy, but it's a nice find.",
	},

	["Ruby"] = {
		rarity = 512,
		rarityType = "Epic",
		baseWeight = NumberRange.new(8, 10),
		basePrice = 600,
		itemImage = "rbxassetid://118432059776108",
		description = "A ruby.",
	},

	Diamond = {
		rarity = 1000,
		rarityType = "Epic",
		baseWeight = NumberRange.new(8, 10),
		basePrice = 1250,
		itemImage = "rbxassetid://77396148774213",
		animationName = "Hold",
		description = "A shiny diamond..",
	},

	["Ancient artifact"] = {
		rarity = 2000,
		rarityType = "Legendary",
		baseWeight = NumberRange.new(125, 150),
		basePrice = 200,
		itemImage = "rbxassetid://104605374928382",
		description = "An ancient artifact that's worth a fortune. It's quite heavy for its size.",
	},

	-- Volcano
	["Volcano rock"] = {
		rarity = 16,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://118432059776108",
		description = "A rock from the volcano.",
	},
	["Skull"] = {
		rarity = 48,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://118432059776108",
		description = "A rock from the volcano.",
	},
	["Volcano's tear"] = {
		rarity = 256,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://121295076787199",
		description = "A tear from the volcano.",
	},
	Ammonoids = {
		rarity = 512,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://81329471085203",
		description = "A fossil of an ancient creature.",
	},
	["Heat rock"] = {
		rarity = 1000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://118432059776108",
		description = "A rock that's warm to the touch.",
	},
	["Lava bucket"] = {
		rarity = 2000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://81391518039132",
		description = "A bucket filled with lava.",
	},
	["Obsidian shard"] = {
		rarity = 3500,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://115688166680356",
		description = "A shard of obsidian.",
	},
	["Coal artifact"] = {
		rarity = 5000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "An artifact made of coal.",
	},
	["Jade statue"] = {
		rarity = 7500,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "A good centerpiece.",
	},
	["T-Rex skull"] = {
		rarity = 15000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "Interesting.",
	},
	["T-Rex tooth"] = {
		rarity = 50000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},
	["Obsidian crown"] = {
		rarity = 100000,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},

	-- Frozen
	["Ice shard"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://122468325756667",
		description = "A shard of ice.",
	},

	["Sapphire gem"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://84253809232755",
		description = "A sapphire gem.",
	},
	["Viking dagger"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://136607393225332",
		description = "A viking dagger.",
	},
	["Viking sword"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "A viking sword.",
	},
	["Frozen teddy"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder who this belonged to.",
	},
	["Frozen ring"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder who this belonged to.",
	},
	["Topaz amulet"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder who this belonged to.",
	},
	["Gift"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder who this belonged to.",
	},
	["Small gift"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder who this belonged to.",
	},
	["Mammoth bone"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://107882679708293",
		description = "I wonder what this belonged to.",
	},
	["Diamond yeti"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},
	["Viking helmet"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(5, 20),
		basePrice = 10,
		itemImage = "rbxassetid://129994688332470",
		description = "Scary.",
	},
}
-- Where we store trash items, those that are obtained when the player has 0 luckMult
local trashConfig = {
	["Rusty nail"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://80374057285043",
	},
	Scrap = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://110934630212562",
	},
	["Old T-Shirt"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://134314922415893",
	},
	["Old boot"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://91884190576086",
	},
	["Old ring"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://87736149466419",
	},
	["Old coin"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://111334825894769",
	},
	["Old mitten"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 5),
		basePrice = 2,
		itemImage = "rbxassetid://114451456116905",
		description = "An old mitten.",
	},
}
local fullTargetConfig = Sift.Dictionary.merge(targetConfig, trashConfig)
return {
	targetConfig = targetConfig,
	trashConfig = trashConfig,
	fullTargetConfig = fullTargetConfig,
}
