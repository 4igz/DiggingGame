import { Controller, OnStart, OnTick } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import {
	CollectionService,
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
import { getTopmostPartAtPosition } from "shared/util/castingUtil";
import { interval } from "shared/util/interval";
import { emitParticleDescendants, setParticleDescendantsEnabled } from "shared/util/vfxUtil";

@Controller({})
export class ShovelController implements OnStart {
	public digProgress = 0;
	public digGoal = 0;
	private diggingActive = false;
	private lastDiggingTime = 0;
	private isAutoDigging = false;
	public onDiggingComplete = new Signal<() => void>();

	constructor() {
		let autoSendDigCD = interval(gameConstants.AUTO_DIG_CLICK_INTERVAL);
		const AnimationFolder = ReplicatedStorage.WaitForChild("Animations");

		const shovelDiggingAnimation = AnimationFolder.WaitForChild("DiggingAnimationWithEvent");
		const DIG_ANIMATION_MARKER = "ShovelHitsDirt";

		const setupCharacter = (character: Model) => {
			// Apply player collision group to the character
			character.GetChildren().forEach((child) => {
				if (child.IsA("BasePart")) {
					child.CollisionGroup = gameConstants.PLAYER_COLGROUP;
				}
			});

			character.ChildAdded.Connect((child) => {
				if (child.IsA("BasePart")) {
					child.CollisionGroup = gameConstants.PLAYER_COLGROUP;
				}

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
					task.defer(() => track.AdjustSpeed(0));

					let clickTimes: number[] = [];
					const maxClickCount = 10;
					let animActive = false;

					track.GetMarkerReachedSignal(DIG_ANIMATION_MARKER).Connect(() => {
						Signals.dig.Fire();
					});

					const startAnimation = () => {
						if (animActive) return;
						animActive = true;
						track.AdjustSpeed(BASE_SPEED);
						track.Play();
					};

					const stopAnimation = () => {
						if (!animActive) return;
						animActive = false;
						track.AdjustSpeed(0);
						track.TimePosition = 0;
					};

					track.Play();

					let steppedConnection: RBXScriptConnection | undefined;
					const rsThread = task.delay(0.1, () => {
						steppedConnection = RunService.Stepped.Connect(() => {
							if (humanoid && humanoid.Parent) {
								humanoid.WalkSpeed = 0;
							}
							// Send to server to dig, and if it calls back, then we set diggingActive to true
							if (this.diggingActive && this.isAutoDigging && autoSendDigCD()) {
								startAnimation();
								Signals.autoDig.Fire();
								this.lastDiggingTime = tick();
								Events.dig();

								const currentTime = tick();

								// Add current time to the array
								clickTimes.push(currentTime);
								if (clickTimes.size() > maxClickCount) {
									clickTimes.shift(); // Remove oldest timestamp if exceeding max count
								}
							} else if (!this.diggingActive) {
								stopAnimation();
							}

							// Filter out old clicks
							clickTimes = clickTimes.filter((time) => tick() - time <= track.Length / track.Speed);

							if (clickTimes.size() >= 1) {
								// Adjust speed based on average click interval
								if (!animActive) return;
								track.AdjustSpeed(CLICK_ANIM_SPEED);
							}
						});
					});

					let toolConnection: RBXScriptConnection | undefined;

					const thread = task.delay(0.5, () => {
						toolConnection = child.Activated.Connect(() => {
							if (this.diggingActive) {
								startAnimation();
							}
							const currentTime = tick();

							if (!this.diggingActive) {
								Events.dig();
							}

							// Add current time to the array
							clickTimes.push(currentTime);
							if (clickTimes.size() > maxClickCount) {
								clickTimes.shift(); // Remove oldest timestamp if exceeding max count
							}
						});
					});

					child.AncestryChanged.Once(() => {
						// Cleanup when the tool is unequipped or removed
						toolConnection?.Disconnect();
						steppedConnection?.Disconnect();
						task.cancel(rsThread);
						task.cancel(thread);
						track.Stop();
						track.Destroy();
						humanoid.WalkSpeed = 16;

						if (this.diggingActive) {
							Events.endDiggingClient();
							this.onDiggingComplete.Fire();
						}
					});
				}
			});
		};

		if (Players.LocalPlayer.Character) {
			setupCharacter(Players.LocalPlayer.Character);
		}

		Players.LocalPlayer.CharacterAdded.Connect(setupCharacter);
	}

	onStart() {
		const DigTargetModelFolder = ReplicatedStorage.WaitForChild("TargetModels");
		const VfxFolder = ReplicatedStorage.WaitForChild("VFX");
		const digVfx = VfxFolder.WaitForChild("DiggingVfx") as BasePart;
		const rewardVfx = VfxFolder.WaitForChild("Reward") as BasePart;
		const digModels = new Map<string, Model>();
		const digTroves = new Map<string, Trove>();
		const diggingConnections = new Array<RBXScriptConnection>();
		const digOutSound = SoundService.WaitForChild("Dig out") as Sound;

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			this.isAutoDigging = enabled;
		});

		Events.beginDigging.connect((target) => {
			const player = Players.LocalPlayer;
			const character = player.Character;
			if (!character || !character.PrimaryPart) return;
			this.diggingActive = true;
			this.lastDiggingTime = tick();

			// Make the player face the target.
			const pivot = character.GetPivot();
			const lookAtCFrame = CFrame.lookAt(
				pivot.Position,
				new Vector3(target.position.X, pivot.Position.Y, target.position.Z),
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
			diggingVfx.Parent = Workspace;

			const randomRotation = CFrame.Angles(
				math.rad(math.random(0, 360)),
				math.rad(math.random(0, 360)),
				math.rad(math.random(0, 360)),
			);
			const startPos = new CFrame(target.position).sub(new Vector3(0, 5, 0)).mul(randomRotation);
			model = model.Clone();
			model.PivotTo(startPos);
			model.Parent = Workspace;
			digTroves.forEach((trove, id) => {
				trove.destroy();
				digTroves.delete(id);
			});
			diggingConnections.forEach((con) => con.Disconnect());
			model.SetAttribute("TrackedOrigin", target.position);
			digModels.set(target.itemId, model);

			const digTrove = new Trove();
			digTroves.set(target.itemId, digTrove);

			// Set dig models to not collide with characters.
			for (const descendant of model.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.CollisionGroup = gameConstants.NOCHARACTERCOLLISION_COLGROUP;
				}
			}

			// const h = new Instance("Highlight");
			// h.Parent = model;

			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.FilterDescendantsInstances = [
				character,
				model,
				diggingVfx,
				target.base,
				...(target.base && target.base.Parent ? [target.base.Parent] : []),
				...CollectionService.GetTagged("DigCrater"),
			];
			// const raycast = Workspace.Raycast(target.position, new Vector3(0, -5, 0), params);
			const [hitPart, hitPosition] = getTopmostPartAtPosition(target.position, params, 5, 10);

			const craterSize = 5;
			const craterParts = 12;
			let color = Color3.fromRGB(101, 67, 33);

			if (hitPart && hitPart.Material !== Enum.Material.Grass && hitPart.Material !== Enum.Material.LeafyGrass) {
				color = hitPart.Color;
			}

			const [setSize, digSound] = this.createDigHole(
				hitPosition ?? target.position,
				color,
				0.05,
				craterSize,
				craterParts,
				target.position,
				hitPart?.Material,
				digTrove,
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
			digTrove.add(model);
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

			const digCon = Signals.dig.Connect(() => {
				const character = Players.LocalPlayer.Character;
				if (!character) return;
				setSize.Fire((this.digProgress / this.digGoal) * craterSize);
				digSound?.Play();

				// Emit some dirt particles
				emitParticleDescendants(diggingVfx, 7);

				// Kick up some dirt blocks (using parts)
				const origin = target.position;

				const params = new RaycastParams();
				params.FilterType = Enum.RaycastFilterType.Exclude;
				params.FilterDescendantsInstances = [
					character,
					model,
					diggingVfx,
					rewardVfxClone,
					target.base,
					...(target.base && target.base.Parent ? [target.base.Parent] : []),
					...CollectionService.GetTagged("DigCrater"),
				];
				// const raycast = Workspace.Raycast(origin, new Vector3(0, -5, 0), params);
				const [hitPart] = getTopmostPartAtPosition(origin, params, 5, 10);

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
						hitPart &&
						(hitPart.Material === Enum.Material.Grass || hitPart.Material === Enum.Material.LeafyGrass)
					) {
						dirtBlock.Color = Color3.fromRGB(101, 67, 33); // Dirt color
					} else {
						dirtBlock.Color = hitPart?.Color ?? Color3.fromRGB(101, 67, 33);
					}

					dirtBlock.Position = origin.add(new Vector3(math.random(-3, 3), 0, math.random(-3, 3)));
					dirtBlock.Material = Enum.Material.Sand;
					dirtBlock.Anchored = false;
					dirtBlock.CanCollide = false; // Because the collision groups wont work
					dirtBlock.Parent = Workspace;

					dirtBlock.CollisionGroup = gameConstants.NOCHARACTERCOLLISION_COLGROUP;
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
					digTrove.add(fadeTween);
					digTrove.add(dirtBlock);
					fadeTween.Play();
					fadeTween.Completed.Once(() => {
						dirtBlock.Destroy();
						fadeTween.Destroy();
					});
				}
			});

			diggingConnections.push(digCon);
			digTrove.add(digCon, "Disconnect");
		});

		Events.endDiggingServer.connect((itemId?: string) => {
			this.diggingActive = false;
			this.onDiggingComplete.Fire();
			if (!itemId) return;
			const existingModel = digModels.get(itemId);
			const digTrove = digTroves.get(itemId);
			if (existingModel && digTrove) {
				digModels.delete(itemId);
				// Make the dig model jump
				const primaryPart = existingModel.PrimaryPart;
				if (primaryPart) {
					if (existingModel.GetAttribute("DiggingComplete")) {
						SoundService.PlayLocalSound(digOutSound);

						const character = Players.LocalPlayer.Character;
						if (!character || !character.PrimaryPart || !existingModel.PrimaryPart) return;

						const primaryPart = existingModel.PrimaryPart;
						const mass = primaryPart.AssemblyMass;
						const THROW_FORCE = 2;

						// Compute the direction from the object to the player
						const directionToPlayer = character.PrimaryPart.Position.sub(
							existingModel.PrimaryPart.Position,
						).Unit;

						// Reverse the direction to throw behind the player
						const directionToThrow = directionToPlayer.mul(1);

						// Add a slight random deviation to the force
						const randomDeviation = new Vector3(
							math.random(THROW_FORCE / 2, THROW_FORCE),
							math.random(THROW_FORCE / 2, THROW_FORCE), // Positive Y force for an upward throw
							math.random(THROW_FORCE / 2, THROW_FORCE),
						);

						// Combine the backward direction and the deviation, scaling the force
						const randomForce = directionToThrow.add(randomDeviation.Unit).mul(THROW_FORCE);

						// Adjust the object's position to simulate a throw
						existingModel.PivotTo(
							existingModel.GetPivot().add(new Vector3(0, existingModel.GetExtentsSize().Y * 4, 0)),
						);
						task.defer(() => primaryPart.ApplyImpulse(randomForce.mul(mass / 3)));
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
								tweens.push(new Promise<void>((resolve) => tween.Completed.Connect(() => resolve())));
								tween.Play();
							} else if (descendant.IsA("ParticleEmitter")) {
								descendant.Enabled = false;
							}
						}

						Promise.all(tweens).then(() => {
							digTrove?.clean();
						});

						task.delay(2, () => {
							// After 2 seconds , just clean anyways.
							digTrove?.clean();
							digTroves.delete(itemId);
							digModels.delete(itemId);
						});
					}
				});
			}
		});
	}

	public getDiggingActive() {
		return this.diggingActive;
	}

	public getLastDiggingTime() {
		return this.lastDiggingTime;
	}

	createDigHole(
		position: Vector3,
		craterColor: Color3,
		holeRadius: number,
		maxSize: number,
		numSurroundingParts: number,
		trackedOrigin: Vector3,
		material: Enum.Material | undefined,
		digTrove: Trove,
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
		digTrove.add(hole);

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
			digTrove.add(part);
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

			for (const [part] of holeParts) {
				const ogSize = part.GetAttribute("OriginalSize") as Vector3;
				if (!ogSize) continue;

				const newSize = part.Size.add(new Vector3(0.5, 0, 0.5));
				const maxSize = ogSize;
				const usedSize = new Vector3(
					math.clamp(newSize.X, 0, maxSize.X),
					math.clamp(newSize.Y, 0, maxSize.Y),
					math.clamp(newSize.Z, 0, maxSize.Z),
				);
				TweenService.Create(
					part,
					new TweenInfo(0.25, Enum.EasingStyle.Bounce, Enum.EasingDirection.InOut, 0, true),
					{ Size: usedSize },
				).Play();
			}
		});

		digHole.Fire(holeRadius);

		return [digHole, digSound!];
	}
}
