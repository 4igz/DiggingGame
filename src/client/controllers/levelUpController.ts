//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { emitUsingAttributes } from "shared/util/vfxUtil";

const vfx = ReplicatedStorage.WaitForChild("Assets").WaitForChild("VFX") as Folder;
const detectorEffectTextContainer = vfx.FindFirstChild("DetectorEffectTextVfx") as Part;
const levelUpVfx = vfx.FindFirstChild("LevelUpVfx")?.FindFirstChild("fx") as Attachment;

@Controller({})
export class LevelUp implements OnStart {
	onStart(): void {
		Events.levelUp.connect((newLevel) => {
			const character = Players.LocalPlayer.Character;
			if (!character) return;
			const rollTextVfxClone = detectorEffectTextContainer.Clone();
			rollTextVfxClone.PivotTo(character.GetPivot().add(new Vector3(math.random(-3, 3), 1, math.random(-3, 3))));
			const vfxClone = levelUpVfx.Clone();
			vfxClone.Position = Vector3.zero;
			vfxClone.Parent = character.PrimaryPart;

			const gui = rollTextVfxClone.WaitForChild("DetectorEffectText") as BillboardGui;
			const text = gui.WaitForChild("Text") as TextLabel;
			text.Text = `Level ${newLevel}`;
			const gradient = text.WaitForChild("TextGradient") as UIGradient;
			gradient.Color = new ColorSequence(Color3.fromRGB(255, 215, 0), Color3.fromRGB(255, 255, 0));
			const stroke = text.WaitForChild("UIStroke") as UIStroke;
			rollTextVfxClone.Parent = Workspace;

			const textPopoutTweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Exponential, Enum.EasingDirection.Out);
			const floatUpTweenInfo = new TweenInfo(2, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);

			TweenService.Create(text, textPopoutTweenInfo, { TextSize: 40 }).Play();
			TweenService.Create(gui, floatUpTweenInfo, { StudsOffsetWorldSpace: new Vector3(0, 3, 0) }).Play();
			emitUsingAttributes(vfxClone);

			task.delay(1, () => {
				const tween = TweenService.Create(text, textPopoutTweenInfo, { TextSize: 1, TextTransparency: 1 });
				TweenService.Create(stroke, textPopoutTweenInfo, { Transparency: 1 }).Play();
				tween.Completed.Connect(() => {
					rollTextVfxClone.Destroy();
					vfxClone.Destroy();
				});
				tween.Play();
			});
		});
	}
}
