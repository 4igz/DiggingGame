local ReplicatedStorage = game:GetService("ReplicatedStorage")

local crossPlatformUtil = require(ReplicatedStorage.TS.util.crossPlatformUtil)
local getPlatform = crossPlatformUtil.getPlayerPlatform
local iota = require(ReplicatedStorage.TS.util.nameUtil).iota

type TutorialStep = {
	message: string,
}

local uid = "TutorialIota"
local EQUIP_STEP = 0
local DETECT_STEP = iota(uid)
local TREASURE_STEP = iota(uid)
local DIG_STEP = iota(uid)
local SELL_STEP = iota(uid)
local QUEST_STEP = iota(uid)
local FINISH_STEP = iota(uid)

-- Step actions are precoded in this order. Messages are customizable here though!

local platform = getPlatform()
local detectButton = if platform == "Mobile"
	then "Detect"
	else if platform == "PC" then "Click" else if platform == "Console" then "R2" else "Detect"
local digButton = if platform == "Mobile"
	then "Tap"
	else if platform == "PC" then "Click" else if platform == "Console" then "L2/R2" else "Tap"

local tutorialConfig: { { TutorialStep } } = {
	[EQUIP_STEP] = {
		message = `Equip your <font color="rgb(255, 255, 0)"><b>detector</b></font>!`,
	},
	[DETECT_STEP] = {
		message = `Hey, looks like you're new, <font color="rgb(255, 255, 0)"><b>Hold {detectButton}</b></font> to start detecting treasures!`,
	},
	[TREASURE_STEP] = {
		message = `Great job! Now <font color="rgb(255, 255, 0)"><b>follow the arrow!</b></font>`,
	},
	[DIG_STEP] = {
		message = `Great job, now use <font color="rgb(255, 255, 0)"><b>{digButton}</b></font> to dig the treasure!`,
	},
	[SELL_STEP] = {
		message = `Amazing! Your first treasure! <font color="rgb(255, 255, 0)"><b>Follow the arrow</b></font> and talk to the Sell Booth merchant to sell your treasure!`,
	},
	[QUEST_STEP] = {
		message = `Now go <font color="rgb(255, 255, 0)"><b>talk</b></font> to Plankwalker Paul!`,
	},
	[FINISH_STEP] = {
		message = "Way to go! You will be the richest out there!",
	},
}

return {
	tutorialConfig = tutorialConfig,
	EQUIP_STEP = EQUIP_STEP,
	DETECT_STEP = DETECT_STEP,
	DIG_STEP = DIG_STEP,
	TREASURE_STEP = TREASURE_STEP,
	SELL_STEP = SELL_STEP,
	QUEST_STEP = QUEST_STEP,
	FINISH_STEP = FINISH_STEP,
}
