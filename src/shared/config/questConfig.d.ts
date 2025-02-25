import { ItemType } from "shared/networkTypes";
import { fullTargetConfig, targetConfig } from "./targetConfig";

export const QUEST_ACCEPT: "QUEST_ACCEPT";
export const QUEST_DECLINE: "QUEST_DECLINE";

type QuestRewardType = "Money" | "Experience" | ItemType | "None";
type QuestType = "Collect";

export type DialogResponse = typeof QUEST_ACCEPT | typeof QUEST_DECLINE;

export type QuestConfig = {
	questType: QuestType;
	questReward: QuestRewardType;
	questRewardAmount: number;

	playerResponses: string[];

	initialResponse: string; // First dialog when gets the quest
	subsequentResponse: string; // Dialog when player doesn't meet the quest requirements
	completeResponse: string; // Dialog when player completes the quest and meets requirements

	target: keyof typeof fullTargetConfig;
	collectAmount?: number;
};

export const questConfig: Record<string, QuestConfig[]>;
