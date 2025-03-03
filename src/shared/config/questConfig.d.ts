import { ItemType } from "shared/networkTypes";
import { fullTargetConfig, targetConfig } from "./targetConfig";

export const QUEST_ACCEPT: 1;
export const QUEST_DECLINE: 2;
export const TALK: 3;
export const IDLE: 4;

export type Key = typeof QUEST_ACCEPT | typeof QUEST_DECLINE | typeof TALK | typeof IDLE;

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

export const npcAnimationConfig: Record<keyof typeof questConfig, Record<Key, string>>;
