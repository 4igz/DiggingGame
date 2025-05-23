//!optimize 2
import { Controller, OnStart, OnTick } from "@flamework/core";
import {
	CollectionService,
	ContextActionService,
	Players,
	ReplicatedStorage,
	RunService,
	SoundService,
	Workspace,
} from "@rbxts/services";
import { Events } from "client/network";
import { BASE_DETECTOR_STRENGTH, MetalDetector, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { Trove } from "@rbxts/trove";
import { Signals } from "shared/signals";
import { ShovelController } from "./shovelController";
import { interval } from "shared/util/interval";
import { gameConstants } from "shared/gameConstants";
import { ObjectPool } from "shared/util/objectPool";
import { allowDigging } from "client/atoms/detectorAtoms";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { TutorialController } from "./tutorialController";
import { DETECT_STEP, DIG_STEP, QUEST_STEP, SELL_STEP, TREASURE_STEP } from "shared/config/tutorialConfig";
import { getTopmostPartAtPosition } from "shared/util/castingUtil";

const DING_SOUND_INTERVAL = interval(1);
const RENDER_STEP_ID = "WaypointArrow";

let VFX_FOLDER = ReplicatedStorage.WaitForChild("Assets").WaitForChild("VFX");
let beepSound = SoundService.WaitForChild("Tools").WaitForChild("DetectorBeep") as Sound;
let dingSound = SoundService.WaitForChild("UI")?.WaitForChild("DigDing") as Sound;
let ANIMATION_FOLDER = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");
let metalDetectorAnimation = ANIMATION_FOLDER.FindFirstChild("MetalDetector") as Animation;
let phase = 0;
let currentBeepSound: Sound | undefined = undefined;
let areaIndicator: BasePart | undefined;
let arrowIndicator: Part | undefined;
const arrowPool = new ObjectPool(() => {
	const arrow = VFX_FOLDER.WaitForChild("IndicatorPart") as Part;
	return arrow.Clone();
}, 1);
const areaIndicatorPool = new ObjectPool(() => {
	return VFX_FOLDER.WaitForChild("DigAreaIndicatorVfx")?.Clone() as BasePart;
}, 1);

interface PlayerModule {
	GetControls(this: PlayerModule): Controls;
}

interface Controls {
	GetMoveVector(this: Controls): Vector3;
	Disable(): void;
	Enable(): void;
}

let playerModule: PlayerModule | undefined = undefined;
let controls: Controls | undefined = undefined;

@Controller({})
export class DetectorController implements OnStart {
	public targetActive = false;
	public detectorActive = false;

	constructor(
		private readonly shovelController: ShovelController,
		private readonly tutorialController: TutorialController,
	) {}

	onStart() {
		let autoDigRunning = false;
		let isAutoDigging = false;
		let isRolling = false;
		let isInventoryFull = false;
		let awaitingResponse = false;

		let holding = false;
		let holdStart = 0;

		let understandsInput = false;

		let activeCross: BasePart | undefined = undefined;

		const HOLD_LENGTH = 0.25;
		const DETECTION_KEYBINDS = [Enum.KeyCode.ButtonR2, Enum.UserInputType.MouseButton1];

		// Wait for onStart so we arent holding up other systems while we wait for the PlayerModule to load.
		playerModule = require(Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild(
			"PlayerModule",
		) as ModuleScript) as PlayerModule;
		controls = playerModule.GetControls();

		Signals.setAutoDiggingRunning.Connect((running: boolean) => {
			autoDigRunning = running;
		});

		const beepSoundPool = new ObjectPool(() => {
			return beepSound.Clone();
		});

		const setupCharacter = (character: Model) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;

			const animator = humanoid.WaitForChild("Animator") as Animator;
			const detectorAnimation = metalDetectorAnimation.Clone();
			const detectorTrack = animator.LoadAnimation(detectorAnimation);

			// Cleanup the animation track if the character is removed or the player dies
			const cleanupTrack = () => {
				if (detectorTrack) {
					detectorTrack.Stop();
				}
			};

			const setupDetector = (child: Tool, cfg: MetalDetector) => {
				// We use this to check if the player has just finished digging, to determine if the equip should have a cooldown
				// before working since they are possibly still spam clicking the shovel as the detector is being equipped.
				let beep = child.FindFirstChild(beepSound.Name) as Sound | undefined;
				if (!beep) {
					beep = beepSoundPool.acquire();
					beep.Parent = child.FindFirstChildWhichIsA("BasePart") as BasePart;
				}

				Signals.detectorEquipUpdate.Fire(true);
				currentBeepSound = beep as Sound;

				if (this.tutorialController.tutorialActive && this.tutorialController.currentStage === 0) {
					Signals.setTutorialStep.Fire(DETECT_STEP);
				}
				const trove = new Trove();
				holdStart = tick();
				holding = false;
				this.detectorActive = true;

				trove.add(cleanupTrack);

				trove.add(
					RunService.RenderStepped.Connect(() => {
						if (holding && tick() - holdStart > HOLD_LENGTH) {
							if (!isRolling) {
								Signals.setLuckbarVisible.Fire(true);
								isRolling = true;
								Events.beginDetectorLuckRoll();
							}
						}
					}),
					"Disconnect",
				);

				// Cleanup indicators when unequipping
				trove.add(
					child.Unequipped.Once(() => {
						trove.destroy();
					}),
				);

				trove.add(
					character.ChildRemoved.Connect((child2) => {
						if (child2 === child) {
							trove.destroy();
						}
					}),
				);

				// Play the animation when the tool is equipped
				detectorTrack.Play();

				// Ensure animation is playing after 1 second
				task.delay(1, () => {
					if (!detectorTrack.IsPlaying && child.Parent === character) {
						detectorTrack.Play();
					}
				});

				const actionName = "DetectorAction";

				const detectorAction = (
					_actionName: string,
					inputState: Enum.UserInputState,
					_inputObject: InputObject,
				) => {
					if (inputState === Enum.UserInputState.Begin) {
						const button = ContextActionService.GetButton(actionName);
						if (button) {
							button.Image = "rbxassetid://5713982324";
						}
						if (
							this.tutorialController.currentStage === SELL_STEP ||
							this.tutorialController.currentStage === QUEST_STEP ||
							holding || // Not currently holding down the detector button
							awaitingResponse || // And not currently waiting for a target to spawn
							this.targetActive || // And a target is not already active
							isRolling || // And not currently already rolling for a target
							(isAutoDigging && autoDigRunning) // And we aren't autodigging
						)
							return;
						if (isInventoryFull) {
							Signals.inventoryFull.Fire();
							return;
						}
						holding = true;
						holdStart = tick();
					} else if (inputState === Enum.UserInputState.End) {
						const button = ContextActionService.GetButton(actionName);
						if (button) {
							button.Image = "rbxassetid://5713982324";
						}
						if (
							!holding ||
							(isAutoDigging && autoDigRunning) ||
							this.tutorialController.currentStage === SELL_STEP ||
							this.tutorialController.currentStage === QUEST_STEP
						)
							return;
						holding = false;
						if (isRolling) {
							awaitingResponse = true;
							isRolling = false;
							Signals.setLuckbarVisible.Fire(false);

							Events.endDetectorLuckRoll();

							if (!understandsInput) {
								Signals.setUiToggled.Fire(gameConstants.DETECTOR_HINT_TEXT, false, true);
								understandsInput = true;
							}
							if (this.tutorialController.tutorialActive) {
								Signals.tutorialStepCompleted.Fire(DETECT_STEP);
							}
						}
					}
				};

				if (!understandsInput && !autoDigRunning && !isRolling) {
					// Player hasn't shown yet that they understand how the detector works
					Signals.setUiToggled.Fire(gameConstants.DETECTOR_HINT_TEXT, true, true);
				}

				ContextActionService.BindAction(actionName, detectorAction, true, ...DETECTION_KEYBINDS);

				task.defer(() => {
					ContextActionService.SetImage(actionName, cfg.itemImage);
					ContextActionService.SetPosition(actionName, UDim2.fromScale(0.12, 0.325));
					pcall(() => {
						const button = ContextActionService.GetButton(actionName);
						if (button) {
							button.Size = new UDim2(0, 90, 0, 90);
							button.Image = "rbxassetid://5713982324";
							button.HoverImage = "rbxassetid://5713982324";
							button.PressedImage = "rbxassetid://5713982324";
							button.ImageTransparency = 0.6;

							const btnImage = button.WaitForChild("ActionIcon") as ImageLabel;
							btnImage.AnchorPoint = new Vector2(0.5, 0.5);
							btnImage.Size = UDim2.fromScale(0.75, 0.75);
							btnImage.Position = UDim2.fromScale(0.5, 0.5);
						}
					});
				});

				trove.add(() => {
					this.detectorActive = false;
					holding = false;

					if (
						this.tutorialController.tutorialActive &&
						this.tutorialController.currentStage < TREASURE_STEP
					) {
						Signals.setTutorialStep.Fire(0);
					}

					Signals.detectorEquipUpdate.Fire(false);

					if (isRolling) {
						isRolling = false;
						awaitingResponse = true;
						Events.endDetectorLuckRoll(true);
						Signals.setLuckbarVisible.Fire(false);
					}

					if (beep) {
						beepSoundPool.release(beep);
						beep = undefined;
					}

					Signals.setUiToggled.Fire(gameConstants.DETECTOR_HINT_TEXT, false, true);

					task.defer(() => {
						if (!this.shovelController.diggingActive && isAutoDigging) {
							Signals.forceSetAutoDigging.Fire(false);
						}
					});
				});

				trove.add(() => {
					pcall(() => {
						ContextActionService.UnbindAction(actionName);
					});
				});
			};

			character.AncestryChanged.Connect(() => {
				if (!character.IsDescendantOf(game)) {
					cleanupTrack();
					detectorTrack?.Destroy();
				}
			});

			humanoid.Died.Connect(() => {
				cleanupTrack();
				detectorTrack?.Destroy();
			});

			const existingTool = character.FindFirstChildWhichIsA("Tool");
			if (existingTool) {
				const cfg = metalDetectorConfig[existingTool.Name];
				if (existingTool.IsA("Tool") && cfg !== undefined) {
					setupDetector(existingTool, cfg);
				}
			}

			// Detect tools being equipped
			character.ChildAdded.Connect((child) => {
				const cfg = metalDetectorConfig[child.Name];
				if (child.IsA("Tool") && cfg !== undefined) {
					setupDetector(child, cfg);
				}
			});
		};

		// Detect walking and play animation
		Players.LocalPlayer.CharacterAdded.Connect(setupCharacter);

		const character = Players.LocalPlayer.Character;
		if (character) {
			setupCharacter(character);
		}

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			isAutoDigging = enabled;
			understandsInput = true;
		});

		Signals.waypointArrow.Connect((pos) => {
			this.showWaypointArrow(pos, 2, false);
		});

		Signals.hideWaypointArrow.Connect(() => {
			this.hideWaypointArrow();
		});

		Events.targetSpawnSuccess.connect(() => {
			this.targetActive = true;
			awaitingResponse = false;
		});

		Events.targetSpawnFailure.connect(() => {
			awaitingResponse = false;
			this.targetActive = false;
		});

		Events.targetDespawned.connect(() => {
			awaitingResponse = false;
			this.targetActive = false;
			this.hideWaypointArrow();
			if (activeCross !== undefined) {
				(activeCross as BasePart).Parent = undefined;
			}
			if (areaIndicator) {
				areaIndicatorPool.release(areaIndicator);
				areaIndicator = undefined;
			}
		});

		Events.endDiggingServer.connect(() => {
			this.hideWaypointArrow();
			if (activeCross !== undefined) {
				(activeCross as BasePart).Parent = undefined;
			}
			if (areaIndicator) {
				areaIndicatorPool.release(areaIndicator);
				areaIndicator = undefined;
			}
		});

		Events.beginDigging.connect(() => {
			this.hideWaypointArrow();
			if (activeCross !== undefined) {
				(activeCross as BasePart).Parent = undefined;
			}
		});

		Events.createWaypointVisualization.connect((position: Vector3, detectorName: string) => {
			// First create a path to the target position and line it with indicators.
			const detectorCfg = metalDetectorConfig[detectorName];
			if (!detectorCfg) {
				warn(`Detector config not found for ${detectorName}`);
				return;
			}

			// Start tweening the waypoint indicator
			this.showWaypointArrow(position, detectorCfg.searchRadius);

			const cross = activeCross ?? (VFX_FOLDER.FindFirstChild("Cross") as BasePart);
			cross.Parent = Workspace;
			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.FilterDescendantsInstances = [
				...(Players.GetPlayers().map((p) => {
					return p.Character;
				}) as Model[]),
				...CollectionService.GetTagged("Treasure"),
				...CollectionService.GetTagged("DigCrater"),
			];
			// const raycast = Workspace.Raycast(origin, new Vector3(0, -5, 0), params);
			const [_, hit] = getTopmostPartAtPosition(position, params, 2, 5);
			cross.Position = hit ?? position;
			activeCross = cross;
		});
	}

	private onCanDig(canDig: boolean) {
		if (this.shovelController.diggingActive) {
			canDig = false; // We're already digging, sink this request and undo any previous changes
		}
		if (controls) {
			if (canDig) {
				controls.Disable();

				if (DING_SOUND_INTERVAL()) {
					SoundService.PlayLocalSound(dingSound);
				}
			} else {
				controls.Enable();
			}
		}
	}

	private getLocalPlayerRootPart(): BasePart | undefined {
		const player = Players.LocalPlayer;
		const character = player.Character ?? player.CharacterAdded.Wait()[0];
		if (!character) return undefined;
		const root = character.WaitForChild("HumanoidRootPart", 2);
		if (!root || !root.IsA("BasePart")) return undefined;
		return root;
	}

	public showWaypointArrow(targetPos: Vector3, detectorSearchRadius: number, doEffects: boolean = true) {
		// If we haven't cloned our arrow yet, do so
		if (!arrowIndicator) {
			// This should be your old arrow part with a BillboardGui inside
			arrowIndicator = arrowPool.acquire();
			arrowIndicator.Parent = Workspace;

			const platform = getPlayerPlatform();
			const MOBILE_SCALE = 0.75; // Scale down arrow on mobile

			const billboardGui = arrowIndicator.WaitForChild("BillboardGui") as BillboardGui;
			const dot = billboardGui.WaitForChild("Arrow") as ImageLabel;
			const exclamationMarkBlur = billboardGui.WaitForChild("ExclamationMarkBlur") as Frame;
			const exclamationMark = exclamationMarkBlur.WaitForChild("ExclamationMark") as ImageLabel;
			const shovel = exclamationMarkBlur.WaitForChild("Shovel") as ImageLabel;

			if (platform === "Mobile") {
				if (dot.GetAttribute("ScaledMobile") !== true) {
					dot.SetAttribute("ScaledMobile", true);
					dot.Size = new UDim2(
						dot.Size.X.Scale * MOBILE_SCALE,
						dot.Size.X.Offset * MOBILE_SCALE,
						dot.Size.Y.Scale * MOBILE_SCALE,
						dot.Size.Y.Offset * MOBILE_SCALE,
					);
					exclamationMark.Size = new UDim2(
						exclamationMark.Size.X.Scale * MOBILE_SCALE,
						exclamationMark.Size.X.Offset * MOBILE_SCALE,
						exclamationMark.Size.Y.Scale * MOBILE_SCALE,
						exclamationMark.Size.Y.Offset * MOBILE_SCALE,
					);
					exclamationMarkBlur.Size = new UDim2(
						exclamationMarkBlur.Size.X.Scale * MOBILE_SCALE,
						exclamationMarkBlur.Size.X.Offset * MOBILE_SCALE,
						exclamationMarkBlur.Size.Y.Scale * MOBILE_SCALE,
						exclamationMarkBlur.Size.Y.Offset * MOBILE_SCALE,
					);
					shovel.Size = new UDim2(
						shovel.Size.X.Scale * MOBILE_SCALE,
						shovel.Size.X.Offset * MOBILE_SCALE,
						shovel.Size.Y.Scale * MOBILE_SCALE,
						shovel.Size.Y.Offset * MOBILE_SCALE,
					);
				}
			}
		}

		// Make sure we unbind any old render-step so we don't stack multiple
		RunService.UnbindFromRenderStep(RENDER_STEP_ID);

		let prevSinVal = 0;
		let lastTimestamp = time();

		// Grab the BillboardGui (or sub-GUIs) from the arrow
		const billboardGui = arrowIndicator.WaitForChild("BillboardGui") as BillboardGui;
		const dot = billboardGui.WaitForChild("Arrow") as ImageLabel;
		const exclamationMarkBlur = billboardGui.WaitForChild("ExclamationMarkBlur") as Frame;
		const exclamationMark = exclamationMarkBlur.WaitForChild("ExclamationMark") as ImageLabel;
		const shovel = exclamationMarkBlur.WaitForChild("Shovel") as ImageLabel;

		// First create a path to the target position and line it with indicators.
		const player = Players.LocalPlayer;
		const character = player.Character;
		if (!character || !character.Parent) return;

		// Setup the arrow to update every frame
		RunService.BindToRenderStep(RENDER_STEP_ID, Enum.RenderPriority.Last.Value, () => {
			const camera = Workspace.CurrentCamera ?? undefined;
			if (!camera || !arrowIndicator || !arrowIndicator.Parent) {
				RunService.UnbindFromRenderStep(RENDER_STEP_ID);
				return;
			}
			let detector = character.FindFirstChildOfClass("Tool");
			detector = detector && metalDetectorConfig[detector.Name] ? detector : undefined;

			const playerRootPart = this.getLocalPlayerRootPart();
			if (!playerRootPart) {
				warn("No player root part found, cannot show arrow");
				return;
			}

			// Current distance from player to the waypoint
			const offset = targetPos.sub(playerRootPart.Position);
			const distance = offset.Magnitude;

			// Place the arrow about 5 studs in front of the player, in direction of the waypoint
			if (distance > 0) {
				const arrowPos = playerRootPart.Position.add(offset.Unit.mul(5));
				arrowIndicator.CFrame = new CFrame(arrowPos);
			} else {
				// If somehow the waypoint is exactly at the player, just match positions
				arrowIndicator.CFrame = new CFrame(playerRootPart.Position);
			}

			const isNearby = distance < detectorSearchRadius;

			// Randomize the area indicator position, but use a set seed so each target has the same area
			if (isNearby && !areaIndicator && doEffects) {
				const rng = new Random(targetPos.X + targetPos.Y + targetPos.Z);
				const randomAngle = rng.NextNumber() * 2 * math.pi;
				const randomRadius = math.sqrt(rng.NextNumber()) * (detectorSearchRadius / 4); // Reduced radius to center the target
				const offsetX = math.cos(randomAngle) * randomRadius;
				const offsetZ = math.sin(randomAngle) * randomRadius;
				const offsetPosition = new Vector3(offsetX, 0, offsetZ);
				const finalPosition = targetPos.add(offsetPosition).add(new Vector3(0, 1, 0));

				const currentAreaIndicator = areaIndicatorPool.acquire();
				currentAreaIndicator.Size = new Vector3(detectorSearchRadius, 0.001, detectorSearchRadius);
				currentAreaIndicator.SetAttribute(gameConstants.AREA_INDICATOR_POS, finalPosition);
				currentAreaIndicator.Position = finalPosition;
				currentAreaIndicator.Parent = Workspace;
				areaIndicator = currentAreaIndicator;
			}

			// Rotate the arrow to match the angle from camera to waypoint
			const MAX_DIST = BASE_DETECTOR_STRENGTH;
			const MIN_DIST = gameConstants.MIN_DIG_REQ_DIST;
			let canDig = false;
			let isReallyClose = false;
			if (distance > MIN_DIST) {
				// Calculate angle for the arrow icon
				const lookVector = camera.CFrame.LookVector;
				const cameraAngle = math.deg(math.atan2(lookVector.X, lookVector.Z));
				const offsetAngle = math.deg(math.atan2(offset.Unit.X, offset.Unit.Z));
				const angle = -((offsetAngle - cameraAngle) % 360);

				dot.Rotation = angle;

				// Lerp color from green (far) to red (closer)
				const t = (MAX_DIST - distance) / (MAX_DIST - MIN_DIST);
				const alpha = doEffects ? math.clamp(t, 0, 1) : 0;
				dot.ImageColor3 = Color3.fromRGB(0, 255, 0).Lerp(Color3.fromRGB(255, 0, 0), alpha);

				dot.Visible = true;
				exclamationMarkBlur.Visible = false;
			} else if (distance <= MIN_DIST && distance > gameConstants.DIG_RANGE * 0.95 && doEffects) {
				// Show exclamation mark
				dot.Visible = false;
				exclamationMarkBlur.Visible = true;
				exclamationMark.Visible = true;
				shovel.Visible = false;
				isReallyClose = true;
			} else {
				if (doEffects) {
					// Very close
					dot.Visible = false;
					exclamationMarkBlur.Visible = true;
					exclamationMark.Visible = false;
					shovel.Visible = true;

					// Snap arrow onto the exact waypoint position
					arrowIndicator.CFrame = new CFrame(targetPos);
					canDig = true;
				}
			}

			const now = time();
			const deltaTime = now - lastTimestamp;
			lastTimestamp = now;

			const MIN_BLINK_SPEED = 3;
			const MAX_BLINK_SPEED = isReallyClose ? 28 : 15;

			const clampedDist = math.clamp(distance, MIN_DIST, MAX_DIST);
			const alpha = 1 - (clampedDist - MIN_DIST) / (MAX_DIST - MIN_DIST);
			const blinkSpeed = MIN_BLINK_SPEED + alpha * (MAX_BLINK_SPEED - MIN_BLINK_SPEED);

			// 1) Accumulate 'phase' by blinkSpeed * deltaTime
			//    This ensures we smoothly continue the wave from last frame.
			phase += blinkSpeed * deltaTime;

			// 2) Evaluate the sine
			const sinVal = math.sin(phase);

			// 3) Modify sine to transparency
			// Increase the base transparency and reduce the amplitude
			const baseTransparency = 0.2; // Lower base transparency for more visibility
			const amplitude = 0.1; // Reduce amplitude to minimize the range of transparency
			const transparency = sinVal * amplitude + baseTransparency;

			// Clamp transparency to ensure it doesn't go out of bounds
			const clampedTransparency = math.clamp(transparency, 0, 1);
			dot.ImageTransparency = doEffects ? clampedTransparency : 0;
			exclamationMark.ImageTransparency = clampedTransparency;

			exclamationMark.Rotation = sinVal * 10;
			shovel.Rotation = sinVal * 10;

			if (doEffects) {
				this.onCanDig(canDig);
				allowDigging(isReallyClose);
			}

			// 4) Check zero-crossing (- => +) for beep & blink
			if (sinVal <= 0 && prevSinVal > 0 && !canDig && doEffects) {
				if (currentBeepSound) currentBeepSound.Play();

				const blinkVfx = detector?.FindFirstChild("Blink") as Instance;
				if (blinkVfx) {
					for (const descendant of blinkVfx.GetDescendants()) {
						if (descendant.IsA("ParticleEmitter")) {
							descendant.Emit(1);
						}
					}
				}
			}
			prevSinVal = sinVal;
		});
	}

	public hideWaypointArrow() {
		// Unbind our render-step
		RunService.UnbindFromRenderStep(RENDER_STEP_ID);
		this.onCanDig(false);
		allowDigging(false);

		// Destroy the arrow if needed
		if (arrowIndicator) {
			arrowPool.release(arrowIndicator);
			arrowIndicator = undefined;
		}
	}
}
