//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Players, RunService, UserInputService } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { Pather } from "shared/util/pather";
import { ShovelController } from "./shovelController";
import { DetectorController } from "./detectorController";
import { Signals } from "shared/signals";
import { gameConstants } from "shared/gameConstants";
import { inventorySizeAtom, treasureCountAtom } from "client/atoms/inventoryAtoms";
import { debugWarn } from "shared/util/logUtil";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";

interface MovementKeyMap {
	[keyCode: number]: boolean;
}

interface MovementInputsMap {
	[inputType: number]: MovementKeyMap | boolean;
}

/**
 *  MOVEMENT_INPUTS:
 *  Maps UserInputType -> either a table of KeyCodes or a boolean.
 *    - For Keyboard/Gamepad, we have an object of KeyCode booleans (e.g. W, A, S, D).
 *    - FIXME: For Touch, any touch is considered a movement.
 */
const MOVEMENT_INPUTS: MovementInputsMap = {
	[Enum.UserInputType.Keyboard.Value]: {
		[Enum.KeyCode.W.Value]: true,
		[Enum.KeyCode.A.Value]: true,
		[Enum.KeyCode.S.Value]: true,
		[Enum.KeyCode.D.Value]: true,
		[Enum.KeyCode.Up.Value]: true,
		[Enum.KeyCode.Down.Value]: true,
		[Enum.KeyCode.Space.Value]: true,
	},

	[Enum.UserInputType.Gamepad1.Value]: {
		[Enum.KeyCode.Thumbstick1.Value]: true,
	},
};

let existingPather: Pather | undefined = undefined;
let autoDiggingEnabled: boolean = false;
let isPathing: boolean = false;

let consecutiveFails: number = 0;

let targetRequestInProgress = false;
let targetSpawnTime = 0;
let trackedSpawnPosition = new Vector3();

const mapSpawns = CollectionService.GetTagged(gameConstants.SPAWN_TAG).filter((instance) => instance.IsA("PVInstance"));

let queueActive = false;

const enableDebugWarnings = true;

const logWarn = (message: string) => {
	if (enableDebugWarnings) {
		debugWarn(message, "AutoDigging");
	}
};

@Controller({})
export class AutoDigging implements OnStart {
	constructor(private readonly shovelController: ShovelController, private readonly detector: DetectorController) {}

	onStart(): void {
		CollectionService.GetInstanceAddedSignal(gameConstants.SPAWN_TAG).Connect((instance) => {
			if (instance.IsA("PVInstance")) {
				mapSpawns.push(instance);
			}
		});

		Events.targetSpawnSuccess.connect(() => {
			targetSpawnTime = tick();
			if (treasureCountAtom() >= inventorySizeAtom()) {
				Signals.inventoryFull.Fire();
				this.setAutoDiggingEnabled(false);
				return;
			}
		});

		// Events.targetSpawnFailure.connect(() => {
		// 	if (treasureCountAtom() >= inventorySizeAtom()) {
		// 		Signals.inventoryFull.Fire();
		// 		this.setAutoDiggingEnabled(false);
		// 		return;
		// 	}
		// 	if (autoDiggingEnabled) {
		// 		this.cleanupPather();
		// 		this.requestAndPathToNextTarget();
		// 	}
		// });

		this.shovelController.onDiggingComplete.Connect(() => {
			this.cleanupPather();
			if (autoDiggingEnabled) {
				this.requestAndPathToNextTarget();
			}
		});

		Signals.setAutoDiggingRunning.Connect((running: boolean) => {
			isPathing = running;

			// Cleanup pather
			if (!running) {
				this.cleanupPather();
			}
		});

		Signals.forceSetAutoDigging.Connect((enabled: boolean) => {
			this.setAutoDiggingEnabled(enabled);
		});

		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			this.onInputBegan(input, gameProcessedEvent);
		});

		// Start a periodic check to see if we might be stuck
		this.beginStuckCheck();
	}

	/**
	 * In cases of high latency, we can have an active target, not be pathing, and still be right next to it.
	 * This is because we are still waiting for a response from the server to tell us that we are close enough to dig.
	 * In this case, we should keep track of this and not quit our current target if we are close with an active target.
	 */
	private isClosedToTrackedTarget(): boolean {
		const characterPosition = Players.LocalPlayer.Character?.GetPivot().Position;
		if (!characterPosition) return false;
		return characterPosition.sub(trackedSpawnPosition).Magnitude < gameConstants.DIG_RANGE * 1.1;
	}

	/**
	 * Periodic check: If auto-digging is enabled, we have a target,
	 * but we aren't pathing or digging, it could mean we're stuck.
	 */
	private beginStuckCheck() {
		const WAIT_INTERVAL = 2; // seconds

		// let lastTrackedPosition = Players.LocalPlayer.Character?.GetPivot().Position;

		task.spawn(() => {
			while (true) {
				task.wait(WAIT_INTERVAL);

				if (
					autoDiggingEnabled &&
					// this.detector.targetActive && // We have a target
					!isPathing && // But we're not pathfinding
					!this.shovelController.diggingActive && // And not digging
					tick() - targetSpawnTime > WAIT_INTERVAL * 2 && // And it's been a while since the last target spawned
					tick() - this.shovelController.lastDiggingTime > WAIT_INTERVAL * 2 // And it's been a while since we last dug
				) {
					if (this.isClosedToTrackedTarget()) continue;

					// If no target is active, request a new one
					if (!this.detector.targetActive) {
						logWarn("[Stuck Check]: No active target detected, attempting to get a new one.");
						this.requestAndPathToNextTarget();
						continue;
					}

					logWarn(
						"[Stuck check]: Auto-digging enabled and target found, but not pathing or digging. Could be stuck. Trying reset.",
					);

					consecutiveFails++;
					this.tryResetIfStuck();

					if (autoDiggingEnabled) {
						targetRequestInProgress = false;
						this.requestAndPathToNextTarget();
					}
				}
			}
		});
	}

	/// Cancels pathing if the player attempts to move while pathing
	private onInputBegan(input: InputObject, gameProcessedEvent: boolean) {
		if (gameProcessedEvent) return;

		const userInputType = input.UserInputType;
		const movementEntry = MOVEMENT_INPUTS[userInputType.Value];

		let cancelPath = false;

		if (movementEntry !== undefined) {
			if (typeIs(movementEntry, "table")) {
				if (movementEntry[input.KeyCode.Value]) {
					cancelPath = true;
				}
			}
		}

		if (isPathing && cancelPath) {
			if (this.isClosedToTrackedTarget()) return;
			this.cleanupPather();
			this.setAutoDiggingEnabled(false, false);
		}
	}

	public resetToSpawn() {
		const character = Players.LocalPlayer.Character;
		if (!character || !character.Parent || !character.PrimaryPart) return;

		const closestSpawn = mapSpawns.reduce((closest, current) => {
			const currentDistance = current.GetPivot().Position.sub(character.GetPivot().Position).Magnitude;
			const closestDistance = closest.GetPivot().Position.sub(character.GetPivot().Position).Magnitude;
			return currentDistance < closestDistance ? current : closest;
		});

		character.PivotTo(new CFrame(closestSpawn.GetPivot().Position.add(new Vector3(0, 5, 0))));
		logWarn(
			`Resetting to spawn, likely due to getting stuck too many times in a row during automatic pathfinding.`,
		);
	}

	private cleanupPather() {
		if (existingPather) {
			existingPather.Destroy();
			existingPather = undefined;
		}
		isPathing = false;
	}

	private startPathTo(goal: Vector3) {
		this.cleanupPather();

		// Signal to cancel any existing pathers that we missed. This is mainly a fallback incase an existing pather was overwritten before we could destroy it:
		Signals.requestingNewPather.Fire();

		const pather = new Pather(goal);
		existingPather = pather;

		pather.Finished.Connect(() => {
			this.cleanupPather();

			const CHECK_DELAY = 1;
			// Check if the player is digging after a second, if not, it's still safe to assume that pathfinding has failed.
			task.delay(CHECK_DELAY, () => {
				// Also check lastDiggingTime incase they finished digging before the delay
				const lastDiggingTime = this.shovelController.lastDiggingTime;
				if (this.isClosedToTrackedTarget()) return;
				if (!isPathing && !this.shovelController.diggingActive && tick() - lastDiggingTime > 2) {
					consecutiveFails++;
					this.quitCurrentTarget();
					this.requestAndPathToNextTarget();
					logWarn("Pathfinding failed (close but didn't dig)");
				} else {
					// We can confidently say pathfinding was successful and we dug or are digging
					consecutiveFails = 0;
				}
			});
		});

		pather.PathFailed.Connect(() => {
			this.cleanupPather();

			const CHECK_DELAY = 1;
			// Check if the player is digging after a second, if not, it's still safe to assume that pathfinding has failed.
			task.delay(CHECK_DELAY, () => {
				// Also check lastDiggingTime incase they finished digging before the delay
				const lastDiggingTime = this.shovelController.lastDiggingTime;
				if (this.isClosedToTrackedTarget()) return;
				if (!isPathing && !this.shovelController.diggingActive && tick() - lastDiggingTime > 2) {
					consecutiveFails++;
					this.quitCurrentTarget();
					this.requestAndPathToNextTarget();
					logWarn(
						"Pathfinding failed (potentially stuck or pathfinding error, possibly due to being blocked unexpectedly)",
					);
				}
			});
		});

		const started = pather.start();
		if (!started) {
			consecutiveFails++;
			this.cleanupPather();
			this.quitCurrentTarget();
			this.requestAndPathToNextTarget();
			return;
		}
		isPathing = true;
	}

	/**
	 * We only spawn one background “queue” task at a time.
	 * If we're already queued (queueActive == true), we do nothing.
	 */
	private retryResetTargetRequest() {
		// If we're not auto-digging or there's already a queue worker, skip.
		if (!autoDiggingEnabled || queueActive) {
			return;
		}

		queueActive = true;

		task.spawn(() => {
			// Wait until we are free (not pathing/digging/etc.)
			while (
				autoDiggingEnabled &&
				queueActive &&
				(isPathing || this.shovelController.diggingActive || this.detector.targetActive)
			) {
				// Continuously try resetting state until we're free
				this.quitCurrentTarget();

				// Reset state for the next target
				this.cleanupPather();

				consecutiveFails++;
				this.tryResetIfStuck();

				task.wait(0.1);
			}

			const wasActive = queueActive;
			// Release the queue so future calls can queue again
			queueActive = false;
			// If we're still enabled, request the next target
			if (autoDiggingEnabled && wasActive) {
				targetRequestInProgress = false;
				this.requestAndPathToNextTarget();
			}
		});
	}

	requestAndPathToNextTarget() {
		if (!autoDiggingEnabled || targetRequestInProgress) return;

		if (treasureCountAtom() >= inventorySizeAtom()) {
			Signals.inventoryFull.Fire();
			this.setAutoDiggingEnabled(false);
			this.quitCurrentTarget();
			return;
		}

		this.cleanupPather();

		targetRequestInProgress = true;
		Functions.requestNextTarget()
			.then((target) => {
				const character = Players.LocalPlayer.Character;
				const humanoid = character?.FindFirstChildOfClass("Humanoid");
				if (!character || !humanoid) return;
				if (!autoDiggingEnabled) return;
				if (!target) {
					logWarn("Target request failed. Retrying...");
					task.delay(0.1, () => this.requestAndPathToNextTarget()); // Retry after delay
					return;
				}
				this.tryResetIfStuck();

				trackedSpawnPosition = target.position;

				if (!this.detector.detectorActive) {
					humanoid.UnequipTools();
					for (const tool of Players.LocalPlayer.WaitForChild("Backpack").GetChildren()) {
						if (tool.IsA("Tool") && metalDetectorConfig[tool.Name]) {
							humanoid.EquipTool(tool);
							break;
						}
					}
				}

				this.startPathTo(target.position);
			})
			.catch((err) => {
				if (!autoDiggingEnabled) return;
				logWarn(`Failed to get next target: ${err}`);
				this.retryResetTargetRequest(); // Maybe retry or do fallback
			})
			.finally(() => {
				targetRequestInProgress = false;
			});
	}

	private tryResetIfStuck() {
		if (consecutiveFails >= gameConstants.AUTO_DIG_FAILURE_THRESHOLD) {
			consecutiveFails = 0;
			this.resetToSpawn();
			this.setAutoDiggingEnabled(false);
			this.setAutoDiggingEnabled(true);
		}
	}

	private quitCurrentTarget() {
		if (
			autoDiggingEnabled &&
			(this.shovelController.diggingActive || (this.detector.targetActive && !this.isClosedToTrackedTarget()))
		) {
			Events.endDiggingClient();
		}
	}

	public setAutoDiggingEnabled(enabled: boolean, quitTarget: boolean = true) {
		autoDiggingEnabled = enabled;

		if (enabled) {
			if (treasureCountAtom() >= inventorySizeAtom()) {
				this.setAutoDiggingEnabled(false);
				return;
			}

			this.cleanupPather();
			this.requestAndPathToNextTarget();
		} else {
			if (quitTarget) {
				this.quitCurrentTarget();
			}
			this.cleanupPather();
			Signals.setAutoDiggingRunning.Fire(false);
		}

		Signals.setAutoDiggingEnabled.Fire(enabled);
		logWarn(`Auto-digging is now ${enabled ? "enabled" : "disabled"}`);
	}
}
