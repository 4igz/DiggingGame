import { Controller, OnStart, OnTick } from "@flamework/core";
import { PathfindingService, Players, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
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
	private areaIndicator: BasePart | undefined;
	private activeWaypointIndicator: BasePart | undefined;
	private metalDetectorAnimation = this.ANIMATION_FOLDER.FindFirstChild("MetalDetector") as Animation;

	private isTweening = false;
	private isRolling = false;
	private targetActive = false;

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


						if (this.activeWaypointIndicator) {
							this.activeWaypointIndicator.Destroy();
							this.activeWaypointIndicator = undefined;
						}
						if (this.areaIndicator) {
							this.areaIndicator.Destroy();
							this.areaIndicator = undefined;
						}

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
			if (this.activeWaypointIndicator) {
				this.activeWaypointIndicator.Destroy();
				this.activeWaypointIndicator = undefined;
			}
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

			this.pathCompute.ComputeAsync(startPosition, position);
			const waypoints = this.pathCompute.GetWaypoints();

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
			this.tweenToWaypoints(waypoints);
		});
	}

	private lastWaypointIndex = 1; // Track the last waypoint index for resumption

	private async tweenToWaypoints(waypoints: PathWaypoint[]) {
		if (waypoints.size() === 0) return;

		// this.isTweening = true;

		const player = Players.LocalPlayer;
		const character = player.Character;
		if (!character || !character.PrimaryPart) {
			this.isTweening = false;
			return;
		}

		// Initialize or reuse the waypoint indicator
		if (!this.activeWaypointIndicator) {
			this.activeWaypointIndicator = this.waypointIndicator.Clone();
			this.activeWaypointIndicator.Parent = Workspace;
		}

		const maxIterations = waypoints.size() >= 5 ? 5 : waypoints.size();
		const startIndex = this.lastWaypointIndex; // Start from the last waypoint index if set

		for (let i = startIndex; i < maxIterations; i++) {
			if (!this.activeWaypointIndicator) break; // Likely the detector was unequipped during visualization.
			const waypoint = waypoints[i];
			const targetPosition = waypoint.Position.add(new Vector3(0, 2, 0));

			this.lastWaypointIndex = i; // Update to the current index

			const distance = character.PrimaryPart.Position.sub(targetPosition).Magnitude;
			const maxDistance = 40;
			const tweenTime = math.clamp(distance / maxDistance, 0.1, 0.5); // Tween time between 0.1 and 0.5 seconds
			const tweenInfo = new TweenInfo(tweenTime, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);
			const tween = TweenService.Create(this.activeWaypointIndicator, tweenInfo, { Position: targetPosition });

			tween.Play();
			await this.waitForTweenCompletion(tween);
		}

		// Update the last waypoint index for future resumptions
		if (this.lastWaypointIndex >= waypoints.size()) {
			this.lastWaypointIndex = 0; // Reset if all waypoints are completed
		}

		// Stop tweening and leave the indicator in place
		// this.isTweening = false;
	}

	private waitForTweenCompletion(tween: Tween) {
		return new Promise<void>((resolve) => {
			tween.Completed.Once(() => resolve());
		});
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
