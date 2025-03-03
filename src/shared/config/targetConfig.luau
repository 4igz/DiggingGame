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
		baseWeight = NumberRange.new(1, 3),
		basePrice = 250,
		itemImage = "rbxassetid://82293616105219",
		animationName = "Hold",
		description = "A small bag filled with shiny coins. It's not worth much, but it's a nice find.",
	},

	["Cool shell"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 3),
		basePrice = 100,
		itemImage = "rbxassetid://95263459531619",
		description = "Woah dude, cool.",
	},

	["Jade fish"] = {
		rarity = 10,
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 4),
		basePrice = 250,
		itemImage = "rbxassetid://73363406884733",
		description = "Scary.",
	},

	Necklace = {
		rarity = 32,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(2, 6),
		basePrice = 500,
		itemImage = "rbxassetid://81302821988412",
		animationName = "Hold",
		description = "A necklace that was likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},

	Ring = {
		rarity = 48,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(2, 6),
		basePrice = 500,
		itemImage = "rbxassetid://78683428732466",
		description = "A simple ring, likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},

	["Golden eyepatch"] = {
		rarity = 64,
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 400,
		itemImage = "rbxassetid://121457379559507",
		description = "Scary.",
	},

	["Gold chalice"] = {
		rarity = 128,
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 500,
		itemImage = "rbxassetid://137435113990293",
		description = "Shiny.",
	},

	["Bejeweled pegleg"] = {
		rarity = 128,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(15, 20),
		basePrice = 250,
		itemImage = "rbxassetid://81795788928547",
		description = "Scary.",
	},

	["Treasure chest"] = {
		rarity = 256,
		rarityType = "Rare",
		baseWeight = NumberRange.new(20, 40),
		basePrice = 150,
		itemImage = "rbxassetid://116848950666878",
		animationName = "OverheadHold",
		description = "A chest filled with various treasures. It's quite heavy, but it's a nice find.",
	},

	["Ruby"] = {
		rarity = 512,
		rarityType = "Epic",
		baseWeight = NumberRange.new(8, 10),
		basePrice = 600,
		itemImage = "rbxassetid://90524635111098",
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
		baseWeight = NumberRange.new(25, 50),
		basePrice = 2000,
		itemImage = "rbxassetid://104605374928382",
		description = "An ancient artifact that's worth a fortune. It's quite heavy for its size.",
	},

	-- Volcano
	["Volcano rock"] = {
		rarity = 320,
		rarityType = "Common",
		baseWeight = NumberRange.new(25, 30),
		basePrice = 50,
		itemImage = "rbxassetid://118432059776108",
		description = "A rock from the volcano.",
	},
	["Skull"] = {
		rarity = 500,
		rarityType = "Common",
		baseWeight = NumberRange.new(25, 30),
		basePrice = 125,
		itemImage = "rbxassetid://72115667830784",
		description = "A rock from the volcano.",
	},
	["Volcano's tear"] = {
		rarity = 620,
		rarityType = "Common",
		baseWeight = NumberRange.new(25, 30),
		basePrice = 150,
		itemImage = "rbxassetid://121295076787199",
		description = "A tear from the volcano.",
	},
	Ammonoids = {
		rarity = 700,
		rarityType = "Common",
		baseWeight = NumberRange.new(25, 30),
		basePrice = 200,
		itemImage = "rbxassetid://81329471085203",
		description = "A fossil of an ancient creature.",
	},
	["Heat rock"] = {
		rarity = 1_000,
		rarityType = "Common",
		baseWeight = NumberRange.new(40, 50),
		basePrice = 250,
		itemImage = "rbxassetid://84979377926433",
		description = "A rock that's warm to the touch.",
	},
	["Lava bucket"] = {
		rarity = 2_000,
		rarityType = "Common",
		baseWeight = NumberRange.new(55, 75),
		basePrice = 300,
		itemImage = "rbxassetid://81391518039132",
		description = "A bucket filled with lava.",
	},
	["Obsidian shard"] = {
		rarity = 3_500,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 100),
		basePrice = 400,
		itemImage = "rbxassetid://115688166680356",
		description = "A shard of obsidian.",
	},
	["Coal artifact"] = {
		rarity = 5_000,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(40, 50),
		basePrice = 450,
		itemImage = "rbxassetid://129994688332470",
		description = "An artifact made of coal.",
	},
	["Jade statue"] = {
		rarity = 7_500,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(50, 60),
		basePrice = 550,
		itemImage = "rbxassetid://138452528957421",
		description = "A good centerpiece.",
	},
	["T-Rex skull"] = {
		rarity = 15_000,
		rarityType = "Rare",
		baseWeight = NumberRange.new(75, 100),
		basePrice = 725,
		itemImage = "rbxassetid://122748003577046",
		description = "Interesting.",
	},
	["T-Rex tooth"] = {
		rarity = 50_000,
		rarityType = "Epic",
		baseWeight = NumberRange.new(50, 150),
		basePrice = 1000,
		itemImage = "rbxassetid://98431662126693",
		description = "Scary.",
	},
	["Obsidian crown"] = {
		rarity = 100_000,
		rarityType = "Legendary",
		baseWeight = NumberRange.new(500, 1_000),
		basePrice = 500,
		itemImage = "rbxassetid://127124055698540",
		description = "Scary.",
	},

	-- Frozen
	["Ice shard"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 50,
		itemImage = "rbxassetid://122468325756667",
		description = "A shard of ice.",
	},

	["Sapphire gem"] = {
		rarity = 5,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 50,
		itemImage = "rbxassetid://84253809232755",
		description = "A sapphire gem.",
	},
	["Viking dagger"] = {
		rarity = 25,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 50,
		itemImage = "rbxassetid://136607393225332",
		description = "A viking dagger.",
	},
	["Viking sword"] = {
		rarity = 50,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 50,
		itemImage = "rbxassetid://107882679708293",
		description = "A viking sword.",
	},
	["Viking helmet"] = {
		rarity = 100,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 50,
		itemImage = "rbxassetid://88040817247637",
		description = "A viking helmet.",
	},
	["Frozen teddy"] = {
		rarity = 250,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 100,
		itemImage = "rbxassetid://110019113674699",
		description = "I wonder who this belonged to.",
	},
	["Frozen ring"] = {
		rarity = 256,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(50, 75),
		basePrice = 100,
		itemImage = "rbxassetid://118242108570774",
		description = "I wonder who this belonged to.",
	},
	["Topaz amulet"] = {
		rarity = 512,
		rarityType = "Rare",
		baseWeight = NumberRange.new(75, 300),
		basePrice = 100,
		itemImage = "rbxassetid://112949825522969",
		description = "I wonder who this belonged to.",
	},
	["Small gift"] = {
		rarity = 700,
		rarityType = "Rare",
		baseWeight = NumberRange.new(75, 300),
		basePrice = 250,
		itemImage = "rbxassetid://85734447473447",
		description = "I wonder who this belonged to.",
	},
	["Gift"] = {
		rarity = 1_024,
		rarityType = "Rare",
		baseWeight = NumberRange.new(75, 300),
		basePrice = 1_000,
		itemImage = "rbxassetid://85734447473447",
		description = "I wonder who this belonged to.",
	},
	["Mammoth tusk"] = {
		rarity = 5_024,
		rarityType = "Legendary",
		baseWeight = NumberRange.new(300, 600),
		basePrice = 1_000,
		itemImage = "rbxassetid://81388213251759",
		description = "I wonder if they're missing this.",
	},
	["Diamond yeti"] = {
		rarity = 20_024,
		rarityType = "Mythical",
		baseWeight = NumberRange.new(500, 2000),
		basePrice = 1_000,
		itemImage = "rbxassetid://98688622480490",
		description = "Scary.",
	},
}
-- Where we store trash items, those that are obtained when the player has 0 luckMult
local trashConfig = {
	["Rusty nail"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://80374057285043",
	},
	Scrap = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://110934630212562",
	},
	["Old T-Shirt"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://134314922415893",
	},
	["Old boot"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://91884190576086",
	},
	["Old ring"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://87736149466419",
	},
	["Old coin"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://111334825894769",
	},
	["Old mitten"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
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
