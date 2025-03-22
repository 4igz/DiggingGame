//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Players, ReplicatedStorage, TweenService } from "@rbxts/services";
import {
	DialogResponse,
	IDLE,
	Key,
	npcAnimationConfig,
	QUEST_ACCEPT,
	QUEST_DECLINE,
	questConfig,
	TALK,
} from "shared/config/questConfig";
import { gameConstants } from "shared/gameConstants";
import { QuestProgress } from "shared/networkTypes";
import { Events, Functions } from "client/network";
import ReactRoblox from "@rbxts/react-roblox";
import TypewriterBillboard from "client/reactComponents/typeWritingBillboard";
import React from "@rbxts/react";
import Object from "@rbxts/object-utils";
import { debugWarn } from "shared/util/logUtil";
import UiController from "./uiController";

const registeredNpcs = new Set<Instance>();
let questProgress = new Map<keyof typeof questConfig, QuestProgress>();
const animationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

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

			const highlight = new Instance("Highlight");
			highlight.Name = "Highlight";
			highlight.DepthMode = Enum.HighlightDepthMode.Occluded;
			highlight.FillColor = Color3.fromRGB(255, 255, 255);
			highlight.FillTransparency = 1;
			highlight.Adornee = questNpc;
			highlight.OutlineTransparency = 1;
			highlight.Parent = questNpc;

			const newUiFolder = new Instance("Folder");
			newUiFolder.Name = "DialogBillboard";
			newUiFolder.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

			const dialogRoot = ReactRoblox.createRoot(newUiFolder);

			const animTracks: Map<Key, AnimationTrack> = new Map();
			const animationConfig = npcAnimationConfig[npcName];
			const humanoid = questNpc.WaitForChild("Humanoid");
			let animator = humanoid?.FindFirstChildOfClass("Animator");
			if (!animator) {
				animator = new Instance("Animator");
				animator.Parent = humanoid;
			}

			if (animationConfig) {
				for (const [animationType, value] of Object.entries(animationConfig)) {
					const animation = animationFolder.FindFirstChild(value);
					if (!animation || !animation.IsA("Animation")) {
						warn("Unknown animation: " + value);
						continue;
					}
					if (animation) {
						const track = animator.LoadAnimation(animation);

						switch (animationType) {
							case IDLE:
								track.Looped = true;
								track.Priority = Enum.AnimationPriority.Idle;
								break;
							case TALK:
								track.Looped = false;
								track.Priority = Enum.AnimationPriority.Idle;
							default:
								track.Looped = false;
								track.Priority = Enum.AnimationPriority.Action;
								break;
						}

						animTracks.set(animationType as Key, track);
					}
				}
			}

			const playAnimation = (key: Key): Promise<boolean> => {
				const track = animTracks.get(key);
				if (track) {
					for (const [, otherTrack] of animTracks) {
						otherTrack.Stop();
					}
					track.Play();
					return Promise.fromEvent(track.Stopped);
				}
				return Promise.resolve(false);
			};

			playAnimation(IDLE);

			prompt.PromptShown.Connect(() => {
				TweenService.Create(
					highlight,
					new TweenInfo(0.25, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut),
					{ OutlineTransparency: 0 },
				).Play();
			});
			prompt.PromptHidden.Connect(() => {
				TweenService.Create(
					highlight,
					new TweenInfo(0.25, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut),
					{ OutlineTransparency: 1 },
				).Play();
			});

			prompt.Triggered.Connect((playerWhoTriggered) => {
				if (playerWhoTriggered !== Players.LocalPlayer) return;
				const currentProgress = questProgress.get(questNpc.Name);
				if (!currentProgress) {
					debugWarn(`No quest progress found for ${npcName}`);
					return;
				}
				if (currentProgress.stage >= questline.size()) {
					// Questline is complete
					debugWarn(`Questline for ${npcName} is complete`);
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
						.catch(warn)
						.await();
				}

				playAnimation(TALK);

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
									playAnimation(IDLE);
								});
								return;
							}
							if (active) {
								task.delay(1, () => {
									prompt.Enabled = true;
									dialogRoot.unmount();
									playAnimation(IDLE);
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
											playAnimation(QUEST_ACCEPT).then(() => {
												playAnimation(IDLE);
											});
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

		Functions.getQuestProgress()
			.then((serverTrackedProgress) => {
				questProgress = serverTrackedProgress;
			})
			.catch((e) => {
				warn(e);
			});

		Events.updateQuestProgress.connect((serverTrackedProgress) => {
			questProgress = serverTrackedProgress;
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
