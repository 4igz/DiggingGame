//!optimize 2
import { OnRender, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { ContextActionService, Players, UserInputService } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { boatConfig, DEFAULT_BOAT_SPEED, DEFAULT_BOAT_TURN_SPEED } from "shared/config/boatConfig";
import { is } from "@rbxts/sift/out/Array";
import { gameConstants } from "shared/gameConstants";
import { ObjectPool } from "shared/util/objectPool";

interface Attributes {
	boatId: string; // Assigned by the server to indicate the boat's unique ID
}

interface BoatComponent extends Model {
	// It's not an actual seat instance because we don't want everyone to be able to sit in it.
	OwnerSeat: BasePart & {
		ProximityPrompt: ProximityPrompt;
		SitAnim: Animation;
		WeldConstraint: WeldConstraint;
	};
	Hull: BasePart & {
		OuterWake: Trail;
	};
	Seats: Folder;
	Physics: BasePart & {
		ForceAttachment: Attachment & {
			AngularVelocity: AngularVelocity;
			LinearVelocity: LinearVelocity;
		};
	};
}

interface PlayerModule {
	GetControls(this: PlayerModule): Controls;
}

interface Controls {
	GetMoveVector(this: Controls): Vector3;
	Disable(): void;
	Enable(): void;
}

const highlightPool = new ObjectPool(() => {
	return new Instance("Highlight");
}, 1);

@Component({
	tag: "Boat",
})
export class Boat extends BaseComponent<Attributes, BoatComponent> implements OnStart, OnRender {
	private playerModule = require(Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild(
		"PlayerModule",
	) as ModuleScript) as PlayerModule;
	private controls = this.playerModule.GetControls();
	private isSittingInDriverSeat: boolean = false;
	private isOwner: boolean = false;
	private cfg = boatConfig[this.instance.Name];

	// Store “current” velocities so we can smoothly update them
	private currentVelocity = new Vector3(0, 0, 0);
	private currentAngularVelocity = new Vector3(0, 0, 0);

	// Tweak these to tune how quickly you accelerate/decelerate
	private readonly maxForwardSpeed = this.cfg.speed * DEFAULT_BOAT_SPEED;
	private readonly maxTurnSpeed = this.cfg.turnSpeed * DEFAULT_BOAT_TURN_SPEED;

	onStart() {
		const { OwnerSeat: ownerSeat } = this.instance;
		const { ProximityPrompt: ownerSeatPrompt, SitAnim: sitAnim, WeldConstraint: weld } = ownerSeat;

		this.instance.Physics.ForceAttachment.LinearVelocity.MaxForce = this.maxForwardSpeed;
		this.instance.Physics.ForceAttachment.AngularVelocity.MaxTorque = this.maxTurnSpeed;
		this.instance.Hull.OuterWake.Enabled = false;

		Functions.getOwnsBoat(this.attributes.boatId).then((isOwner) => {
			this.isOwner = isOwner;

			ownerSeatPrompt.Enabled = isOwner;

			// Create a flashing highlight for the boat to indicate that it's the player's boat
			// and help point out its location in the world.

			const highlight = highlightPool.acquire();
			highlight.Parent = this.instance;

			const period = 5; // Time in seconds for a full oscillation
			const halfPeriod = period / 2;
			let elapsedTime = 0;
			while (this.isOwner && this.instance.Parent && !this.isSittingInDriverSeat) {
				elapsedTime += task.wait();
				const phase = (elapsedTime % period) / halfPeriod;
				highlight.FillTransparency = phase <= 1 ? 0.5 + phase * 0.5 : 0.5 + (2 - phase) * 0.5;
			}
			highlightPool.release(highlight);
		});

		let playingTrack: AnimationTrack | undefined = undefined;

		ownerSeatPrompt.Triggered.Connect((playerWhoTriggered) => {
			if (!this.isOwner || playerWhoTriggered !== Players.LocalPlayer) return;

			const character = Players.LocalPlayer.Character;
			const hrp = character?.FindFirstChild("HumanoidRootPart") as Part;
			const humanoid = character?.FindFirstChild("Humanoid") as Humanoid;
			const animator = humanoid.FindFirstChild("Animator") as Animator;
			if (
				!character ||
				!character.Parent ||
				!hrp ||
				!humanoid ||
				!animator ||
				humanoid.GetState() === Enum.HumanoidStateType.Seated ||
				humanoid.GetState() === Enum.HumanoidStateType.Dead
			)
				return;

			playingTrack = animator.LoadAnimation(sitAnim);
			playingTrack.Priority = Enum.AnimationPriority.Action4;

			// Immediately sit for snappiness. But we won't know that the player is actually sitting until the server tells us it's okay.
			// So sit for the responsiveness, but until the server validates this action, disable controls.
			character.PivotTo(ownerSeat.CFrame.add(ownerSeat.ExtentsSize.mul(Vector3.yAxis.div(2))));
			weld.Part1 = hrp;
			playingTrack.Play();
			this.controls.Disable();

			Functions.sitInBoat(this.attributes.boatId)
				.then((success) => {
					this.controls.Enable();
					if (!success) {
						weld.Part1 = undefined;
						playingTrack?.Stop();
						ownerSeatPrompt.Enabled = this.isOwner;
						return;
					}
					this.isSittingInDriverSeat = true;

					ownerSeatPrompt.Enabled = false;

					humanoid.ChangeState(Enum.HumanoidStateType.Physics);

					for (const instance of character.GetDescendants()) {
						if (instance.IsA("BasePart")) {
							instance.Massless = true;
						}
						if (instance.IsA("Tool")) {
							instance.Parent = Players.LocalPlayer.FindFirstChildOfClass("Backpack");
						}
						if (instance.IsA("Sound")) {
							instance.Volume = 0;
						}
					}

					Players.LocalPlayer.SetAttribute(gameConstants.BOAT_DRIVER_SITTING, true);
				})
				.catch(warn);
		});

		const exitBoatAction = (userInputState: Enum.UserInputState) => {
			if (userInputState !== Enum.UserInputState.Begin || !this.isSittingInDriverSeat)
				return Enum.ContextActionResult.Pass;
			this.isSittingInDriverSeat = false;

			const character = Players.LocalPlayer.Character;
			const humanoid = character?.FindFirstChild("Humanoid") as Humanoid;
			if (!character || !character.Parent || !humanoid) return;

			Events.exitBoat(this.attributes.boatId);
			character.PivotTo(ownerSeat.CFrame.add(new Vector3(0, 1, 0)));
			weld.Part1 = undefined;

			ownerSeatPrompt.Enabled = this.isOwner;
			if (playingTrack && playingTrack.IsPlaying) {
				playingTrack.Stop();
			}
			humanoid.ChangeState(Enum.HumanoidStateType.Jumping);

			for (const instance of character.GetDescendants()) {
				if (instance.IsA("BasePart")) {
					instance.Massless = false;
				}
				if (instance.IsA("Sound")) {
					instance.Volume = 0.65;
				}
			}

			Players.LocalPlayer.SetAttribute(gameConstants.BOAT_DRIVER_SITTING, false);

			this.currentVelocity = new Vector3(0, 0, 0);
			this.currentAngularVelocity = new Vector3(0, 0, 0);
			this.instance.Physics.ForceAttachment.LinearVelocity.VectorVelocity = this.currentVelocity;
			this.instance.Physics.ForceAttachment.AngularVelocity.AngularVelocity = this.currentAngularVelocity;
		};

		ContextActionService.BindAction(
			"ExitBoat",
			(_, userInputState) => exitBoatAction(userInputState),
			true,
			ownerSeatPrompt.GamepadKeyCode,
			ownerSeatPrompt.KeyboardKeyCode,
			// Enum.KeyCode.ButtonA,
			// Enum.KeyCode.Space,
		);

		UserInputService.JumpRequest.Connect(() => {
			if (!this.isSittingInDriverSeat) return;
			exitBoatAction(Enum.UserInputState.Begin);
		});

		const connectHumanoidDied = (humanoid: Humanoid) => {
			humanoid.Died.Once(() => {
				if (this.isSittingInDriverSeat && this.isOwner) {
					this.isSittingInDriverSeat = false;
					weld.Part1 = undefined;

					ownerSeatPrompt.Enabled = this.isOwner;
				}
			});
		};

		Players.LocalPlayer.CharacterAdded.Connect((character) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			connectHumanoidDied(humanoid);
		});

		const character = Players.LocalPlayer.Character;
		if (character) {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			if (humanoid) {
				connectHumanoidDied(humanoid);
			}
		}
	}

	onRender(dt: number): void {
		if (!this.isOwner) return;
		const rootPart = this.instance.PrimaryPart; // Assuming the boat is a Model with a PrimaryPart
		if (!rootPart) return;

		// Get current CFrame
		const currentCFrame = rootPart.CFrame;

		const forwardVector = currentCFrame.LookVector;

		// Construct a new upright CFrame with the correct yaw
		const uprightCFrame = CFrame.lookAt(
			currentCFrame.Position, // Preserve current position
			currentCFrame.Position.add(forwardVector), // Preserve forward direction
			new Vector3(0, 1, 0), // Force the up vector to be world-up (Y-axis)
		);

		// Apply the corrected CFrame
		rootPart.CFrame = uprightCFrame;

		const wakeSpeedThreshold = 25; // Define a threshold for enabling the wake

		const currentSpeed = this.instance.Physics.AssemblyLinearVelocity.Magnitude;
		if (currentSpeed > wakeSpeedThreshold) {
			this.instance.Hull.OuterWake.Enabled = true;
		} else {
			this.instance.Hull.OuterWake.Enabled = false;
		}

		if (!this.isSittingInDriverSeat) return;
		// const character = Players.LocalPlayer.Character;
		// if (!character) return;
		// const ownerSeat = this.instance.OwnerSeat;
		// character.PivotTo(ownerSeat.CFrame.add(new Vector3(0, 1, 0)));
		const Vf = this.instance.Physics.ForceAttachment.LinearVelocity;

		let moveVector = this.controls.GetMoveVector();

		// Allow player to just move forward with R2 since that is a common control scheme
		if (UserInputService.IsGamepadButtonDown(Enum.UserInputType.Gamepad1, Enum.KeyCode.ButtonR2)) {
			moveVector = new Vector3(moveVector.X, moveVector.Y, -1);
		} else if (UserInputService.IsGamepadButtonDown(Enum.UserInputType.Gamepad1, Enum.KeyCode.ButtonL2)) {
			moveVector = new Vector3(moveVector.X, moveVector.Y, 1);
		}

		// 1. Compute the target velocities from input
		// Forward/backward is moveVector.Z. We clamp to our maximum forward speed.
		const targetForwardSpeed = moveVector.Z * this.maxForwardSpeed;
		// Turning is negative X in your script, so we clamp to max turn speed
		const targetTurnSpeed = -moveVector.X * this.maxTurnSpeed;

		// Convert these scalars into Vector3
		const vel = new Vector3(0, 0, targetForwardSpeed);
		const targetAngularVelocity = new Vector3(0, targetTurnSpeed, 0);

		// 2. Smoothly blend from current velocity to target velocity
		// const FPS = 60; // Assume 60 FPS instead of using dt as framerates can differ and cause the boat to move slower/faster.
		// const alpha = 1 - math.exp(-FPS * dt);
		// this.currentVelocity = this.currentVelocity.Lerp(vel, alpha);

		// this.currentAngularVelocity = this.currentAngularVelocity.Lerp(targetAngularVelocity, this.velocityBlendAlpha);

		Vf.VectorVelocity = vel;
		this.instance.Physics.ForceAttachment.AngularVelocity.AngularVelocity = targetAngularVelocity;
	}
}
