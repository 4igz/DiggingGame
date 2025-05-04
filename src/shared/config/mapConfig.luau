--!optimize 2
--!native
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Object =
	TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "object-utils")
local trashConfig = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "config", "targetConfig").trashConfig
local Sift =
	TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "sift", "out")

local difficulties = {
	Easy = Color3.new(0, 1, 0),
	Medium = Color3.new(1, 0.5, 0),
	Hard = Color3.new(1, 0, 0),
}
local mapConfig = {
	Grasslands = {
		targetList = Sift.Array.concat({
			"Treasure Chest",
			"Ring",
			"Necklace",
			"Diamond",
			"Bag Of Coins",
			"Ancient Artifact",
			"Gold Chalice",
			"Ruby",
			"Cool Shell",
			"Golden Eyepatch",
			"Jade Fish",
			"Bejeweled Pegleg",
		}, Object.keys(trashConfig)),
		recommendedStrength = 1,
		difficulty = "Easy",
		order = 1,
	},
	Volcano = {
		targetList = Sift.Array.concat({
			"Volcano Rock",
			"Volcano's Tear",
			"Ammonoids",
			"Heat Rock",
			"Lava Bucket",
			"Obsidian Shard",
			"Coal Artifact",
			"Jade Statue",
			"T-Rex Tooth",
			"T-Rex Skull",
			"Skull",
			"Obsidian Crown",
		}, Object.keys(trashConfig)),
		recommendedStrength = 12,
		difficulty = "Easy",
		order = 2,
	},
	Frozen = {
		targetList = Sift.Array.concat({
			"Frozen Ring",
			"Frozen Teddy",
			"Icicle",
			"Sapphire Gem",
			"Viking Dagger",
			"Viking Sword",
			"Topaz Amulet",
			"Gift",
			"Small Gift",
			"Mammoth Tusk",
			"Diamond Yeti",
			"Viking Helmet",
		}, Object.keys(trashConfig)),
		recommendedStrength = 50,
		difficulty = "Easy",
		order = 3,
	},
}
return {
	difficulties = difficulties,
	mapConfig = mapConfig,
}
