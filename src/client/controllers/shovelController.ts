//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import {
	CollectionService,
	ContextActionService,
	Players,
	ReplicatedStorage,
	RunService,
	SoundService,
	TweenService,
	UserInputService,
	Workspace,
} from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Events, Functions } from "client/network";
import { shovelConfig } from "shared/config/shovelConfig";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";
import { getTopmostPartAtPosition } from "shared/util/castingUtil";
import { interval } from "shared/util/interval";
import { emitParticleDescendants, emitUsingAttributes, setParticleDescendantsEnabled } from "shared/util/vfxUtil";
import { ZoneController } from "./zoneController";
import CameraShaker from "@rbxts/camera-shaker";
import { subscribe } from "@rbxts/charm";
import { inventorySizeAtom, treasureCountAtom } from "client/atoms/inventoryAtoms";
import { findFurthestPointWithinRadius } from "shared/util/detectorUtil";
import { observeAttribute } from "shared/util/attributeUtil";
import { NetworkedTarget } from "shared/networkTypes";
import { allowDigging } from "client/atoms/detectorAtoms";

const camera = Workspace.CurrentCamera;
const holeTroveMap = new Map<Trove, [Signal<(size: number) => void>, Sound, BasePart]>();

const camShake = new CameraShaker(
	Enum.RenderPriority.Camera.Value,
	(shakeCFrame) => (camera!.CFrame = camera!.CFrame.mul(shakeCFrame)),
);
camShake.Start();

const DIG_KEYBINDS = [Enum.KeyCode.ButtonR2, Enum.KeyCode.ButtonL2, Enum.UserInputType.MouseButton1];

@Controller({})
export class ShovelController implements OnStart {
	public diggingActive = false;
	public lastDiggingTime = 0;

	public onDiggingComplete = new Signal<() => void>();
	public canStartDigging = false;

	constructor(private readonly zoneController: ZoneController) {}

	onStart() {
		const DigTargetModelFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("TargetModels");
		const VfxFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("VFX");
		const digVfx = VfxFolder.WaitForChild("DiggingVfx") as BasePart;
		const rewardVfx = VfxFolder.WaitForChild("Reward") as BasePart;
		const digCompleteVfx = VfxFolder.WaitForChild("DigCompletionVfx") as BasePart;
		const digModels = new Map<string, Model>();
		const digTroves = new Map<string, Trove>();
		const digOutSound = SoundService.WaitForChild("Tools").WaitForChild("Dig out") as Sound;
		let isInventoryFull = false;
		let noPositionFound = false;
		let targetActive = false;
		let usingDigEverywhere = false;
		let isAutoDigging = false;

		let replicatedDigSoundInterval = interval(1);

		let lastSuccessfulDig = 0;

		let digProgress = 0;
		let digGoal = 0;

		let digRequestInProgress = false;

		subscribe(treasureCountAtom, (count) => {
			isInventoryFull = count >= inventorySizeAtom();
		});

		let autoSendDigCD = interval(math.max(gameConstants.AUTO_DIG_CLICK_INTERVAL, gameConstants.DIG_TIME_SEC));
		let nearbySpawnCheckCD = interval(0.1);
		const AnimationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

		const shovelDiggingAnimation = AnimationFolder.WaitForChild("DiggingAnimationWithEvent");
		const NODIG_shovelFullbodyAnimation = AnimationFolder.WaitForChild("ShovelFullbodyIdleNODIG");
		const NODIG_shovelUpperbodyAnimation = AnimationFolder.WaitForChild("ShovelUpperbodyIdleNODIG");
		const CANDIG_shovelFullbodyAnimation = AnimationFolder.WaitForChild("ShovelFullbodyIdleCANDIG");
		const CANDIG_shovelUpperbodyAnimation = AnimationFolder.WaitForChild("ShovelUpperbodyIdleCANDIG");
		const DIG_ANIMATION_MARKER = "ShovelHitsDirt";

		const mouse = Players.LocalPlayer.GetMouse();

		const setupCharacter = (character: Model) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			const animator = humanoid.WaitForChild("Animator") as Animator;

			// Create your animation tracks
			const digTrack = animator.LoadAnimation(shovelDiggingAnimation as Animation);
			digTrack.Priority = Enum.AnimationPriority.Action;
			digTrack.Looped = true;

			const fullIdle = animator.LoadAnimation(CANDIG_shovelFullbodyAnimation as Animation);
			fullIdle.Priority = Enum.AnimationPriority.Idle;
			fullIdle.Looped = true;

			const upperIdle = animator.LoadAnimation(CANDIG_shovelUpperbodyAnimation as Animation);
			upperIdle.Priority = Enum.AnimationPriority.Movement;
			upperIdle.Looped = true;

			const fullIdleNoDigging = animator.LoadAnimation(NODIG_shovelFullbodyAnimation as Animation);
			fullIdle.Priority = Enum.AnimationPriority.Idle;
			fullIdle.Looped = true;

			const upperIdleNoDigging = animator.LoadAnimation(NODIG_shovelUpperbodyAnimation as Animation);
			upperIdle.Priority = Enum.AnimationPriority.Movement;
			upperIdle.Looped = true;

			character.ChildAdded.Connect((child) => {
				if (child.IsA("Tool") && shovelConfig[child.Name] !== undefined) {
					const cfg = shovelConfig[child.Name];

					const toolTrove = new Trove();

					mouse.Icon = "";

					toolTrove.add(
						character.ChildRemoved.Connect((child2) => {
							if (child2 === child) {
								toolTrove.destroy();
							}
						}),
					);

					toolTrove.add(
						child.Unequipped.Once(() => {
							if (child.Parent !== character) {
								toolTrove.destroy();
							}
						}),
					);

					Signals.setShovelEquipped.Fire(true);

					// Speeds for your digging animation
					const CLICK_ANIM_SPEED = 3;
					const BASE_SPEED = 1.5;

					// Track state for the dig animation
					let animActive = false;
					let clickTimes: number[] = [];
					const maxClickCount = 10;

					// Example marker connection
					toolTrove.add(
						digTrack.GetMarkerReachedSignal(DIG_ANIMATION_MARKER).Connect(() => {
							Signals.dig.Fire();
						}),
						"Disconnect",
					);

					const startDiggingAnimation = () => {
						// If we're already active or not in a dig state, skip.
						if (animActive && !this.diggingActive) return;
						animActive = true;

						// Stop all idle animations when digging
						fullIdle.Stop();
						upperIdle.Stop();
						fullIdleNoDigging.Stop();
						upperIdleNoDigging.Stop();

						digTrack.AdjustSpeed(BASE_SPEED);
						if (!digTrack.IsPlaying) {
							digTrack.Play();
						}
					};

					const stopDiggingAnimation = () => {
						if (!animActive) return;
						animActive = false;

						digTrack.Stop();
						digTrack.TimePosition = 0;
					};

					/**
					 * Plays the correct idle animation depending on whether the player is moving.
					 * If the player is moving -> use the upper-body idle animation.
					 * Otherwise -> use the full-body idle animation.
					 */
					const updateIdleAnimation = () => {
						// Only run if NOT digging
						if (this.diggingActive) {
							fullIdle.Stop();
							upperIdle.Stop();
							return;
						}

						if (nearbySpawnCheckCD()) {
							const mapFolder = CollectionService.GetTagged("Map").filter(
								(instance) => instance.Name === this.zoneController.getCurrentMapName(),
							)[0];
							// Get the spawn bases from the map
							const spawnBaseFolder = mapFolder?.WaitForChild("SpawnBases");

							if (!spawnBaseFolder) {
								warn("Spawn base folder not found.");
								return;
							}

							const bases = spawnBaseFolder.GetChildren().filter((inst) => inst.IsA("BasePart"));

							if (bases.size() > 0) {
								const [position] = findFurthestPointWithinRadius(
									character.GetPivot().Position,
									bases,
									gameConstants.DIG_RANGE,
								);
								if (!position) {
									// Can't dig here probably.
									noPositionFound = true;
								} else {
									noPositionFound = false;
								}
							}
						}

						const isMoving = humanoid.MoveDirection.Magnitude > 0;

						const animations = [
							{ shouldPlay: !isMoving && !noPositionFound, anim: fullIdle },
							{ shouldPlay: !isMoving && noPositionFound, anim: fullIdleNoDigging },
							{ shouldPlay: isMoving && !noPositionFound, anim: upperIdle },
							{ shouldPlay: isMoving && noPositionFound, anim: upperIdleNoDigging },
						];

						for (const { shouldPlay, anim } of animations) {
							// If we want this one playing but it isn’t, start it
							if (shouldPlay && !anim.IsPlaying) {
								anim.Play();
							}
							// If we do NOT want this one playing but it is, stop it
							else if (!shouldPlay && anim.IsPlaying) {
								anim.Stop();
							}
						}
					};

					task.defer(() => digTrack.AdjustSpeed(0));

					let steppedConnection: RBXScriptConnection | undefined;
					toolTrove.add(
						RunService.RenderStepped.Connect(() => {
							if ((humanoid && humanoid.Parent && this.diggingActive) || digRequestInProgress) {
								humanoid.WalkSpeed = 0;
							} else {
								humanoid.WalkSpeed = 16;
							}

							if (this.diggingActive) {
								startDiggingAnimation();
							}

							const currentTime = tick();

							// If we're auto-digging, try to start dig
							if (this.diggingActive && isAutoDigging && autoSendDigCD()) {
								if (isInventoryFull) {
									Signals.setAutoDiggingEnabled.Fire(false);
									return;
								}
								this.canStartDigging = true;
								Signals.autoDig.Fire();
								this.lastDiggingTime = currentTime;

								// Keep track of the times we "dug"
								clickTimes.push(currentTime);
								if (clickTimes.size() > maxClickCount) clickTimes.shift();
							} else if (!this.diggingActive) {
								// If we've stopped digging, ensure the dig animation is stopped
								stopDiggingAnimation();
							}

							// Filter out old clicks
							clickTimes = clickTimes.filter(
								(time) => currentTime - time <= digTrack.Length / digTrack.Speed,
							);

							// If the dig animation is active, adjust speed based on recent clicks
							if (animActive) {
								if (clickTimes.size() >= 1) {
									digTrack.AdjustSpeed(CLICK_ANIM_SPEED);
								} else {
									digTrack.AdjustSpeed(BASE_SPEED);
								}
							}

							// Always update idle animations if not digging
							updateIdleAnimation();
						}),
						"Disconnect",
					);

					const actionName = "ShovelAction";

					const shovelAction = (_: string, inputState: Enum.UserInputState) => {
						if (inputState === Enum.UserInputState.Begin) {
							const button = ContextActionService.GetButton(actionName);
							if (button) {
								button.Image = "rbxassetid://5713982324";
							}
							Signals.gotDigInput.Fire();

							if (this.diggingActive) {
								startDiggingAnimation();

								// Record click time
								const currentTime = tick();
								clickTimes.push(currentTime);
								if (clickTimes.size() > maxClickCount) {
									clickTimes.shift();
								}
								return;
							}

							if (targetActive && allowDigging()) {
								Events.digRequest();
								return;
							}

							if (noPositionFound) {
								Signals.invalidAction.Fire("Can't dig here!");
							}

							// "Dig Everywhere" logic here
							if (!targetActive && !noPositionFound) {
								if (isInventoryFull) {
									Signals.inventoryFull.Fire();
									return;
								}

								if (
									digRequestInProgress ||
									tick() - lastSuccessfulDig < gameConstants.SUCCESSFUL_DIG_COOLDOWN
								)
									return;
								digRequestInProgress = true;
								humanoid.WalkSpeed = 0;

								// The reason behind using a remote function is because a high latency client
								// will request and it will be long before they get a response. If you use a normal event,
								// it will send the dig event multiple times before it gets a response back, causing the client
								// to have some unexpected and frustrating behavior. Waiting for a response back allows the player
								// to only send one dig request, and begin digging only after the server responds.
								Functions.requestDigging()
									.then((success) => {
										digRequestInProgress = false;
										if (success) {
											usingDigEverywhere = true;
										}
									})
									.catch((err) => {
										warn(err);
										humanoid.WalkSpeed = 16;
									});
							}
						} else if (inputState === Enum.UserInputState.End) {
							const button = ContextActionService.GetButton(actionName);
							if (button) {
								button.Image = "rbxassetid://5713982324";
							}
						}
					};

					// === Hook into tool activation ===
					ContextActionService.BindAction(actionName, shovelAction, true, ...DIG_KEYBINDS);

					task.defer(() => {
						ContextActionService.SetImage(actionName, cfg.itemImage);
						ContextActionService.SetPosition(actionName, UDim2.fromScale(0.12, 0.325));
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

					const uisConnection = UserInputService.TouchTap.Connect((input, gameProcessedEvent) => {
						if (gameProcessedEvent) return;
						Signals.gotDigInput.Fire();
						shovelAction(actionName, Enum.UserInputState.Begin);
					});

					// === Cleanup on tool removal ===
					toolTrove.add(() => {
						Signals.setShovelEquipped.Fire(false);
						steppedConnection?.Disconnect();
						pcall(() => {
							ContextActionService.UnbindAction(actionName);
						});
						uisConnection.Disconnect();
						mouse.Icon = "";
						digTrack.Stop();

						// Reset speed
						humanoid.WalkSpeed = 16;

						this.canStartDigging = false;
						// If we were digging, end it
						if (this.diggingActive) {
							Signals.endDigging.Fire(false);
							this.diggingActive = false;
							Events.endDiggingClient();
							this.onDiggingComplete.Fire();
						}

						// Also stop idle animations if you want them ended when unequipping the tool
						upperIdle.Stop();
						fullIdle.Stop();
						upperIdleNoDigging.Stop();
						fullIdleNoDigging.Stop();
					});
				}
			});
		};

		Players.LocalPlayer.CharacterAdded.Connect(setupCharacter);
		if (Players.LocalPlayer.Character) {
			setupCharacter(Players.LocalPlayer.Character);
		}

		for (const player of Players.GetPlayers()) {
			if (player === Players.LocalPlayer) continue;

			const character = player.Character;
			if (character) {
				for (const descendant of character.GetDescendants()) {
					if (descendant.IsA("BasePart")) {
						descendant.CollisionGroup = gameConstants.PLAYER_COLGROUP;
					}
				}
			}
			player.CharacterAdded.Connect((character) => {
				for (const descendant of character.GetDescendants()) {
					if (descendant.IsA("BasePart")) {
						descendant.CollisionGroup = gameConstants.PLAYER_COLGROUP;
					}
				}
			});
		}

		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				for (const descendant of character.GetDescendants()) {
					if (descendant.IsA("BasePart")) {
						descendant.CollisionGroup = gameConstants.PLAYER_COLGROUP;
					}
				}
			});
		});

		Events.targetSpawnSuccess.connect(() => {
			targetActive = true;
		});

		Events.targetDespawned.connect(() => {
			targetActive = false;
		});

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			isAutoDigging = enabled;
		});

		Events.beginDigging.connect((target: NetworkedTarget) => {
			const player = target.owner;
			const character = player.Character;
			if (!character || !character.PrimaryPart) return;
			this.diggingActive = true;
			this.lastDiggingTime = tick();
			this.canStartDigging = true;
			Signals.clientStartedDigging.Fire();

			const digTrove = new Trove();

			const primaryPart = character.PrimaryPart;
			const currentPosition = primaryPart.Position;

			// Compute the new rotation
			const newRotation = CFrame.lookAt(
				currentPosition,
				new Vector3(target.position.X, currentPosition.Y, target.position.Z),
			);

			// If `AlignOrientation` doesn't exist, create it
			let align = primaryPart.FindFirstChild("AlignRotation") as AlignOrientation;
			if (!align) {
				align = new Instance("AlignOrientation");
				align.Name = "AlignRotation";
				align.Parent = primaryPart;
				align.MaxTorque = math.huge; // Ensure it applies force effectively
				align.Responsiveness = 25; // Adjust for smoother/faster rotation
				align.Mode = Enum.OrientationAlignmentMode.OneAttachment;
			}

			// Ensure the PrimaryPart has an attachment
			let attachment = primaryPart.FindFirstChild("AlignAttachment") as Attachment;
			if (!attachment) {
				attachment = new Instance("Attachment");
				attachment.Name = "AlignAttachment";
				attachment.Parent = primaryPart;
			}

			// Apply the rotation
			align.Attachment0 = attachment;
			align.CFrame = newRotation;

			// Deactivate the AlignOrientation after cleanup
			// digTrove.add(() => {
			// align.Attachment0 = undefined;
			// });

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
			digTroves.forEach((trove, id) => {
				trove.destroy();
				digTroves.delete(id);
			});
			model.SetAttribute(gameConstants.TREASURE_MODEL_ORIGIN, target.position);
			digModels.set(target.itemId, model);
			digTroves.set(target.itemId, digTrove);

			// Set dig models to not collide with characters.
			for (const descendant of model.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.CollisionGroup = gameConstants.NOCHARACTERCOLLISION_COLGROUP;
					descendant.Anchored = true;
					CollectionService.AddTag(descendant, "CameraIgnore");
				}
			}

			model.Parent = Workspace;

			// const h = new Instance("Highlight");
			// h.Parent = model;

			const currentMapFolder = CollectionService.GetTagged("Map").filter(
				(inst) => inst.Name === this.zoneController.getCurrentMapName(),
			)[0] as Folder;
			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.FilterDescendantsInstances = [
				...(Players.GetPlayers().map((p) => {
					return p.Character;
				}) as Model[]),
				model,
				...CollectionService.GetTagged("Treasure"),
				diggingVfx,
				...CollectionService.GetTagged("DigCrater"),
				currentMapFolder?.FindFirstChild("Others") as Folder,
				currentMapFolder?.FindFirstChild("PathfindingModifiers") as Folder,
			];
			// const raycast = Workspace.Raycast(target.position, new Vector3(0, -5, 0), params);
			const [hitPart, hitPosition] = getTopmostPartAtPosition(target.position, params, 5, 15, target.base);

			const craterSize = 5;
			const craterParts = 12;
			let color = Color3.fromRGB(101, 67, 33);

			if (
				hitPart &&
				hitPart.Material !== Enum.Material.Grass &&
				hitPart.Material !== Enum.Material.LeafyGrass &&
				hitPart.Material !== Enum.Material.Ground &&
				// We'll ignore slate because they're generally just small rocks and we don't want a rock hole
				hitPart.Material !== Enum.Material.Slate &&
				hitPart.Material !== Enum.Material.Basalt
			) {
				color = hitPart.Color;
			}

			const [setSize, digSound] = this.createDigHole(
				hitPosition ?? target.position,
				color,
				0.05,
				craterSize,
				craterParts,
				target.position,
				hitPart?.Material ?? Enum.Material.Grass,
				digTrove,
				target.itemId,
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
						digProgress = progress;
						digGoal = maxProgress;

						model.PivotTo(
							startPos.Lerp(
								new CFrame(target.position)
									.add(new Vector3(0, model.GetBoundingBox()[1].Y / 8, 0))
									.mul(randomRotation),
								progress / maxProgress,
							),
						);
					}
				}),
				"Disconnect",
			);

			// When digging finishes, set the size of the hole to the final size
			Signals.endDigging.Connect((diggingComplete) => {
				if (diggingComplete) {
					setSize.Fire(craterSize);
					emitParticleDescendants(diggingVfx, 7);
					digSound?.Play();
				}
			});

			const digCon = Signals.dig.Connect(() => {
				const character = Players.LocalPlayer.Character;
				if (!character) return;
				setSize.Fire((digProgress / digGoal) * craterSize);
				digSound?.Play();

				// A tiny bump to the camera
				const c = new CameraShaker.CameraShakeInstance(1, 4, 0, 0.3);
				c.PositionInfluence = new Vector3(1, 1, 1);
				c.RotationInfluence = new Vector3(0, 0, 5);
				camShake.Shake(c);

				// Emit some dirt particles
				emitParticleDescendants(diggingVfx, 7);

				// Kick up some dirt blocks (using parts)
				const origin = target.position;

				const params = new RaycastParams();
				params.FilterType = Enum.RaycastFilterType.Exclude;
				params.FilterDescendantsInstances = [
					...(Players.GetPlayers().map((p) => {
						return p.Character;
					}) as Model[]),
					model,
					...CollectionService.GetTagged("Treasure"),
					diggingVfx,
					rewardVfxClone,
					...CollectionService.GetTagged("DigCrater"),
				];
				// const raycast = Workspace.Raycast(origin, new Vector3(0, -5, 0), params);
				const [hitPart] = getTopmostPartAtPosition(origin, params, 5, 10, target.base);

				const particleNum = math.random(8, 14);
				const rng = new Random(tick());
				for (let i = 0; i < particleNum; i++) {
					const dirtBlock = new Instance("Part");
					const minSize = 0.55;
					const maxSize = 1.8;
					dirtBlock.Size = new Vector3(
						rng.NextNumber(minSize, maxSize),
						rng.NextNumber(minSize, maxSize),
						rng.NextNumber(minSize, maxSize),
					);

					let color = Color3.fromRGB(101, 67, 33);

					if (
						hitPart &&
						hitPart.Material !== Enum.Material.Grass &&
						hitPart.Material !== Enum.Material.LeafyGrass &&
						hitPart.Material !== Enum.Material.Ground &&
						// We'll ignore slate because they're generally just small rocks and we don't want a rock hole
						hitPart.Material !== Enum.Material.Slate &&
						hitPart.Material !== Enum.Material.Basalt
					) {
						color = hitPart.Color;
					}

					dirtBlock.Color = color;
					dirtBlock.Position = origin.add(new Vector3(math.random(-3, 3), 0, math.random(-3, 3)));
					dirtBlock.Material = Enum.Material.Sand;
					dirtBlock.Anchored = false;
					dirtBlock.CanCollide = true; // Because the collision groups wont work
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
						dirtBlock.ApplyImpulse(randomForce.mul(mass * 1.3));
						dirtBlock.ApplyAngularImpulse(randomForce.mul(mass / 2));
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

			digTrove.add(digCon, "Disconnect");
		});

		Events.endDiggingServer.connect((diggingComplete, itemId?: string) => {
			const character = Players.LocalPlayer.Character;
			if (!character || !character.PrimaryPart) return;

			const someOrientor = character.PrimaryPart?.FindFirstChildWhichIsA("AlignOrientation");
			if (someOrientor) {
				someOrientor.Attachment0 = undefined;
			}

			targetActive = false;
			lastSuccessfulDig = tick();
			this.diggingActive = false;
			this.canStartDigging = false;
			this.onDiggingComplete.Fire();
			Signals.endDigging.Fire(diggingComplete);
			if (!itemId) return;
			const existingModel = digModels.get(itemId);
			const digTrove = digTroves.get(itemId);
			if (existingModel && digTrove) {
				setParticleDescendantsEnabled(existingModel, diggingComplete);
				existingModel.SetAttribute("DiggingComplete", diggingComplete);
				digModels.delete(itemId);
				// Make the dig model jump
				const primaryPart = existingModel.PrimaryPart;
				if (primaryPart) {
					if (diggingComplete) {
						SoundService.PlayLocalSound(digOutSound);

						if (!usingDigEverywhere) {
							const c = new CameraShaker.CameraShakeInstance(2, 10, 0, 0.75);
							c.PositionInfluence = new Vector3(2, 2, 2);
							c.RotationInfluence = new Vector3(5, 5, 0);
							camShake.Shake(c);
							const digCompleteVfxClone = digCompleteVfx.Clone();
							digCompleteVfxClone.PivotTo(
								new CFrame(existingModel.GetAttribute(gameConstants.TREASURE_MODEL_ORIGIN) as Vector3),
							);
							digCompleteVfxClone.Parent = Workspace;
							digTrove.add(digCompleteVfxClone);
							task.defer(function () {
								emitUsingAttributes(digCompleteVfxClone);
							});
						}

						if (!existingModel.PrimaryPart) {
							digTrove.destroy();
							return;
						}

						const primaryPart =
							existingModel.PrimaryPart ?? existingModel.FindFirstChildWhichIsA("BasePart");
						const THROW_FORCE = observeAttribute("DigThrowForce", 20) as number;
						const UP_FORCE = observeAttribute("DigUpForce", 5) as number;

						// Compute the direction from the object to the player
						const directionToPlayer = character
							.GetPivot()
							.Position.sub(existingModel.PrimaryPart.Position).Unit;

						// Reverse the direction to throw behind the player
						const directionToThrow = directionToPlayer.mul(new Vector3(1, UP_FORCE, 1));

						// Combine the backward direction and the deviation, scaling the force
						const randomForce = directionToThrow.mul(THROW_FORCE).add(Vector3.one);

						// Get the floor position of the object
						const params = new RaycastParams();
						params.FilterType = Enum.RaycastFilterType.Exclude;
						params.FilterDescendantsInstances = [
							...(Players.GetPlayers().map((p) => {
								return p.Character;
							}) as Model[]),
							...CollectionService.GetTagged("Treasure"),
							existingModel,
							...CollectionService.GetTagged("DigCrater"),
						];

						// Adjust the object's position to ensure it's above ground
						// Calculate the offset to ensure the model is above ground, with a minimum Y offset for small items
						const minYOffset = 4; // Minimum Y offset to ensure it's out of the ground
						const extentsY = existingModel.GetExtentsSize().Y;
						const yOffset = math.max(extentsY, minYOffset);

						existingModel.PivotTo(
							new CFrame(existingModel.GetAttribute(gameConstants.TREASURE_MODEL_ORIGIN) as Vector3).add(
								new Vector3(0, yOffset, 0),
							),
						);

						for (const descendant of existingModel.GetDescendants()) {
							if (descendant.IsA("BasePart")) {
								descendant.Anchored = false;
								descendant.CanCollide = false;
							}
						}

						RunService.Heartbeat.Once(() => {
							primaryPart.AssemblyLinearVelocity = randomForce;
							task.delay(0.1, () => {
								for (const descendant of existingModel.GetDescendants()) {
									if (descendant.IsA("BasePart")) {
										descendant.CanCollide = true;
									}
								}
							});
						});

						// task.delay(2, () => {
						// 	if (primaryPart && primaryPart.Parent) {
						// 		const tween = TweenService.Create(
						// 			primaryPart,
						// 			new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
						// 			{
						// 				AssemblyLinearVelocity: Vector3.zero,
						// 			},
						// 		);
						// 		tween.Play();
						// 		tween.Completed.Once(() => {
						// 			primaryPart.AssemblyLinearVelocity = Vector3.zero;
						// 		});
						// 	}
						// });
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
									descendant.GetAttribute("ItemId") !== itemId
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

			usingDigEverywhere = false;
		});

		Events.replicateDig.connect((digTarget: NetworkedTarget) => {
			if (digTarget.owner === Players.LocalPlayer) return;
			const myCharacter = Players.LocalPlayer.Character;
			if (!myCharacter || !myCharacter.PrimaryPart) {
				return;
			}
			if (
				myCharacter.GetPivot().Position.sub(digTarget.position).Magnitude >
				gameConstants.MAX_DIG_REPLICATE_DISTANCE
			) {
				return;
			}
			if (digTarget.mapName !== this.zoneController.getCurrentMapName()) {
				return;
			}

			// Do a simplified version of what we're already doing for local player digging
			const digTrove = digTroves.get(digTarget.itemId) ?? new Trove();
			digTroves.set(digTarget.itemId, digTrove);
			let existingModel = digModels.get(digTarget.itemId);
			if (!existingModel) {
				const model = DigTargetModelFolder.FindFirstChild(digTarget.name) as Model;
				if (!model) {
					warn(`Model not found for target ${digTarget.name}`);
					return;
				}

				if (!model.PrimaryPart) {
					const primaryPart = model.FindFirstChildWhichIsA("BasePart", true);

					if (!primaryPart) {
						warn("Primary part not found for dig target.");
						return;
					}

					model.PrimaryPart = primaryPart;
				}

				existingModel = model.Clone();
				const randomRotation = CFrame.Angles(
					math.rad(math.random(0, 360)),
					math.rad(math.random(0, 360)),
					math.rad(math.random(0, 360)),
				);
				const startPos = new CFrame(digTarget.position)
					.sub(existingModel.GetExtentsSize().mul(Vector3.yAxis.div(4).add(new Vector3(0, 0.5, 0))))
					.mul(randomRotation);
				existingModel.PivotTo(startPos);
				existingModel.Parent = Workspace;
				existingModel.SetAttribute(gameConstants.TREASURE_MODEL_ORIGIN, digTarget.position);
				digModels.set(digTarget.itemId, existingModel);
				digTroves.set(digTarget.itemId, digTrove);
			}

			const diggingVfx = (existingModel.FindFirstChild(digVfx.Name) ?? digVfx.Clone()) as PVInstance;
			diggingVfx.PivotTo(new CFrame(digTarget.position));
			diggingVfx.Parent = existingModel;

			// Set dig models to not collide with characters.
			for (const descendant of existingModel.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.CollisionGroup = gameConstants.NOCHARACTERCOLLISION_COLGROUP;
					descendant.Anchored = true;
				}
			}

			emitParticleDescendants(diggingVfx, 7);

			digTrove.add(diggingVfx);
			digTrove.add(existingModel);

			const currentMapFolder = CollectionService.GetTagged("Map").filter(
				(inst) => inst.Name === this.zoneController.getCurrentMapName(),
			)[0] as Folder;
			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.FilterDescendantsInstances = [
				...(Players.GetPlayers().map((p) => {
					return p.Character;
				}) as Model[]),
				...CollectionService.GetTagged("Treasure"),
				existingModel,
				diggingVfx,
				...CollectionService.GetTagged("DigCrater"),
				currentMapFolder?.FindFirstChild("Others") as Folder,
				currentMapFolder?.FindFirstChild("PathfindingModifiers") as Folder,
			];
			// const raycast = Workspace.Raycast(target.position, new Vector3(0, -5, 0), params);
			const [hitPart, hitPosition] = getTopmostPartAtPosition(digTarget.position, params, 5, 15, digTarget.base);

			const craterSize = 5;
			const craterParts = 12;
			let color = Color3.fromRGB(101, 67, 33);

			if (
				hitPart &&
				hitPart.Material !== Enum.Material.Grass &&
				hitPart.Material !== Enum.Material.LeafyGrass &&
				hitPart.Material !== Enum.Material.Ground &&
				// We'll ignore slate because they're generally just small rocks and we don't want a rock hole
				hitPart.Material !== Enum.Material.Slate &&
				hitPart.Material !== Enum.Material.Basalt
			) {
				color = hitPart.Color;
			}

			const [setSize, digSound] = this.createDigHole(
				hitPosition ?? digTarget.position,
				color,
				0.05,
				craterSize,
				craterParts,
				digTarget.position,
				hitPart?.Material,
				digTrove,
				digTarget.itemId,
			);

			setSize.Fire((digTarget.digProgress / digTarget.maxProgress) * craterSize);
			if (replicatedDigSoundInterval(digTarget.itemId)) {
				digSound?.Play();
			}
		});

		Events.endDigReplication.connect((target: NetworkedTarget) => {
			const trove = digTroves.get(target.itemId);
			const model = digModels.get(target.itemId);

			if (trove && !model) {
				trove.destroy();
				digTroves.delete(target.itemId);
				warn("Model missing for dig end replication.");
				return;
			}

			if (trove && model) {
				const character = target.owner.Character;
				if (!character) {
					trove.destroy();
					digTroves.delete(target.itemId);
					digModels.delete(target.itemId);
					return;
				}
				const primaryPart = model.PrimaryPart;
				const THROW_FORCE = observeAttribute("DigThrowForce", 20) as number;
				const UP_FORCE = observeAttribute("DigUpForce", 5) as number;

				if (primaryPart && target.successful) {
					// Compute the direction from the object to the player
					const directionToPlayer = character.GetPivot().Position.sub(primaryPart.Position).Unit;

					// Reverse the direction to throw behind the player
					const directionToThrow = directionToPlayer.mul(new Vector3(1, UP_FORCE, 1));

					// Combine the backward direction and the deviation, scaling the force
					const randomForce = directionToThrow.mul(THROW_FORCE).add(Vector3.one);

					// Adjust the object's position to ensure it's above ground
					model.PivotTo(new CFrame(target.position).add(new Vector3(0, model.GetExtentsSize().Y, 0)));
					for (const descendant of model.GetDescendants()) {
						if (descendant.IsA("BasePart")) {
							descendant.Anchored = false;
							descendant.CanCollide = true;
						}
					}
					primaryPart.ApplyImpulse(randomForce.mul(primaryPart.AssemblyMass));
				} else {
					trove.destroy();
					digTroves.delete(target.itemId);
					digModels.delete(target.itemId);
					return;
				}

				const rewardVfxClone = rewardVfx.Clone();
				for (const descendant of rewardVfxClone.GetDescendants()) {
					if (descendant.IsA("ParticleEmitter")) {
						descendant.Parent = model.PrimaryPart;
						descendant.Enabled = true;
					}
				}
				trove.add(rewardVfxClone);

				const tweenInfo = new TweenInfo(4, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);
				const tweens = new Array<Promise<void>>();
				for (const descendant of [...CollectionService.GetTagged("DigCrater"), ...model.GetDescendants()]) {
					if (descendant.IsA("BasePart")) {
						if (
							CollectionService.HasTag(descendant, "DigCrater") &&
							descendant.GetAttribute("ItemId") !== target.itemId
						)
							continue;
						const tween = TweenService.Create(descendant, tweenInfo, { Transparency: 1 });
						tweens.push(new Promise<void>((resolve) => tween.Completed.Connect(() => resolve())));
						tween.Play();
					}
				}

				Promise.all(tweens).then(() => {
					trove?.destroy();
				});
			}
			task.delay(4, () => {
				trove?.destroy();
				digTroves.delete(target.itemId);
				// digModels.delete(itemId);
			});
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
		digTrove: Trove,
		itemId?: string,
	): [Signal<(size: number) => void>, Sound, BasePart] {
		if (holeTroveMap.get(digTrove) !== undefined) {
			return holeTroveMap.get(digTrove)!;
		}

		const digHoleSignal = new Signal<(size: number) => void>();

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
		hole.SetAttribute(gameConstants.TREASURE_MODEL_ORIGIN, trackedOrigin);
		hole.SetAttribute("ItemId", itemId);
		CollectionService.AddTag(hole, "DigCrater");
		CollectionService.AddTag(hole, "CameraIgnore");
		digTrove.add(hole);

		let digSound = hole.FindFirstChild("Digging") as Sound | undefined;
		if (!digSound) {
			digSound = SoundService.WaitForChild("Tools").FindFirstChild("Digging") as Sound | undefined;
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
			part.SetAttribute(gameConstants.TREASURE_MODEL_ORIGIN, trackedOrigin);
			part.SetAttribute("OriginalSize", part.Size);
			part.SetAttribute("ItemId", itemId);

			CollectionService.AddTag(part, "DigCrater");
			CollectionService.AddTag(part, "CameraIgnore");
			digTrove.add(part);
			holeParts.set(part, part.Size);
		}

		let prevSize = holeRadius;

		digHoleSignal.Connect((size) => {
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

		digHoleSignal.Fire(holeRadius);

		holeTroveMap.set(digTrove, [digHoleSignal, digSound!, hole]);

		digTrove.add(() => {
			holeTroveMap.delete(digTrove);
			digHoleSignal.DisconnectAll();
			digSound?.Destroy();
			hole.Destroy();
			for (const [part] of holeParts) {
				part.Destroy();
			}
		});

		return [digHoleSignal, digSound!, hole];
	}
}
