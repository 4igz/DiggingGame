local targetConfig = require(script.Parent.targetConfig)
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

local QUEST_ACCEPT = "QUEST_ACCEPT"
local QUEST_DECLINE = "QUEST_DECLINE"

local questConfig: { [string]: { QuestConfig } } = {
	["TestQuestGiver"] = {
		{
			questType = "Collect",
			questReward = "Money",
			questRewardAmount = 1000,

			playerResponses = { [QUEST_ACCEPT] = "Got it", [QUEST_DECLINE] = "No thanks" },

			initialResponse = "Bring me a bag of coins and I'll reward you with some money!",
			subsequentResponse = "Did you forget already? I said 3 bags of coins!",
			completeResponse = "Thank you for the bags of coins! Here's your reward!",

			target = "Bag of coins" :: Targets, -- it's necessary to cast to Targets because of the luau typesolver
			collectAmount = 1,
		},
	},
}

return {
	questConfig = questConfig,
	QUEST_ACCEPT = QUEST_ACCEPT,
	QUEST_DECLINE = QUEST_DECLINE,
}
