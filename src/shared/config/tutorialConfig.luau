local ReplicatedStorage = game:GetService("ReplicatedStorage")

local crossPlatformUtil = require(ReplicatedStorage.TS.util.crossPlatformUtil)
local getPlatform = crossPlatformUtil.getPlayerPlatform

type TutorialStep = {
	message: string,
	stepNum: number, -- Mainly for visual aid
}

-- Step actions are precoded in this order. Messages are customizable here though!

local platform = getPlatform()
local actionButton = if platform == "Mobile"
	then "Tap"
	else if platform == "PC" then "Click" else if platform == "Console" then "L2/R2" else "Tap"

local tutorialConfig: { { TutorialStep } } = {
	{
		message = "Hey, looks like you're new, Hold to start detecting treasures!",
		stepNum = 0,
	},
	{
		message = "Great job! Now follow the arrow!",
		stepNum = 1,
	},
	{
		message = `Great job, now use {actionButton} to dig the treasure!`,
		stepNum = 2,
	},
	{
		message = "Amazing! Your first treasure! Follow the arrow and talk to the Sell Booth merchant to sell your treasure!",
		stepNum = 3,
	},
	{
		message = "Talk to plankwalker paul!",
		stepNum = 4,
	},
	{
		message = "You're really good at this! Keep going and you will be the richest out there!",
		stepNum = 5,
	},
}

return {
	tutorialConfig = tutorialConfig,
}
