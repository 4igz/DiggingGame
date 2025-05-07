import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { questConfig } from "shared/config/questConfig";
import Object from "@rbxts/object-utils";
import { LoadedProfile, ProfileService } from "../backend/profileService";
import { MoneyService } from "../backend/moneyService";
import { LevelService } from "./levelService";
import { InventoryService } from "./inventoryService";
import { QuestProgress } from "shared/networkTypes";
import { Players } from "@rbxts/services";
import { debugWarn } from "shared/util/logUtil";

@Service({})
export class QuestService implements OnStart {
	private QUEST_RESET_TIME = 86400; // 24 hours
	private questsReady = new Array<Player>();

	private readonly DEFAULT_QUEST_PROGRESS = new Map<keyof typeof questConfig, QuestProgress>(
		Object.keys(questConfig).map((questName) => [questName, { stage: 0, active: false, completed: false }]),
	);

	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly levelService: LevelService,
		private readonly inventoryService: InventoryService,
	) {}

	onStart() {
		// Ensure quests are setup correctly.
		for (const [questLineName, questline] of Object.entries(questConfig)) {
			for (const [questIndex, quest] of Object.entries(questline)) {
				switch (quest.questType) {
					case "Collect": {
						if (quest.collectAmount === undefined) {
							warn(
								`Collect quest: (["${questLineName}"]: ${questIndex}) missing "collectAmount" specification`,
							);
						}
						break;
					}
					default:
						warn(`Quest type "${quest.questType}" not implemented`);
						break;
				}
			}
		}

		Events.startNextQuest.connect((player, questline) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;
			const questProgress = profile.Data.questProgress.get(questline);
			if (!questProgress) {
				return;
			}
			if (questProgress.stage >= questConfig[questline].size()) {
				return;
			}
			// If any previous active quest that's not completed, set it to inactive
			for (const [key, value] of profile.Data.questProgress) {
				if (value.active) {
					value.active = false;
					profile.Data.questProgress.set(key, value);
				}
			}

			if (!questProgress.active) {
				questProgress.active = true;
				profile.Data.questProgress.set(questline, questProgress);
				Events.updateQuestProgress.fire(player, profile.Data.questProgress);
			}

			// Technically we don't need to set the profile here, but it's good practice to show where the profile is being modified by calling this method.
			this.profileService.setProfile(player, profile);
		});

		Functions.requestTurnInQuest.setCallback((player, questName) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const questProgress = profile.Data.questProgress.get(questName);
			if (!questProgress) {
				debugWarn("No quest progress found for", questName);
				return false;
			}
			if (!questProgress.active) {
				debugWarn("Quest is not active", questName);
				return false;
			}

			const isComplete = this.isQuestComplete(player, questName, questProgress.stage);

			print(isComplete);

			if (isComplete) {
				this.completeQuest(player, questName, questProgress.stage);
				questProgress.active = false;
				questProgress.stage++;
				profile.Data.questProgress.set(questName, questProgress);
				Events.updateQuestProgress.fire(player, profile.Data.questProgress);
				this.profileService.setProfile(player, profile);
			}

			return isComplete;
		});

		Functions.isQuestComplete.setCallback((player, questName) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const questProgress = profile.Data.questProgress.get(questName);
			if (!questProgress) {
				debugWarn("No quest progress found for", questName);
				return false;
			}
			if (!questProgress.active) {
				debugWarn("Quest is not active", questName);
				return false;
			}
			return this.isQuestComplete(player, questName, questProgress.stage);
		});

		Functions.getQuestProgress.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();

			if (this.questsReady.includes(player)) {
				return profile.Data.questProgress;
			} else {
				this.checkAndReadyQuestProgress(player, profile);

				return profile.Data.questProgress;
			}
		});

		this.profileService.onProfileLoaded.Connect((player, profile) => {
			this.checkAndReadyQuestProgress(player, profile);

			Events.updateQuestProgress.fire(player, profile.Data.questProgress);
		});

		Players.PlayerRemoving.Connect((player) => {
			this.questsReady.remove(this.questsReady.indexOf(player));
		});
	}

	private checkAndReadyQuestProgress(player: Player, profile: LoadedProfile) {
		if (!this.questsReady.includes(player)) {
			const lastReset = profile.Data.lastQuestReset;

			// If we add more quests, or change the name of a quest, we need to reset the quest progress
			// of this player because their quest progress will be out of sync with the quest config.
			let keysMatch = true;
			for (const [key] of this.DEFAULT_QUEST_PROGRESS) {
				if (!profile.Data.questProgress.has(key)) {
					keysMatch = false;
					break;
				}
			}

			if (tick() - lastReset > this.QUEST_RESET_TIME || !keysMatch) {
				profile.Data.questProgress = this.DEFAULT_QUEST_PROGRESS;
				profile.Data.lastQuestReset = tick();
			}

			// Ensure only one quest is active
			let activeQuest = false;
			for (const [key, value] of profile.Data.questProgress) {
				if (value.active) {
					if (activeQuest) {
						value.active = false;
						profile.Data.questProgress.set(key, value);
					} else {
						activeQuest = true;
					}
				}
			}

			this.profileService.setProfile(player, profile);
			this.questsReady.push(player);
		}
	}

	completeQuest(player: Player, questName: keyof typeof questConfig, questStage: number) {
		const questline = questConfig[questName];
		const quest = questline[questStage];
		if (!quest) {
			warn("Attempting to reward player for non-existent quest", questName, questStage);
			return;
		}

		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		switch (quest.questReward) {
			case "Money":
				this.moneyService.giveMoney(player, quest.questRewardAmount as number, true);
				break;
			case "Experience":
				this.levelService.addExperience(player, quest.questRewardAmount as number);
				break;
			default:
				error(`Quest reward type "${quest.questReward}" not implemented`);
		}

		switch (quest.questType) {
			case "Collect":
				// Remove the collect amount of the target item from the player's inventory
				const targetCount = quest.collectAmount!;
				let removedCount = 0;
				for (let i = profile.Data.targetInventory.size() - 1; i >= 0; i--) {
					const target = profile.Data.targetInventory[i];
					if (target.name === quest.target) {
						this.inventoryService.removeTargetItemFromInventory(player, target.itemId);
						if (++removedCount >= targetCount) {
							break;
						}
					}
				}
				this.profileService.setProfile(player, profile);
				break;
			default:
				error(`Quest type "${quest.questType}" not implemented`);
		}
	}

	isQuestComplete(player: Player, questName: keyof typeof questConfig, questStage: number): boolean {
		const questline = questConfig[questName];
		const quest = questline[questStage];
		if (!quest) {
			return false;
		}

		const profile = this.profileService.getProfile(player);
		if (!profile) return false;

		switch (quest.questType) {
			case "Collect":
				const targetCount = profile.Data.targetInventory.reduce((acc, target) => {
					if (target.name === quest.target) {
						return ++acc;
					}
					return acc;
				}, 0);

				return targetCount >= quest.collectAmount!;
			default:
				error(`Quest type "${quest.questType}" not implemented`);
		}
	}
}
