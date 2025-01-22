import { Controller, OnStart, OnTick } from "@flamework/core";
import {
	PathfindingService,
	Players,
	ReplicatedStorage,
	RunService,
	SoundService,
	TweenService,
	Workspace,
} from "@rbxts/services";
import { Events } from "client/network";
import { BASE_DETECTOR_STRENGTH, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { UiController } from "./uiController";
import { gameConstants } from "shared/constants";
import { Trove } from "@rbxts/trove";

@Controller({})
export class Detector implements OnStart, OnTick {
	private pathCompute = PathfindingService.CreatePath({
		AgentRadius: 2,
		AgentHeight: 5,
		AgentCanJump: true,
	});
	private VFX_FOLDER = ReplicatedStorage.WaitForChild("VFX");
	private ANIMATION_FOLDER = ReplicatedStorage.WaitForChild("Animations");
	private waypointIndicator = this.VFX_FOLDER.FindFirstChild("Indicator") as BasePart;
	private areaIndicatorVFX = this.VFX_FOLDER.FindFirstChild("Area") as BasePart;
	private beepSound = SoundService.WaitForChild("Beep") as Sound;
	private areaIndicator: BasePart | undefined;
	private activeWaypointIndicator: BasePart | undefined;
	private arrowIndicator?: BasePart; // Cloned from ReplicatedStorage
	private renderStepId = "WaypointArrow";
	private metalDetectorAnimation = this.ANIMATION_FOLDER.FindFirstChild("MetalDetector") as Animation;

	private isRolling = false;
	private targetActive = false;
	private phase = 0;

	constructor(private readonly uiController: UiController) {}

	onStart() {
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

					const trove = new Trove();

					// Play the animation when the tool is equipped
					detectorTrack.Play();

					const thread = task.delay(0.5, () => {
						trove.add(
							child.Activated.Connect(() => {
								if (this.targetActive) return;
								Events.beginDetectorLuckRoll();
								this.uiController.toggleUi(gameConstants.LUCKBAR_UI, { visible: true, paused: false });
								this.isRolling = true;
							}),
						);

						trove.add(
							child.Deactivated.Connect(() => {
								if (!this.isRolling) return;
								this.isRolling = false;
								Events.endDetectorLuckRoll();
								this.uiController.updateUiProps(gameConstants.LUCKBAR_UI, { paused: true });
								task.delay(1, () => {
									this.uiController.closeUi(gameConstants.LUCKBAR_UI);
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
							this.uiController.closeUi(gameConstants.LUCKBAR_UI);
						}

						detectorTrack?.Stop();
						task.cancel(thread);
						trove.destroy();
					});
				}
			});
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

			// 3) Convert sine to transparency
			const transparency = sinVal * 0.25 + 0.25;
			dot.ImageTransparency = transparency;
			exclamationMark.ImageTransparency = transparency;

			exclamationMark.Rotation = sinVal * 10;
			shovel.Rotation = sinVal * 10;

			// 4) Check zero-crossing (- => +) for beep & blink
			if (sinVal <= 0 && prevSinVal > 0 && !canDig) {
				this.beepSound.Play();

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

	onTick(dt: number): void {
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
