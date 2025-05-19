import { Controller, OnStart } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { highlightPool } from "client/components/boat";
import { Events, Functions } from "client/network";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { DETECT_STEP, QUEST_STEP, SELL_STEP } from "shared/config/tutorialConfig";
import { Signals } from "shared/signals";

@Controller({
	loadOrder: 1000,
})
export class TutorialController implements OnStart {
	public tutorialActive = false;
	public currentStage = 0;

	onStart() {
		Signals.setTutorialStep.Connect((step) => {
			this.tutorialActive = true;
			this.currentStage = step;

			if (step === SELL_STEP) {
				const highlight = highlightPool.acquire();
				highlight.Parent = Workspace.FindFirstChild("NPCs")
					?.FindFirstChild("Shops")
					?.FindFirstChild("GrasslandsSell")
					?.FindFirstChild("Sell");

				const period = 1; // Time in seconds for a full oscillation
				const halfPeriod = period / 2;
				let elapsedTime = 0;
				Signals.waypointArrow.Fire(new Vector3(-1564.093, 8.387, 409.96));
				while (this.currentStage === SELL_STEP) {
					elapsedTime += task.wait();
					const phase = (elapsedTime % period) / halfPeriod;
					highlight.FillTransparency = phase <= 1 ? 0.5 + phase * 0.5 : 0.5 + (2 - phase) * 0.5;
				}
				highlightPool.release(highlight);
				Signals.hideWaypointArrow.Fire();
			} else if (step === QUEST_STEP) {
				const highlight = highlightPool.acquire();
				highlight.Parent = Workspace.FindFirstChild("NPCs")
					?.FindFirstChild("Quests")
					?.FindFirstChild("Plankwalker Paul");

				const period = 1; // Time in seconds for a full oscillation
				const halfPeriod = period / 2;
				let elapsedTime = 0;
				task.delay(0.2, () => {
					Signals.waypointArrow.Fire(new Vector3(-1499.873, 3.521, 416.698));
				});
				while (this.currentStage === QUEST_STEP) {
					elapsedTime += task.wait();
					const phase = (elapsedTime % period) / halfPeriod;
					highlight.FillTransparency = phase <= 1 ? 0.5 + phase * 0.5 : 0.5 + (2 - phase) * 0.5;
				}
				highlightPool.release(highlight);
				Signals.hideWaypointArrow.Fire();
				Events.completedTutorial();
				this.tutorialActive = false;
			}
		});

		Signals.tutorialStepCompleted.Connect((step) => {
			if (!this.tutorialActive) return;
			if (step !== this.currentStage) {
				// Only progress if completed current step
				return;
			}
			this.currentStage++;
			Signals.setTutorialStep.Fire(this.currentStage);

			// Now use arrows to point if the stage calls for it or etc
		});

		// Like if they failed somewhere and need to start over.
		Signals.resetTutorial.Connect(() => {
			if (!this.tutorialActive) return;
			const character = Players.LocalPlayer.Character;
			const tool = character?.FindFirstChildWhichIsA("Tool");
			if (!character || !tool || !metalDetectorConfig[tool.Name]) {
				this.currentStage = 0;
			} else {
				this.currentStage = DETECT_STEP;
			}
			Signals.setTutorialStep.Fire(this.currentStage);
		});
	}
}
