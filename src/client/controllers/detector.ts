import { Controller, OnStart, OnTick } from "@flamework/core";
import { Players, ReplicatedStorage, RunService, SoundService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { BASE_DETECTOR_STRENGTH, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { Trove } from "@rbxts/trove";
import { Signals } from "shared/signals";
import { ShovelController } from "./shovelController";

@Controller({})
export class Detector implements OnStart, OnTick {
	private VFX_FOLDER = ReplicatedStorage.WaitForChild("VFX");
	private ANIMATION_FOLDER = ReplicatedStorage.WaitForChild("Animations");
	private areaIndicatorVFX = this.VFX_FOLDER.FindFirstChild("Area") as BasePart;
	private beepSound = SoundService.WaitForChild("DetectorBeep") as Sound;
	private areaIndicator: BasePart | undefined;
	private arrowIndicator?: BasePart; // Cloned from ReplicatedStorage
	private renderStepId = "WaypointArrow";
	private metalDetectorAnimation = this.ANIMATION_FOLDER.FindFirstChild("MetalDetector") as Animation;

	private autoDigRunning = false;
	private isAutoDigging = false;
	private targetActive = false;
	private isRolling = false;
	private phase = 0;
	private currentBeepSound: Sound | undefined = undefined;

	constructor(private readonly shovelController: ShovelController) {}

	onStart() {
		Signals.setAutoDiggingRunning.Connect((running: boolean) => {
			this.autoDigRunning = running;
		});

		// Detect walking and play animation
		Players.LocalPlayer.CharacterAdded.Connect((character) => {
			let detectorTrack: AnimationTrack | undefined;

			// Cleanup the animation track if the character is removed or the player dies
			const cleanupTrack = () => {
				if (detectorTrack) {
					detectorTrack.Stop();
					detectorTrack.Destroy();
					detectorTrack = undefined;
				}
			};
			character.AncestryChanged.Connect(() => {
				if (!character.IsDescendantOf(game)) {
					cleanupTrack();
				}
			});

			const humanoid = character.WaitForChild("Humanoid") as Humanoid;

			humanoid.Died.Connect(cleanupTrack);

			// Detect tools being equipped
			character.ChildAdded.Connect((child) => {
				if (child.IsA("Tool") && metalDetectorConfig[child.Name]) {
					if (!detectorTrack) {
						const animator = humanoid.WaitForChild("Animator") as Animator;
						const detectorAnimation = this.metalDetectorAnimation.Clone();
						detectorTrack = animator.LoadAnimation(detectorAnimation);
					}
					let existingBeepSound = child.FindFirstChild(this.beepSound.Name) as Sound | undefined;
					if (!existingBeepSound) {
						const clone = this.beepSound.Clone();
						clone.Parent = child.FindFirstChildWhichIsA("BasePart") ?? child;
						existingBeepSound = clone;
					}
					this.currentBeepSound = existingBeepSound as Sound;

					const trove = new Trove();

					// Play the animation when the tool is equipped
					detectorTrack.Play();

					// The delay is so that the player doesn't accidentally start detecting immediately after digging.
					const thread = task.delay(0.5, () => {
						trove.add(
							child.Activated.Connect(() => {
								if (this.targetActive || this.isRolling || (this.isAutoDigging && this.autoDigRunning))
									return;
								this.isRolling = true;
								Events.beginDetectorLuckRoll();
								Signals.startLuckbar.Fire();
							}),
						);

						trove.add(
							child.Deactivated.Connect(() => {
								if (!this.isRolling || (this.isAutoDigging && this.autoDigRunning)) return;
								this.isRolling = false;
								Events.endDetectorLuckRoll();
								Signals.pauseLuckbar.Fire();
								task.delay(1, () => {
									Signals.closeLuckbar.Fire();
								});
							}),
						);
					});

					// Cleanup indicators when unequipping
					child.AncestryChanged.Once(() => {
						if (this.areaIndicator) {
							this.areaIndicator.Destroy();
							this.areaIndicator = undefined;
						}
						this.hideWaypointArrow();

						if (this.isRolling) {
							this.isRolling = false;
							Events.endDetectorLuckRoll();
							Signals.closeLuckbar.Fire();
						}

						detectorTrack?.Stop();
						task.cancel(thread);
						trove.destroy();

						task.defer(() => {
							if (!this.shovelController.getDiggingActive() && this.isAutoDigging) {
								Signals.forceSetAutoDigging.Fire(false);
							}
						});
					});
				}
			});
		});

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			this.isAutoDigging = enabled;
		});

		Events.targetSpawnSuccess.connect(() => {
			this.targetActive = true;
		});

		Events.targetDespawned.connect(() => {
			this.targetActive = false;
		});

		Events.endDiggingServer.connect(() => {
			this.hideWaypointArrow();
			if (this.areaIndicator) {
				this.areaIndicator.Destroy();
				this.areaIndicator = undefined;
			}
		});

		Events.createWaypointVisualization.connect((position: Vector3, detectorName: string, isNearby: boolean) => {
			// First create a path to the target position and line it with indicators.
			const player = Players.LocalPlayer;
			const character = player.Character;
			if (!character) return;
			const startPosition = character.PrimaryPart?.Position;
			if (!startPosition) return;
			const detectorCfg = metalDetectorConfig[detectorName];
			if (!detectorCfg) {
				warn(`Detector config not found for ${detectorName}`);
				return;
			}

			// Randomize the area indicator position, but use a set seed so each target has the same area
			if (isNearby) {
				const rng = new Random(position.X + position.Y + position.Z);
				const randomAngle = rng.NextNumber() * 2 * math.pi;
				const randomRadius = math.sqrt(rng.NextNumber()) * (detectorCfg.searchRadius / 4); // Reduced radius to center the target
				const offsetX = math.cos(randomAngle) * randomRadius;
				const offsetZ = math.sin(randomAngle) * randomRadius;
				const offsetPosition = new Vector3(offsetX, 0, offsetZ);
				const finalPosition = position.add(offsetPosition).add(new Vector3(0, 1, 0));
				const areaIndicator = this.areaIndicator ?? this.areaIndicatorVFX.Clone();
				areaIndicator.Size = new Vector3(detectorCfg.searchRadius, 0.001, detectorCfg.searchRadius);
				areaIndicator.SetAttribute("OriginalPosition", finalPosition);
				areaIndicator.Position = finalPosition;
				areaIndicator.Parent = Workspace;
				this.areaIndicator = areaIndicator;
			}
			// Start tweening the waypoint indicator
			this.showWaypointArrow(position);
		});
	}

	public getTargetActive() {
		return this.targetActive;
	}

	private getLocalPlayerRootPart(): BasePart | undefined {
		const player = Players.LocalPlayer;
		const character = player.Character ?? player.CharacterAdded.Wait()[0];
		if (!character) return undefined;
		const root = character.WaitForChild("HumanoidRootPart");
		if (!root || !root.IsA("BasePart")) return undefined;
		return root;
	}

	public showWaypointArrow(targetPos: Vector3) {
		const playerRootPart = this.getLocalPlayerRootPart();
		if (!playerRootPart) {
			warn("No player root part found, cannot show arrow");
			return;
		}

		// If we haven't cloned our arrow yet, do so
		if (!this.arrowIndicator) {
			// This should be your old arrow part with a BillboardGui inside
			const arrowTemplate = this.VFX_FOLDER.WaitForChild("IndicatorPart") as Part;
			this.arrowIndicator = arrowTemplate.Clone();
			this.arrowIndicator.Parent = Workspace;
		}

		// Make sure we unbind any old render-step so we don't stack multiple
		RunService.UnbindFromRenderStep(this.renderStepId);

		let prevSinVal = 0;
		let lastTimestamp = time();

		// Grab the BillboardGui (or sub-GUIs) from the arrow
		const billboardGui = this.arrowIndicator.WaitForChild("BillboardGui") as BillboardGui;
		const dot = billboardGui.WaitForChild("Dot") as ImageLabel;
		const exclamationMarkBlur = billboardGui.WaitForChild("ExclamationMarkBlur") as Frame;
		const exclamationMark = exclamationMarkBlur.WaitForChild("ExclamationMark") as ImageLabel;
		const shovel = exclamationMarkBlur.WaitForChild("Shovel") as ImageLabel;
		// First create a path to the target position and line it with indicators.
		const player = Players.LocalPlayer;
		const character = player.Character;
		if (!character || !character.Parent) return;

		// Setup the arrow to update every frame
		RunService.BindToRenderStep(this.renderStepId, Enum.RenderPriority.Camera.Value + 1, () => {
			const camera = Workspace.CurrentCamera ?? undefined;
			if (!camera || !this.arrowIndicator) return;
			let detector = character.FindFirstChildOfClass("Tool");
			detector = detector && metalDetectorConfig[detector.Name] ? detector : undefined;
			if (!detector) return;

			// Current distance from player to the waypoint
			const offset = targetPos.sub(playerRootPart.Position);
			const distance = offset.Magnitude;

			// Place the arrow about 5 studs in front of the player, in direction of the waypoint
			if (distance > 0) {
				const arrowPos = playerRootPart.Position.add(offset.Unit.mul(5));
				this.arrowIndicator.CFrame = new CFrame(arrowPos);
			} else {
				// If somehow the waypoint is exactly at the player, just match positions
				this.arrowIndicator.CFrame = new CFrame(playerRootPart.Position);
			}

			// Rotate the arrow to match the angle from camera to waypoint
			const MAX_DIST = BASE_DETECTOR_STRENGTH;
			const MIN_DIST = 20;
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
				const alpha = math.clamp(t, 0, 1);
				dot.ImageColor3 = Color3.fromRGB(0, 255, 0).Lerp(Color3.fromRGB(255, 0, 0), alpha);

				dot.Visible = true;
				exclamationMarkBlur.Visible = false;
			} else if (distance <= MIN_DIST && distance > 8) {
				// Show exclamation mark
				dot.Visible = false;
				exclamationMarkBlur.Visible = true;
				exclamationMark.Visible = true;
				shovel.Visible = false;
				isReallyClose = true;
			} else {
				// Very close
				dot.Visible = false;
				exclamationMarkBlur.Visible = true;
				exclamationMark.Visible = false;
				shovel.Visible = true;

				// Snap arrow onto the exact waypoint position
				this.arrowIndicator.CFrame = new CFrame(targetPos);
				canDig = true;
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
			this.phase += blinkSpeed * deltaTime;

			// 2) Evaluate the sine
			const sinVal = math.sin(this.phase);

			// 3) Modify sine to transparency
			// Increase the base transparency and reduce the amplitude
			const baseTransparency = 0.2; // Lower base transparency for more visibility
			const amplitude = 0.1; // Reduce amplitude to minimize the range of transparency
			const transparency = sinVal * amplitude + baseTransparency;

			// Clamp transparency to ensure it doesn't go out of bounds
			const clampedTransparency = math.clamp(transparency, 0, 1);
			dot.ImageTransparency = clampedTransparency;
			exclamationMark.ImageTransparency = clampedTransparency;

			exclamationMark.Rotation = sinVal * 10;
			shovel.Rotation = sinVal * 10;

			// 4) Check zero-crossing (- => +) for beep & blink
			if (sinVal <= 0 && prevSinVal > 0 && !canDig) {
				if (this.currentBeepSound) this.currentBeepSound.Play();

				const blinkVfx = detector.FindFirstChild("Blink") as Instance;
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
		RunService.UnbindFromRenderStep(this.renderStepId);

		// Destroy the arrow if needed
		if (this.arrowIndicator) {
			this.arrowIndicator.Destroy();
			this.arrowIndicator = undefined;
		}
	}

	onTick(): void {
		if (this.areaIndicator) {
			const t = os.clock();
			const rotationSpeed = 45; // degrees per second
			const bobbingSpeed = 2; // radians per second
			const bobbingHeight = 0.5; // studs

			if (!this.areaIndicator.GetAttribute("OriginalPosition")) {
				this.areaIndicator.SetAttribute("OriginalPosition", this.areaIndicator.Position);
			}

			const originalPosition = this.areaIndicator.GetAttribute("OriginalPosition") as Vector3;

			const rotation = CFrame.Angles(0, math.rad(t * rotationSpeed), 0);
			const bobOffset = math.sin(t * bobbingSpeed) * bobbingHeight;

			this.areaIndicator.CFrame = new CFrame(originalPosition).mul(rotation).mul(new CFrame(0, bobOffset, 0));
		}
	}
}
