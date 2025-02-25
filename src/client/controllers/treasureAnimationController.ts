//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, StarterPlayer } from "@rbxts/services";
import { fullTargetConfig } from "shared/config/targetConfig";

const AnimationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

@Controller({
	loadOrder: 2,
})
export class TreasureAnimationController implements OnStart {
	onStart() {
		Players.LocalPlayer.CharacterAdded.Connect((character) => {
			const humanoid = character.WaitForChild("Humanoid");
			const animator = humanoid.WaitForChild("Animator") as Animator;
			character.ChildAdded.Connect((child) => {
				const cfg = fullTargetConfig[child.Name];

				if (child.IsA("Tool") && cfg !== undefined) {
					if (cfg.animationName === undefined) return;
					const anim = AnimationFolder.FindFirstChild(cfg.animationName);
					if (anim && anim.IsA("Animation")) {
						const track = animator.LoadAnimation(anim);
						track.Play();

						child.AncestryChanged.Once(() => {
							track.Stop();
							track.Destroy();
						});
					}
				}
			});
		});
	}
}
