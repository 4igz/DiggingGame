//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { UiController } from "./uiController";
import { DialogResponse, QUEST_ACCEPT, QUEST_DECLINE, questConfig } from "shared/config/questConfig";
import { gameConstants } from "shared/constants";
import { QuestProgress } from "shared/networkTypes";
import { Events, Functions } from "client/network";
import ReactRoblox from "@rbxts/react-roblox";
import TypewriterBillboard from "client/reactComponents/typeWritingBillboard";
import React from "@rbxts/react";

const registeredNpcs = new Set<Instance>();
const questProgress = new Map<keyof typeof questConfig, QuestProgress>();

@Controller({})
export class QuestController implements OnStart {
	constructor(private readonly uiController: UiController) {}

	onStart(): void | Promise<void> {
		const createQuestGiver = (questNpc: Model) => {
			const npcName = questNpc.Name;
			const questline = questConfig[npcName];
			if (!questline) {
				warn(`No quest data found for ${npcName}`);
				return;
			}
			if (registeredNpcs.has(questNpc)) return;

			const prompt = new Instance("ProximityPrompt");
			prompt.Style = Enum.ProximityPromptStyle.Custom;
			prompt.ActionText = "Talk";
			prompt.Name = npcName;
			prompt.MaxActivationDistance = 10;
			prompt.Parent = questNpc;

			const newUiFolder = new Instance("Folder");
			newUiFolder.Name = "DialogBillboard";
			newUiFolder.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

			const dialogRoot = ReactRoblox.createRoot(newUiFolder);

			prompt.Triggered.Connect((playerWhoTriggered) => {
				if (playerWhoTriggered !== Players.LocalPlayer) return;
				const currentProgress = questProgress.get(questNpc.Name);
				if (!currentProgress) {
					return;
				}
				if (currentProgress.stage >= questline.size()) {
					// Questline is complete
					return;
				}
				const quest = questline[currentProgress.stage];
				if (!quest) {
					warn(`Using invalid index (${currentProgress.stage}) for questline ${npcName}`);
					return;
				}
				const active = currentProgress.active;
				prompt.Enabled = false;

				let canComplete = false;
				if (active) {
					Functions.isQuestComplete(npcName)
						.then((value) => {
							canComplete = value;
						})
						.await();
				}

				dialogRoot.render(
					React.createElement(TypewriterBillboard, {
						text: canComplete
							? quest.completeResponse
							: active
							? quest.subsequentResponse
							: quest.initialResponse,
						resetTrigger: tick(),
						part: questNpc.PrimaryPart!,
						typingSpeed: 50,
						onFinish: () => {
							if (canComplete) {
								Functions.requestTurnInQuest(npcName);
								task.delay(1, () => {
									prompt.Enabled = true;
									dialogRoot.unmount();
								});
								return;
							}
							if (active) {
								task.delay(1, () => {
									prompt.Enabled = true;
									dialogRoot.unmount();
								});
								return;
							}
							this.uiController.toggleUi(gameConstants.DIALOG_PROMPT, {
								options: quest.playerResponses,
								resetTrigger: tick(),
								onOptionSelected: (responseType: DialogResponse) => {
									dialogRoot.unmount();
									prompt.Enabled = true;
									this.uiController.closeUi(gameConstants.DIALOG_PROMPT);

									switch (responseType) {
										case QUEST_ACCEPT:
											Events.startNextQuest(npcName);
											break;
										case QUEST_DECLINE:
											break;
										default:
											// Probably a response with no DialogResponse key, or a generic response that doesn't do anything
											break;
									}
								},
							});
						},
					}),
				);
			});

			registeredNpcs.add(questNpc);
		};

		Functions.getQuestProgress().then((questProgress) => {
			if (questProgress !== undefined) {
				questProgress = questProgress;
			}
		});

		Events.updateQuestProgress.connect((questProgress) => {
			questProgress = questProgress;
		});

		for (const questNpc of CollectionService.GetTagged("QuestGiver")) {
			assert(
				questNpc.IsA("Model"),
				`QuestGiver tag must be on a model, got '${questNpc.ClassName}': (${questNpc.GetFullName()})`,
			);
			createQuestGiver(questNpc as Model);
		}

		CollectionService.GetInstanceAddedSignal("QuestGiver").Connect((questNpc) => {
			assert(
				questNpc.IsA("Model"),
				`QuestGiver tag must be on a model, got '${questNpc.ClassName}': (${questNpc.GetFullName()})`,
			);
			createQuestGiver(questNpc as Model);
		});
	}
}
