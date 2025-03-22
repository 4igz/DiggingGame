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
	indexRarity: number?, -- Displayed 1 in x chance.
}

local targetConfig: { [string]: TargetConfig } = {
	-- Grasslands
	-- Grasslands
	["Bag of coins"] = {
		rarity = 3, -- 1 in 3
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 3),
		basePrice = 50,
		itemImage = "rbxassetid://82293616105219",
		animationName = "Hold",
		description = "A small bag filled with shiny coins. It's not worth much, but it's a nice find.",

		indexRarity = 3,
	},

	["Cool shell"] = {
		rarity = 5, -- 1 in 5
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 3),
		basePrice = 100,
		itemImage = "rbxassetid://95263459531619",
		description = "Woah dude, cool.",

		indexRarity = 5,
	},

	["Jade fish"] = {
		rarity = 10, -- 1 in 10
		rarityType = "Common",
		baseWeight = NumberRange.new(2, 4),
		basePrice = 250,
		itemImage = "rbxassetid://73363406884733",
		description = "Despite its appearance, it cannot swim.",

		indexRarity = 10,
	},

	Necklace = {
		rarity = 16, -- 1 in 16
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(2, 6),
		basePrice = 500,
		itemImage = "rbxassetid://81302821988412",
		animationName = "Hold",
		description = "A necklace that was likely lost by someone long ago. It probably has a story to tell.",

		indexRarity = 16,
	},

	Ring = {
		rarity = 20, -- 1 in 20
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(2, 6),
		basePrice = 500,
		itemImage = "rbxassetid://78683428732466",
		description = "A simple ring, likely lost by someone long ago. It probably has a story to tell.",

		indexRarity = 20,
	},

	["Golden eyepatch"] = {
		rarity = 32, -- 1 in 32
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 400,
		itemImage = "rbxassetid://121457379559507",
		description = "Probably belonged to a very wealthy pirate. Or a snobby one.",

		indexRarity = 32,
	},

	["Gold chalice"] = {
		rarity = 48, -- 1 in 48
		rarityType = "Rare",
		baseWeight = NumberRange.new(5, 10),
		basePrice = 500,
		itemImage = "rbxassetid://137435113990293",
		description = "Still stained with sacramental wine. Some say it used to be the holy grail.",
		indexRarity = 48,
	},

	["Bejeweled pegleg"] = {
		rarity = 64, -- 1 in 64
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(7, 10),
		basePrice = 500,
		itemImage = "rbxassetid://81795788928547",
		description = "Belongs to the boat captain. He is probably missing this.",
		indexRarity = 64,
	},

	["Treasure chest"] = {
		rarity = 128, -- 1 in 128
		rarityType = "Rare",
		baseWeight = NumberRange.new(10, 50),
		basePrice = 265,
		itemImage = "rbxassetid://116848950666878",
		animationName = "OverheadHold",
		description = "A chest filled with various treasures. Who knows what could be inside.",

		indexRarity = 128,
	},

	["Ruby"] = {
		rarity = 256, -- 1 in 256
		rarityType = "Epic",
		baseWeight = NumberRange.new(8, 10),
		basePrice = 600,
		itemImage = "rbxassetid://90524635111098",
		description = "Makes people jewel-ous.",

		indexRarity = 256,
	},

	Diamond = {
		rarity = 512, -- 1 in 512
		rarityType = "Epic",
		baseWeight = NumberRange.new(8, 10),
		basePrice = 1250,
		itemImage = "rbxassetid://77396148774213",
		animationName = "Hold",
		description = "A clear rock that's highly sought after for some reason.",

		indexRarity = 512,
	},

	["Ancient artifact"] = {
		rarity = 2048, -- 1 in 2048
		rarityType = "Legendary",
		baseWeight = NumberRange.new(20, 22.5),
		basePrice = 4500,
		itemImage = "rbxassetid://104605374928382",
		description = "It's oddly heavy.",

		indexRarity = 2048,
	},

	-- Volcano
	["Volcano rock"] = {
		rarity = 320,
		rarityType = "Common",
		baseWeight = NumberRange.new(20, 22.5),
		basePrice = 50,
		itemImage = "rbxassetid://118432059776108",
		description = "Sometimes has tiny crystals in it from cooling.",

		indexRarity = 320,
	},
	["Skull"] = {
		rarity = 500,
		rarityType = "Common",
		baseWeight = NumberRange.new(20, 22.5),
		basePrice = 125,
		itemImage = "rbxassetid://72115667830784",
		description = "I wonder if they are missing this.",

		indexRarity = 500,
	},
	["Volcano's tear"] = {
		rarity = 620,
		rarityType = "Common",
		baseWeight = NumberRange.new(20, 22.5),
		basePrice = 150,
		itemImage = "rbxassetid://121295076787199",
		description = "A tear from the volcano. Because volcano's have feelings too.",
		indexRarity = 620,
	},
	Ammonoids = {
		rarity = 700,
		rarityType = "Common",
		baseWeight = NumberRange.new(25, 30),
		basePrice = 200,
		itemImage = "rbxassetid://81329471085203",
		description = "A fossil of an ancient creature. Probably a creepy one.",
		indexRarity = 700,
	},
	["Heat rock"] = {
		rarity = 1_000,
		rarityType = "Common",
		baseWeight = NumberRange.new(40, 50),
		basePrice = 250,
		itemImage = "rbxassetid://84979377926433",
		description = "A rock that's warm to the touch.",
		indexRarity = 1000,
	},
	["Lava bucket"] = {
		rarity = 2_000,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 60),
		basePrice = 300,
		itemImage = "rbxassetid://81391518039132",
		description = "I wonder how a bucket can hold lava.",
		indexRarity = 2000,
	},
	["Obsidian shard"] = {
		rarity = 3500,
		indexRarity = 3500,
		rarityType = "Common",
		baseWeight = NumberRange.new(50, 60),
		basePrice = 400,
		itemImage = "rbxassetid://115688166680356",
		description = "A shard of obsidian. What, were you expecting more?",
	},
	["Coal artifact"] = {
		rarity = 5000,
		indexRarity = 5000,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(50, 60),
		basePrice = 450,
		itemImage = "rbxassetid://129994688332470",
		description = "An artifact. Made out of coal. For some reason.",
	},
	["Jade statue"] = {
		rarity = 7500,
		indexRarity = 7500,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(65, 70),
		basePrice = 550,
		itemImage = "rbxassetid://138452528957421",
		description = "A good centerpiece.",
	},
	["T-Rex skull"] = {
		rarity = 15000,
		indexRarity = 15000,
		rarityType = "Rare",
		baseWeight = NumberRange.new(70, 75),
		basePrice = 725,
		itemImage = "rbxassetid://122748003577046",
		description = "I wonder if they are missing this.",
	},
	["T-Rex tooth"] = {
		rarity = 50000,
		indexRarity = 50000,
		rarityType = "Epic",
		baseWeight = NumberRange.new(50, 70),
		basePrice = 1250,
		itemImage = "rbxassetid://98431662126693",
		description = "How does the dentist put braces on this?",
	},
	["Obsidian crown"] = {
		rarity = 100000,
		indexRarity = 100000,
		rarityType = "Legendary",
		baseWeight = NumberRange.new(50, 70),
		basePrice = 5000,
		itemImage = "rbxassetid://127124055698540",
		description = "Probably belonged to a very powerful leader.",
	},

	-- Frozen
	["Icecicle"] = {
		rarity = 1,
		indexRarity = 900,
		rarityType = "Common",
		baseWeight = NumberRange.new(60, 70),
		basePrice = 50,
		itemImage = "rbxassetid://122468325756667",
		description = "Don't chew on it.",
	},

	["Sapphire gem"] = {
		rarity = 5,
		indexRarity = 1000,
		rarityType = "Common",
		baseWeight = NumberRange.new(60, 70),
		basePrice = 125,
		itemImage = "rbxassetid://84253809232755",
		description = "Basically ruby, but blue.",
	},
	["Viking dagger"] = {
		rarity = 25,
		indexRarity = 2000,
		rarityType = "Common",
		baseWeight = NumberRange.new(60, 70),
		basePrice = 150,
		itemImage = "rbxassetid://136607393225332",
		description = "I wouldn't get your fingerprints on it.",
	},
	["Viking sword"] = {
		rarity = 50,
		indexRarity = 3000,
		rarityType = "Common",
		baseWeight = NumberRange.new(70, 80),
		basePrice = 200,
		itemImage = "rbxassetid://107882679708293",
		description = "Pretty dull.",
	},
	["Viking helmet"] = {
		rarity = 100,
		indexRarity = 4000,
		rarityType = "Common",
		baseWeight = NumberRange.new(85, 90),
		basePrice = 250,
		itemImage = "rbxassetid://88040817247637",
		description = "Encrusted with a small ruby.",
	},
	["Frozen teddy"] = {
		rarity = 250,
		indexRarity = 5000,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(85, 90),
		basePrice = 300,
		itemImage = "rbxassetid://110019113674699",
		description = "How did it end up in this predicament?",
	},
	["Frozen ring"] = {
		rarity = 256,
		indexRarity = 10000,
		rarityType = "Uncommon",
		baseWeight = NumberRange.new(95, 100),
		basePrice = 400,
		itemImage = "rbxassetid://118242108570774",
		description = "It will probably melt out on its own.",
	},
	["Topaz amulet"] = {
		rarity = 512,
		indexRarity = 25000,
		rarityType = "Rare",
		baseWeight = NumberRange.new(95, 100),
		basePrice = 450,
		itemImage = "rbxassetid://112949825522969",
		description = "Some say topaz is a symbol of love.",
	},
	["Small gift"] = {
		rarity = 700,
		indexRarity = 50000,
		rarityType = "Rare",
		baseWeight = NumberRange.new(20, 20),
		basePrice = 3025,
		itemImage = "rbxassetid://85734447473447",
		description = "I wonder who this belonged to.",
	},
	["Gift"] = {
		rarity = 1024,
		indexRarity = 100000,
		rarityType = "Rare",
		baseWeight = NumberRange.new(30, 30),
		basePrice = 3025,
		itemImage = "rbxassetid://85734447473447",
		description = "I wonder who this belonged to.",
	},
	["Mammoth tusk"] = {
		rarity = 5024,
		indexRarity = 250000,
		rarityType = "Legendary",
		baseWeight = NumberRange.new(130, 135),
		basePrice = 1250,
		itemImage = "rbxassetid://81388213251759",
		description = "Contains valuable ivory.",
	},
	["Diamond yeti"] = {
		rarity = 20000,
		indexRarity = 1000000,
		rarityType = "Mythical",
		baseWeight = NumberRange.new(150, 150),
		basePrice = 5000,
		itemImage = "rbxassetid://98688622480490",
		description = "Abominably ICED out.",
	},
}

local trashConfig = {
	["Rusty nail"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://80374057285043",
		indexRarity = 2,
	},
	Scrap = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://110934630212562",
		indexRarity = 2,
	},
	["Old T-Shirt"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://134314922415893",
		indexRarity = 2,
	},
	["Old boot"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://91884190576086",
		indexRarity = 2,
	},
	["Old ring"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://87736149466419",
		indexRarity = 2,
	},
	["Old coin"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://111334825894769",
		indexRarity = 2,
	},
	["Old mitten"] = {
		rarity = 1,
		rarityType = "Common",
		baseWeight = NumberRange.new(1, 5),
		basePrice = 2,
		itemImage = "rbxassetid://114451456116905",
		description = "An old mitten.",
		indexRarity = 2,
	},
}
local fullTargetConfig = Sift.Dictionary.merge(targetConfig, trashConfig)
return {
	targetConfig = targetConfig,
	trashConfig = trashConfig,
	fullTargetConfig = fullTargetConfig,
}
