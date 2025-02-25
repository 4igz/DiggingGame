//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Players, UserInputService } from "@rbxts/services";
import { Events } from "client/network";
import { Pather } from "shared/util/pather";
import { ShovelController } from "./shovelController";
import { DetectorController } from "./detectorController";
import { Signals } from "shared/signals";
import { gameConstants } from "shared/constants";
import { inventorySizeAtom, treasureCountAtom } from "client/atoms/inventoryAtoms";

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

	// For Touch, we consider ANY touch an attempt to move
	// There aren't really any good ways to detect movement attempts on touch devices.
	// For the record, "Touch" indicates taps, not just any touch.
	[Enum.UserInputType.Touch.Value]: true,
};

let existingPather: Pather | undefined = undefined;
let autoDiggingEnabled: boolean = false;
let isPathing: boolean = false;

let consecutiveFails: number = 0;

const mapSpawns = CollectionService.GetTagged(gameConstants.SPAWN_TAG).filter((instance) => instance.IsA("PVInstance"));

/**
 * queueActive indicates whether we've already spawned a background
 * task to eventually call requestNextTarget().
 */
let queueActive = false;

@Controller({})
export class AutoDigging implements OnStart {
	constructor(private readonly shovelController: ShovelController, private readonly detector: DetectorController) {}

	onStart(): void {
		CollectionService.GetInstanceAddedSignal(gameConstants.SPAWN_TAG).Connect((instance) => {
			if (instance.IsA("PVInstance")) {
				mapSpawns.push(instance);
			}
		});
		Events.targetSpawnSuccess.connect((position: Vector3) => {
			if (treasureCountAtom() >= inventorySizeAtom()) {
				Signals.inventoryFull.Fire();
				this.setAutoDiggingEnabled(false);
				return;
			}
			if (autoDiggingEnabled) {
				if (isPathing) {
					existingPather?.Destroy();
					existingPather = undefined;
					isPathing = false;
					Promise.defer((resolve) => {
						if (this.shovelController.diggingActive || this.detector.targetActive) {
							Events.endDiggingClient();
							resolve(true);
						}
						resolve(false);
					}).then((targetActive) => {
						if (targetActive) {
							this.queueNextTargetRequest();
						}
						this.moveTo(position);
					});
				} else {
					this.moveTo(position);
				}
			}
		});

		this.shovelController.onDiggingComplete.Connect(() => {
			existingPather?.Destroy();
			existingPather = undefined;
			isPathing = false;
			if (autoDiggingEnabled) {
				this.quitCurrentTarget();
				this.queueNextTargetRequest();
			}
		});

		// Events.endDiggingServer.connect(() => {
		// 	if (this.isPathing) {
		// 		this.existingPather?.cleanup();
		// 		this.existingPather = undefined;
		// 		this.isPathing = false;
		// 	}
		// 	if (this.autoDiggingEnabled) {
		// 		this.queueNextTargetRequest();
		// 	}
		// });

		Signals.setAutoDiggingRunning.Connect((running: boolean) => {
			isPathing = running;

			// Cleanup pather
			if (!running && existingPather) {
				existingPather?.Destroy();
				existingPather = undefined;
			}
		});

		Signals.forceSetAutoDigging.Connect((enabled: boolean) => {
			this.setAutoDiggingEnabled(enabled);
		});

		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			this.onInputBegan(input, gameProcessedEvent);
		});
	}

	/// Cancels pathing if the player attempts to move while pathing
	private onInputBegan(input: InputObject, gameProcessedEvent: boolean) {
		if (gameProcessedEvent) return;

		const userInputType = input.UserInputType;
		const movementEntry = MOVEMENT_INPUTS[userInputType.Value];

		let cancelPath = false;

		if (movementEntry !== undefined) {
			if (userInputType === Enum.UserInputType.Touch && movementEntry === true) {
				cancelPath = true;
			} else if (typeIs(movementEntry, "table")) {
				if (movementEntry[input.KeyCode.Value]) {
					cancelPath = true;
				}
			}
		}

		if (isPathing && cancelPath) {
			existingPather?.Destroy();
			existingPather = undefined;
			isPathing = false;
			autoDiggingEnabled = false;
			Signals.setAutoDiggingEnabled.Fire(false);
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
		warn(`Resetting to spawn, likely due to getting stuck too many times in a row during automatic pathfinding.`);
	}

	public moveTo(pathTargetPosition: Vector3) {
		// Move to the given position
		const character = Players.LocalPlayer.Character;
		const humanoid = character?.FindFirstChildOfClass("Humanoid");
		if (!character || !humanoid) return;

		// If there's an existing pather, stop it and clean up
		if (existingPather) {
			existingPather?.Destroy();
			existingPather = undefined;
			isPathing = false;
		}

		const pather = new Pather(pathTargetPosition);

		let cleaned = false;

		const cleanup = () => {
			if (cleaned) return;
			cleaned = true;
			isPathing = false;
			pather?.Destroy();
			if (existingPather === pather) {
				existingPather = undefined;
			} else if (existingPather) {
				existingPather?.Destroy();
				existingPather = undefined;
			}
		};

		if (pather !== undefined) {
			existingPather = pather;

			isPathing = true;

			pather.Finished.Connect(() => {
				cleanup();

				const CHECK_DELAY = 1;
				// Check if the player is digging after a second, if not, it's still safe to assume that pathfinding has failed.
				task.delay(CHECK_DELAY, () => {
					// Also check lastDiggingTime incase they finished digging before the delay
					const lastDiggingTime = this.shovelController.lastDiggingTime;
					if (!isPathing && !this.shovelController.diggingActive && tick() - lastDiggingTime > 2) {
						consecutiveFails++;
						this.quitCurrentTarget();
						this.queueNextTargetRequest();
						warn("Pathfinding failed (close but didn't dig)");
					} else {
						// We can confidently say pathfinding was successful and we dug or are digging
						consecutiveFails = 0;
					}
				});
			});

			pather.PathFailed.Connect(() => {
				cleanup();

				const CHECK_DELAY = 1;
				// Check if the player is digging after a second, if not, it's still safe to assume that pathfinding has failed.
				task.delay(CHECK_DELAY, () => {
					// Also check lastDiggingTime incase they finished digging before the delay
					const lastDiggingTime = this.shovelController.lastDiggingTime;
					if (!isPathing && !this.shovelController.diggingActive && tick() - lastDiggingTime > 2) {
						consecutiveFails++;
						this.quitCurrentTarget();
						this.queueNextTargetRequest();
						warn("Pathfinding failed (potentially stuck)");
					}
				});
			});

			pather.start();
		} else {
			cleanup();
			this.queueNextTargetRequest();
		}
	}

	/**
	 * We only spawn one background “queue” task at a time.
	 * If we're already queued (queueActive == true), we do nothing.
	 */
	private queueNextTargetRequest() {
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
				task.wait(0.1); // I tried reducing this wait but it caused the same concurrency issues I was trying to prevent.
			}

			const wasActive = queueActive;
			// Release the queue so future calls can queue again
			queueActive = false;
			// If we're still enabled, request the next target
			if (autoDiggingEnabled && wasActive) {
				this.requestNextTarget();
			}
		});
	}

	private requestNextTarget() {
		if (consecutiveFails >= gameConstants.AUTO_DIG_FAILURE_THRESHOLD) {
			consecutiveFails = 0;
			this.resetToSpawn();
			this.setAutoDiggingEnabled(false);
			this.setAutoDiggingEnabled(true);
		}
		this.quitCurrentTarget();
		Signals.setAutoDiggingRunning.Fire(false);
		// Reset state for the next target
		existingPather?.Destroy();
		existingPather = undefined;
		isPathing = false;
		Events.nextTargetAutoDigger(); // Sends a request to the server to spawn a new target
	}

	private quitCurrentTarget() {
		if (this.shovelController.diggingActive || this.detector.targetActive) {
			Events.endDiggingClient();
		}
	}

	public setAutoDiggingEnabled(enabled: boolean = true) {
		if (enabled) {
			if (treasureCountAtom() >= inventorySizeAtom()) {
				Signals.inventoryFull.Fire();
				this.setAutoDiggingEnabled(false);
				return;
			}
		}
		this.quitCurrentTarget();
		if (!enabled) {
			Signals.setAutoDiggingRunning.Fire(false);
		}
		autoDiggingEnabled = enabled;
		Signals.setAutoDiggingEnabled.Fire(enabled);
	}
}
