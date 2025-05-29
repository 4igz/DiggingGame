//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, StarterPlayer } from "@rbxts/services";
import { fullTargetConfig } from "shared/config/targetConfig";

const AnimationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

@Controller({
	loadOrder: 2,
})
export class TreasureAnimationController implements OnStart {
	onStart() {
		const setupCharacter = (character: Model) => {
			const humanoid = character.WaitForChild("Humanoid");
			const animator = humanoid.WaitForChild("Animator") as Animator;
			const tracks = new Map<string, AnimationTrack>();
			character.ChildAdded.Connect((child) => {
				const cfg = fullTargetConfig[child.Name];

				if (child.IsA("Tool") && cfg !== undefined) {
					if (cfg.animationName === undefined) return;
					let track = tracks.get(cfg.animationName);

					if (!track) {
						const anim = AnimationFolder.FindFirstChild(cfg.animationName);
						assert(anim, "Could not find treasure animation " + cfg.animationName);
						if (anim && anim.IsA("Animation")) {
							track = animator.LoadAnimation(anim);
							track.Play();
							tracks.set(cfg.animationName, track);
						}
					} else {
						track.Play();
					}

					child.AncestryChanged.Once(() => {
						track!.Stop();
					});
				}
			});
		};

		const character = Players.LocalPlayer.Character;
		if (character) {
			setupCharacter(character);
		}

		Players.LocalPlayer.CharacterAdded.Connect(setupCharacter);
	}
}
