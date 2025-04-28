local ReplicatedStorage = game:GetService("ReplicatedStorage")

local iota = require(ReplicatedStorage.TS.util.nameUtil).iota
local targetConfig = require(ReplicatedStorage.TS.config.targetConfig)

type ItemType = "MetalDetectors" | "Shovels" | "Target" | "Boats" | "Potions"
type QuestRewardType = "Money" | "Experience" | ItemType | "None"
type QuestType = "Collect"

type TargetConfig = typeof(targetConfig.targetConfig)
type TrashConfig = typeof(targetConfig.trashConfig)
type Targets = keyof<TargetConfig & TrashConfig>

type QuestConfig = {
	questType: QuestType,
	questReward: QuestRewardType,
	questRewardAmount: number,

	-- Dialog prompts:
	playerResponses: { string },

	initialResponse: string, -- First dialog when gets the quest
	subsequentResponse: string, -- Dialog when player doesn't meet the quest requirements
	completeResponse: string, -- Dialog when player completes the quest and meets requirements

	target: Targets,
	collectAmount: number?,
}

local uid = script:GetFullName()
local QUEST_ACCEPT = iota(uid)
local QUEST_DECLINE = iota(uid)
local TALK = iota(uid)
local IDLE = iota(uid)

local questConfig: { [string]: { QuestConfig } } = {
	["Plankwalker Paul"] = {
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 250,

			playerResponses = { [QUEST_ACCEPT] = "Got it", [QUEST_DECLINE] = "No thanks" },

			initialResponse = "Bring me a bag of coins and\n I'll reward you with some money!",
			subsequentResponse = "Did you forget already? \nI said bring me a bag of coins!",
			completeResponse = "Thank you for the bag of coins!\n Here's your reward! Come back and I've got\n another ask of you!",

			target = "Bag of coins" :: Targets, -- while strict, it's necessary to cast to Targets because of the luau typesolver
			collectAmount = 1,
		},
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 3500,

			playerResponses = { [QUEST_ACCEPT] = "Of course", [QUEST_DECLINE] = "I can't right now" },

			initialResponse = "I lost my ring. Can you find it for me?",
			subsequentResponse = "Did you find my ring yet?",
			completeResponse = "You actually found my ring! But before you go, I need a big favor...",

			target = "Ring" :: Targets, -- while strict, it's necessary to cast to Targets because of the luau typesolver
			collectAmount = 1,
		},
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 10_000,

			playerResponses = {
				[QUEST_ACCEPT] = "I've got your back matey",
				[QUEST_DECLINE] = "See you walking the plank!",
			},

			initialResponse = "Don't tell the captain, but I've \nlost his prized peg-leg. \nCan you please help me find it?",
			subsequentResponse = "Did you find the peg-leg yet?",
			completeResponse = "Yar!! I don't know what I would do without you. \nHere's your reward!",

			target = "Bejeweled pegleg" :: Targets, -- while strict, it's necessary to cast to Targets because of the luau typesolver
			collectAmount = 1,
		},
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 50_000,

			playerResponses = { [QUEST_ACCEPT] = "Yar matey", [QUEST_DECLINE] = "Nay" },

			initialResponse = "I've heard you can find diamonds on this island. \nCan you bring me one? I'll reward you well!",
			subsequentResponse = "Bring me a diamond and I'll reward you well!",
			completeResponse = "Yarrr!!! I can't believe you found a diamond! \nEveryone is going to be so jealous!",

			target = "Diamond" :: Targets, -- while strict, it's necessary to cast to Targets because of the luau typesolver
			collectAmount = 1,
		},
	},
	["Baitin’ Bob"] = {
		-- These are intended to be placeholders to show you how to create quests
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 25000,

			playerResponses = { [QUEST_ACCEPT] = "Of course", [QUEST_DECLINE] = "No, find them yourself" },

			initialResponse = "I'm looking for 3 missing skulls.\n Can you find them for me?",
			subsequentResponse = "Don't ask me why I need them, \njust bring them to me!",
			completeResponse = "I appreciate it. Here's a little something\n for you! Can you do something else for me?",

			target = "Skull" :: Targets,
			collectAmount = 3,
		},

		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 100000,

			playerResponses = { [QUEST_ACCEPT] = "Sure!", [QUEST_DECLINE] = "No, find them yourself" },

			initialResponse = "I'm looking for 3 Heat rocks. \nCan you find them for me?",
			subsequentResponse = "Did you find the Heat rock yet?",
			completeResponse = "Here, take this as a token of my gratitude!",

			target = "Heat rock" :: Targets,
			collectAmount = 3,
		},

		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 350000,

			playerResponses = { [QUEST_ACCEPT] = "Sure!", [QUEST_DECLINE] = "If I did I would keep it for myself" },

			initialResponse = "I'm looking for 3 jade statues. \nCan you find them for me?",
			subsequentResponse = "Did you find the jade statues yet?",
			completeResponse = "Thank you!!!!!",

			target = "Jade statue" :: Targets,
			collectAmount = 3,
		},

		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 1000000,

			playerResponses = { [QUEST_ACCEPT] = "Sure!", [QUEST_DECLINE] = "No thanks" },

			initialResponse = "I'm searching for the legendary Obsidian crown, \ncan you help me find it?",
			subsequentResponse = "Did you find the Obsidian crown yet?",
			completeResponse = "Thank you!!!!!",

			target = "Obsidian crown" :: Targets,
			collectAmount = 1,
		},
	},
	["Abominable Joe-man"] = {
		-- These are intended to be placeholders to show you how to create quests
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 1000,

			playerResponses = { [QUEST_ACCEPT] = "Of course", [QUEST_DECLINE] = "No, find them yourself" },

			initialResponse = "Do you mind bringing me 10 Icecicles?",
			subsequentResponse = "Don't ask me why I need them, just find them!",
			completeResponse = "I appreciate it. Here's a little something for you! \nCan you do something else for me?",

			target = "Icecicle" :: Targets,
			collectAmount = 10,
		},
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 10_000,

			playerResponses = { [QUEST_ACCEPT] = "Sure!", [QUEST_DECLINE] = "If I did I would keep it for myself" },

			initialResponse = "I lost my topaz amulet. Can you find it for me?",
			subsequentResponse = "Do you have my amulet?",
			completeResponse = "Wow I looked everywhere for this! Thank you!",

			target = "Topaz amulet" :: Targets,
			collectAmount = 1,
		},
	},
}

-- The animations must be stored in ReplicatedStorage/Assets/Animations
local npcAnimationConfig = {
	["Plankwalker Paul"] = {
		[QUEST_ACCEPT] = "BoatGuyBought",
		[TALK] = "NpcTalkBoat",
		[IDLE] = "NpcIdleBoat",
	},
	["Baitin’ Bob"] = {
		[IDLE] = "NpcFish",
	},
	["Abominable Joe-man"] = {
		[QUEST_ACCEPT] = "BoatGuyBought",
		[TALK] = "NpcTalkBoat",
		[IDLE] = "NpcIdleBoat",
	},
}

local npcCharacterRenders = {
	["Plankwalker Paul"] = "rbxassetid://77880591512469",
	["Baitin’ Bob"] = "rbxassetid://108020026923113",
	["Abominable Joe-man"] = "rbxassetid://81062336181962",
}

return {
	questConfig = questConfig,
	npcAnimationConfig = npcAnimationConfig,
	npcCharacterRenders = npcCharacterRenders,
	QUEST_ACCEPT = QUEST_ACCEPT,
	QUEST_DECLINE = QUEST_DECLINE,
	TALK = TALK,
	IDLE = IDLE,
}
