import { Controller, OnStart, OnTick } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import {
	CollectionService,
	Debris,
	PhysicsService,
	Players,
	ReplicatedStorage,
	RunService,
	SoundService,
	TweenService,
	Workspace,
} from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Events } from "client/network";
import { shovelConfig } from "shared/config/shovelConfig";
import { gameConstants } from "shared/constants";
import { Signals } from "shared/signals";
import { emitParticleDescendants, setParticleDescendantsEnabled } from "shared/util/vfxUtil";

@Controller({})
export class ShovelController implements OnStart, OnTick {
	public digProgress = 0;
	public digGoal = 0;

	onTick(dt: number): void {
		for (const vf of CollectionService.GetTagged("SlowPhysics")) {
			assert(vf.IsA("VectorForce"));
			const part = vf.Parent as BasePart;
			vf.Force = part.Position.add(new Vector3(0, part.GetMass() * (Workspace.Gravity / 2), 0));
		}
	}

	onStart() {
		const AnimationFolder = ReplicatedStorage.WaitForChild("Animations");
		const DigTargetModelFolder = ReplicatedStorage.WaitForChild("TargetModels");
		const VfxFolder = ReplicatedStorage.WaitForChild("VFX");
		const shovelDiggingAnimation = AnimationFolder.WaitForChild("DiggingAnimationWithEvent");
		const digVfx = VfxFolder.WaitForChild("DiggingVfx") as BasePart;
		const rewardVfx = VfxFolder.WaitForChild("Reward") as BasePart;
		let existingModel: Model | undefined = undefined;
		let digTrove = new Trove();
		const DIG_ANIMATION_MARKER = "ShovelHitsDirt";

		Players.LocalPlayer.CharacterAdded.Connect((character) => {
			// Apply player collision group to the character
			character.GetChildren().forEach((child) => {
				if (child.IsA("BasePart")) {
					child.CollisionGroup = gameConstants.PLAYER_COLGROUP;
				}
			});

			character.ChildAdded.Connect((child) => {
				if (child.IsA("Tool") && shovelConfig[child.Name] !== undefined) {
					const humanoid = character.WaitForChild("Humanoid") as Humanoid;
					const animator = humanoid.WaitForChild("Animator") as Animator;
					const shovelAnimation = shovelDiggingAnimation.Clone() as Animation;
					const track = animator.LoadAnimation(shovelAnimation);
					track.Priority = Enum.AnimationPriority.Action;
					track.Looped = true;
					humanoid.WalkSpeed = 0;
					const CLICK_ANIM_SPEED = 3;
					const BASE_SPEED = 1.5;
					task.defer(() => track.AdjustSpeed(BASE_SPEED));

					let clickTimes: number[] = [];
					const maxClickCount = 10;
					let active = false;

					track.GetMarkerReachedSignal(DIG_ANIMATION_MARKER).Connect(() => {
						Signals.dig.Fire();
					});

					const startAnimation = () => {
						track.AdjustSpeed(BASE_SPEED);
						track.Play();
					};

					const stopAnimation = () => {
						track.AdjustSpeed(BASE_SPEED);
						// track.TimePosition = 0;
					};

					startAnimation();

					const steppedConnection = RunService.Stepped.Connect(() => {
						const currentTime = tick();

						if (clickTimes.size() >= 1) {
							// Adjust speed based on average click interval
							track.AdjustSpeed(CLICK_ANIM_SPEED);
							active = true;
						} else if (active) {
							// Let the animation finish before stopping
							stopAnimation();
							active = false;
						}

						// Filter out old clicks
						clickTimes = clickTimes.filter((time) => currentTime - time <= track.Length / track.Speed);
					});

					const toolConnection = child.Activated.Connect(() => {
						const currentTime = tick();

						// Add current time to the array
						clickTimes.push(currentTime);
						if (clickTimes.size() > maxClickCount) {
							clickTimes.shift(); // Remove oldest timestamp if exceeding max count
						}
					});

					child.AncestryChanged.Once(() => {
						// Cleanup when the tool is unequipped or removed
						toolConnection.Disconnect();
						steppedConnection.Disconnect();
						track.Stop();
						track.Destroy();
						humanoid.WalkSpeed = 16;
					});
				}
			});
		});

		Events.beginDigging.connect((target) => {
			const player = Players.LocalPlayer;
			const character = player.Character;
			if (!character) return;

			// Make the player face the target.
			const lookAtCFrame = CFrame.lookAt(
				character.PrimaryPart!.Position,
				new Vector3(target.position.X, character.PrimaryPart!.Position.Y, target.position.Z),
			);

			character.PivotTo(lookAtCFrame);

			// Create the dig target model.
			let model = DigTargetModelFolder.FindFirstChild(target.name) as Model | undefined;

			if (!model) {
				warn(`Model not found for target ${target.name}`);
				return;
			}

			if (!model.PrimaryPart) {
				model.PrimaryPart = model.FindFirstChildWhichIsA("BasePart");
			}

			const diggingVfx = digVfx.Clone();
			diggingVfx.PivotTo(new CFrame(target.position));
			diggingVfx.Parent = target.base;

			const randomRotation = CFrame.Angles(
				math.rad(math.random(0, 360)),
				math.rad(math.random(0, 360)),
				math.rad(math.random(0, 360)),
			);
			const startPos = new CFrame(target.position).sub(new Vector3(0, 5, 0)).mul(randomRotation);
			model = model.Clone();
			model.PivotTo(startPos);
			model.Parent = target.base;
			if (existingModel) existingModel.Destroy();
			existingModel = model;
			existingModel.SetAttribute("TrackedOrigin", target.position);

			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.FilterDescendantsInstances = [
				character,
				model,
				diggingVfx,
				...CollectionService.GetTagged("DigCrater"),
			];
			const raycast = Workspace.Raycast(target.position, new Vector3(0, -5, 0), params);

			const craterSize = 5;
			const craterParts = 12;
			let color = Color3.fromRGB(101, 67, 33);

			if (
				raycast?.Instance &&
				raycast.Instance.Material !== Enum.Material.Grass &&
				raycast.Instance.Material !== Enum.Material.LeafyGrass
			) {
				color = raycast.Instance.Color;
			}

			const [setSize, digSound] = this.createDigHole(
				raycast?.Position ?? target.position,
				color,
				0.05,
				craterSize,
				craterParts,
				target.position,
				raycast?.Instance?.Material,
			);

			// For the reward vfx, we want to relocate the particles to the target model.
			const rewardVfxClone = rewardVfx.Clone();
			for (const descendant of rewardVfxClone.GetDescendants()) {
				if (descendant.IsA("ParticleEmitter")) {
					descendant.Parent = model.PrimaryPart;
				}
			}

			digTrove.add(rewardVfxClone);
			digTrove.add(diggingVfx);
			digTrove.add(
				Signals.updateDiggingProgress.Connect((progress, maxProgress) => {
					if (model) {
						this.digProgress = progress;
						this.digGoal = maxProgress;

						model.PivotTo(
							startPos.Lerp(
								new CFrame(target.position)
									.add(new Vector3(0, model.GetBoundingBox()[1].Y / 8, 0))
									.mul(randomRotation),
								progress / maxProgress,
							),
						);

						if (progress >= maxProgress * 0.9) {
							// Play some vfx and sounds when completing digging.
							setParticleDescendantsEnabled(model);
							model.SetAttribute("DiggingComplete", true);
						} else {
							setParticleDescendantsEnabled(model, false);
							model.SetAttribute("DiggingComplete", false);
						}
					}
				}),
				"Disconnect",
			);

			digTrove.add(
				Signals.dig.Connect(() => {
					const character = Players.LocalPlayer.Character;
					if (!character) return;
					setSize.Fire((this.digProgress / this.digGoal) * craterSize);
					digSound?.Play();

					// Emit some dirt particles
					emitParticleDescendants(diggingVfx, 7);

					// Tween the DigCrater to expand when digging
					const craterParts = CollectionService.GetTagged("DigCrater").filter(
						(v) => v.GetAttribute("TrackedOrigin") === target.position && v.IsA("BasePart"),
					) as BasePart[];

					for (const part of craterParts) {
						const ogSize = part.GetAttribute("OriginalSize") as Vector3;
						if (!ogSize) continue;

						const newSize = part.Size.add(new Vector3(0.5, 0, 0.5));
						const maxSize = ogSize;
						const usedSize = new Vector3(
							math.clamp(newSize.X, 0, maxSize.X),
							math.clamp(newSize.Y, 0, maxSize.Y),
							math.clamp(newSize.Z, 0, maxSize.Z),
						);
						const tween = TweenService.Create(
							part,
							new TweenInfo(0.25, Enum.EasingStyle.Bounce, Enum.EasingDirection.InOut, 0, true),
							{ Size: usedSize },
						);
						tween.Play();
						tween.Completed.Connect(() => tween.Destroy());
					}

					// Kick up some dirt blocks (using parts)
					const origin = target.position;

					const params = new RaycastParams();
					params.FilterType = Enum.RaycastFilterType.Exclude;
					params.FilterDescendantsInstances = [
						character,
						model,
						diggingVfx,
						rewardVfxClone,
						...CollectionService.GetTagged("DigCrater"),
					];
					const raycast = Workspace.Raycast(origin, new Vector3(0, -5, 0), params);

					const particleNum = math.random(5, 15);
					for (let i = 0; i < particleNum; i++) {
						const dirtBlock = new Instance("Part");
						const minSize = 0.55;
						const maxSize = 2;
						dirtBlock.Size = new Vector3(
							math.random(minSize, maxSize),
							math.random(minSize, maxSize),
							math.random(minSize, maxSize),
						);
						if (
							raycast?.Instance &&
							(raycast.Instance.Material === Enum.Material.Grass ||
								raycast.Instance.Material === Enum.Material.LeafyGrass)
						) {
							dirtBlock.Color = new Color3(101 / 255, 67 / 255, 33 / 255); // Dirt color
						} else {
							dirtBlock.Color = raycast?.Instance?.Color ?? new Color3(101 / 255, 67 / 255, 33 / 255);
						}
						dirtBlock.Position = origin.add(new Vector3(math.random(-3, 3), 0, math.random(-3, 3)));
						dirtBlock.Material = Enum.Material.Sand;
						dirtBlock.Anchored = false;
						dirtBlock.CanCollide = false;
						dirtBlock.Parent = Workspace;

						dirtBlock.CollisionGroup = gameConstants.DIRT_COLGROUP;
						CollectionService.AddTag(dirtBlock, "CameraIgnore");

						const mass = dirtBlock.AssemblyMass;
						const dirtBlockThrowForce = 20;
						const randomForce = new Vector3(
							math.random(-dirtBlockThrowForce, dirtBlockThrowForce),
							math.random(dirtBlockThrowForce, dirtBlockThrowForce * 2),
							math.random(-dirtBlockThrowForce, dirtBlockThrowForce),
						);

						task.defer(() => {
							dirtBlock.ApplyImpulse(randomForce.mul(mass));
							dirtBlock.ApplyAngularImpulse(randomForce.mul(mass));
						});

						// Create a tween for fading out the dirt block
						const fadeTween = TweenService.Create(
							dirtBlock,
							new TweenInfo(2, Enum.EasingStyle.Linear, Enum.EasingDirection.Out),
							{ Transparency: 1 },
						);

						// Play the fade-out tween and destroy the block when finished
						fadeTween.Play();
						fadeTween.Completed.Once(() => {
							dirtBlock.Destroy();
							fadeTween.Destroy();
						});
					}
				}),
				"Disconnect",
			);
		});

		Events.endDiggingServer.connect(() => {
			if (existingModel) {
				// Make the dig model jump
				const primaryPart = existingModel.PrimaryPart;
				if (primaryPart) {
					print(existingModel.GetAttribute("DiggingComplete"));
					if (existingModel.GetAttribute("DiggingComplete")) {
						print("Got here");
						const mass = primaryPart.AssemblyMass;
						const treasureThrowForce = 20;
						const randomForce = new Vector3(
							math.random(-treasureThrowForce, treasureThrowForce),
							math.random(treasureThrowForce, treasureThrowForce * 2),
							math.random(-treasureThrowForce, treasureThrowForce),
						);
						existingModel.PivotTo(
							existingModel.GetPivot().add(new Vector3(0, existingModel.GetBoundingBox()[1].Y * 2, 0)),
						);
						task.defer(() => primaryPart.ApplyImpulse(randomForce.mul(mass)));
					} else {
						existingModel.Destroy();
					}
				}

				// Allow the model to linger for a bit for visual effect
				task.delay(3, () => {
					if (existingModel) {
						const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);
						const tweens = new Array<Promise<void>>();
						for (const descendant of [
							...existingModel.GetDescendants(),
							...CollectionService.GetTagged("DigCrater"),
						]) {
							if (descendant.IsA("BasePart")) {
								if (
									CollectionService.HasTag(descendant, "DigCrater") &&
									descendant.GetAttribute("TrackedOrigin") !==
										existingModel.GetAttribute("TrackedOrigin")
								)
									continue;
								const tween = TweenService.Create(descendant, tweenInfo, { Transparency: 1 });
								tweens.push(
									new Promise<void>((resolve) =>
										tween.Completed.Connect((playbackState) => resolve()),
									),
								);
								tween.Play();
							} else if (descendant.IsA("ParticleEmitter")) {
								descendant.Enabled = false;
							}
						}
						Promise.all(tweens).then(() => existingModel?.Destroy());
					}
				});
			}

			digTrove.clean();
		});
	}

	createDigHole(
		position: Vector3,
		craterColor: Color3,
		holeRadius: number,
		maxSize: number,
		numSurroundingParts: number,
		trackedOrigin: Vector3,
		material: Enum.Material | undefined,
	): [Signal<(size: number) => void>, Sound] {
		const digHole = new Signal<(size: number) => void>();

		const hole = new Instance("Part");
		hole.Shape = Enum.PartType.Cylinder;
		hole.Size = new Vector3(0.1, holeRadius * 2, holeRadius * 2);
		hole.Orientation = new Vector3(0, 0, 90);
		hole.Position = position;
		hole.Anchored = true;
		hole.CanCollide = false;
		hole.BrickColor = new BrickColor("Really black");
		hole.Material = Enum.Material.SmoothPlastic;
		hole.Parent = Workspace;
		hole.SetAttribute("TrackedOrigin", trackedOrigin);
		CollectionService.AddTag(hole, "DigCrater");

		let digSound = hole.FindFirstChild("Digging") as Sound | undefined;
		if (!digSound) {
			digSound = SoundService.FindFirstChild("Digging") as Sound | undefined;
			digSound = digSound?.Clone();
			if (digSound) {
				digSound.Parent = hole;
			}
		}

		const holeParts = new Map<BasePart, Vector3>();

		// Surrounding parts
		for (let i = 0; i < numSurroundingParts; i++) {
			const angle = (i / numSurroundingParts) * math.pi * 2; // Evenly spaced angle around the circle
			const distance = holeRadius + math.random(-0.5, 0.5); // Slight randomness to distance

			// Calculate position around the edge of the cylinder
			const offsetX = math.cos(angle) * distance;
			const offsetZ = math.sin(angle) * distance;

			const partPosition = position.add(new Vector3(offsetX, 0, offsetZ));
			const part = new Instance("Part");

			// Set random size for jaggedness
			const rng = new Random();
			const randomSize = new Vector3(rng.NextNumber(2, 4), rng.NextNumber(4, 4), rng.NextNumber(2, 4));
			part.Size = randomSize;

			// Rotate part to face the center of the hole
			const lookAtCenter = CFrame.lookAt(partPosition, position); // Face the center
			const randomTilt = CFrame.Angles(
				math.rad(math.random(-75, 75)), // Slight random tilt
				0,
				math.rad(math.random(-75, 75)),
			);

			part.CFrame = lookAtCenter.mul(randomTilt);

			part.Anchored = true;
			part.CanCollide = false;
			part.Color = craterColor;
			part.Material =
				material === Enum.Material.Grass || material === Enum.Material.LeafyGrass
					? Enum.Material.Ground
					: material ?? Enum.Material.SmoothPlastic;
			part.Parent = Workspace;
			part.SetAttribute("TrackedOrigin", trackedOrigin);
			part.SetAttribute("OriginalSize", part.Size);
			CollectionService.AddTag(part, "DigCrater");
			holeParts.set(part, part.Size);
		}

		let prevSize = holeRadius;

		digHole.Connect((size) => {
			if (size < prevSize) return; // Only allow size increases
			// Clamp size to maxSize
			size = math.min(size, maxSize);
			prevSize = size;

			// Update the hole size
			hole.Size = new Vector3(0.1, size * 2, size * 2);

			// Update surrounding parts
			let i = 0;
			for (const [part, originalSize] of holeParts) {
				const angle = (i / numSurroundingParts) * math.pi * 2; // Evenly spaced angle around the circle
				const distance = size + math.random(-0.5, 0.5); // Adjust distance based on new size

				// Calculate new position around the edge of the cylinder
				const offsetX = math.cos(angle) * distance;
				const offsetZ = math.sin(angle) * distance;

				const partPosition = position.add(new Vector3(offsetX, 0, offsetZ));

				// Update position
				part.Position = partPosition;

				// Scale size based on new size and maxSize
				const scaleFactor = size / maxSize;
				part.Size = originalSize.mul(scaleFactor);
				i++;
			}
		});

		digHole.Fire(holeRadius);

		return [digHole, digSound!];
	}
}
