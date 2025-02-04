import { OnRender, OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { ContextActionService, Players } from "@rbxts/services";
import { Functions } from "client/network";
import { boatConfig, DEFAULT_BOAT_SPEED, DEFAULT_BOAT_TURN_SPEED } from "shared/config/boatConfig";

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
	Hull: BasePart;
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
}

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
	private readonly velocityBlendAlpha = 0.1; // 0 < alpha < 1
	private readonly maxForwardSpeed = this.cfg.speed * DEFAULT_BOAT_SPEED;
	private readonly maxTurnSpeed = this.cfg.turnSpeed * DEFAULT_BOAT_TURN_SPEED;

	onStart() {
		const { OwnerSeat: ownerSeat } = this.instance;
		const { ProximityPrompt: ownerSeatPrompt, SitAnim: sitAnim, WeldConstraint: weld } = ownerSeat;

		Functions.getOwnsBoat(this.attributes.boatId).then((isOwner) => {
			this.isOwner = isOwner;

			if (!isOwner) {
				ownerSeatPrompt.Enabled = false;
			}
		});

		let playingTrack: AnimationTrack | undefined = undefined;

		ownerSeatPrompt.Triggered.Connect((playerWhoTriggered) => {
			if (!this.isOwner || playerWhoTriggered !== Players.LocalPlayer) return;

			const character = Players.LocalPlayer.Character;
			const hrp = character?.FindFirstChild("HumanoidRootPart") as Part;
			const humanoid = character?.FindFirstChild("Humanoid") as Humanoid;
			const animator = humanoid.FindFirstChild("Animator") as Animator;
			if (!character || !character.Parent || !hrp || !humanoid || !animator) return;
			this.isSittingInDriverSeat = true;

			ownerSeatPrompt.Enabled = false;

			character.PivotTo(ownerSeat.CFrame.add(ownerSeat.ExtentsSize.mul(new Vector3(0, 1, 0))));
			weld.Part1 = hrp;
			playingTrack = animator.LoadAnimation(sitAnim);
			playingTrack.Priority = Enum.AnimationPriority.Action4;
			playingTrack.Play();

			humanoid.ChangeState(Enum.HumanoidStateType.Physics);
		});

		ContextActionService.BindAction(
			"ExitBoat",
			(_, userInputState) => {
				if (userInputState !== Enum.UserInputState.Begin || !this.isSittingInDriverSeat)
					return Enum.ContextActionResult.Pass;
				const character = Players.LocalPlayer.Character;
				const humanoid = character?.FindFirstChild("Humanoid") as Humanoid;
				if (!character || !character.Parent || !humanoid) return;

				this.isSittingInDriverSeat = false;
				weld.Part1 = undefined;
				character.PivotTo(ownerSeat.CFrame.add(new Vector3(0, 4, 0)));

				ownerSeatPrompt.Enabled = this.isOwner;
				if (playingTrack && playingTrack.IsPlaying) {
					playingTrack.Stop();
				}
				humanoid.ChangeState(Enum.HumanoidStateType.Running);
				this.currentVelocity = new Vector3(0, 0, 0);
				this.currentAngularVelocity = new Vector3(0, 0, 0);
				this.instance.Physics.ForceAttachment.LinearVelocity.VectorVelocity = this.currentVelocity;
				// this.instance.Hull.ForceAttachment.LinearVelocity.VectorVelocity = this.currentLinearVelocity;
				this.instance.Physics.ForceAttachment.AngularVelocity.AngularVelocity = this.currentAngularVelocity;
			},
			true,
			ownerSeatPrompt.GamepadKeyCode,
			ownerSeatPrompt.KeyboardKeyCode,
			Enum.KeyCode.Space,
		);

		Players.LocalPlayer.CharacterAdded.Connect((character) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			humanoid.Died.Once(() => {
				if (this.isSittingInDriverSeat && this.isOwner) {
					this.isSittingInDriverSeat = false;
					weld.Part1 = undefined;

					ownerSeatPrompt.Enabled = this.isOwner;
				}
			});
		});
	}

	onRender(dt: number): void {
		if (!this.isOwner || !this.isSittingInDriverSeat) return;
		const Vf = this.instance.Physics.ForceAttachment.LinearVelocity;

		const moveVector = this.controls.GetMoveVector();

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

		// 3. Assign the smoothed velocities to Roblox’s LinearVelocity & AngularVelocity
		Vf.VectorVelocity = vel;
		// linearVelocity.VectorVelocity = this.currentLinearVelocity;
		this.instance.Physics.ForceAttachment.AngularVelocity.AngularVelocity = targetAngularVelocity;
	}
}
