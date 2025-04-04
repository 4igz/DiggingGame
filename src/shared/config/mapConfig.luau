--!optimize 2
--!native
-- Compiled with roblox-ts v3.0.0
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
			"Treasure chest",
			"Ring",
			"Necklace",
			"Diamond",
			"Bag of coins",
			"Ancient artifact",
			"Gold chalice",
			"Ruby",
			"Cool shell",
			"Golden eyepatch",
			"Jade fish",
			"Bejeweled pegleg",
		}, Object.keys(trashConfig)),
		recommendedStrength = 1,
		difficulty = "Easy",
		order = 1,
	},
	Volcano = {
		targetList = Sift.Array.concat({
			"Volcano rock",
			"Volcano's tear",
			"Ammonoids",
			"Heat rock",
			"Lava bucket",
			"Obsidian shard",
			"Coal artifact",
			"Jade statue",
			"T-Rex tooth",
			"T-Rex skull",
			"Skull",
			"Obsidian crown",
		}, Object.keys(trashConfig)),
		recommendedStrength = 12,
		difficulty = "Easy",
		order = 2,
	},
	Frozen = {
		targetList = Sift.Array.concat({
			"Frozen ring",
			"Frozen teddy",
			"Icecicle",
			"Sapphire gem",
			"Viking dagger",
			"Viking sword",
			"Topaz amulet",
			"Gift",
			"Small gift",
			"Mammoth tusk",
			"Diamond yeti",
			"Viking helmet",
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
