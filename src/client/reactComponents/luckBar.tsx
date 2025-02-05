import Object from "@rbxts/object-utils";
import React, { useEffect, useState } from "@rbxts/react";
import { Players, ReplicatedStorage, RunService, SoundService, TweenService, Workspace } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants, ROLL_TYPES } from "shared/constants";
import { Signals } from "shared/signals";
import { computeLuckValue } from "shared/util/detectorUtil";
import { emitUsingAttributes } from "shared/util/vfxUtil";

interface LuckBarProps {
	visible: boolean;
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

const camera = Workspace.CurrentCamera;
const defaultFov = camera?.FieldOfView ?? 70;
const fovGoal = 60;

const vfx = ReplicatedStorage.WaitForChild("VFX") as Folder;
const detectorEffectTextContainer = vfx.FindFirstChild("DetectorEffectTextVfx") as Part;
const highRollVfx = vfx.FindFirstChild("HighRollContainer")?.FindFirstChild("fx") as Attachment;
const lowRollVfx = vfx.FindFirstChild("LowRollContainer")?.FindFirstChild("fx") as Attachment;
const tickSound = SoundService.WaitForChild("UI").WaitForChild("LuckBarTick") as Sound;
const luckRollSoundContainer = SoundService.WaitForChild("LuckRolls");
let lastPlayedLuck = 1;

export default function LuckBar(props: LuckBarProps) {
	const maxLuck = 10;

	const [currentLuck, setCurrentLuck] = useState(0);
	const [luckSz, setLuckSz] = useMotion(0);
	const [visible, setVisible] = useState(false);
	const [paused, setPaused] = useState(false);
	const [startTime, setStartTime] = useState(0);
	const [, fovMotion] = useMotion(defaultFov);

	useEffect(() => {
		fovMotion.onStep((value) => {
			camera!.FieldOfView = value;
		});

		Signals.startLuckbar.Connect(() => {
			setLuckSz.immediate(0);
			setStartTime(Workspace.GetServerTimeNow());
			setCurrentLuck(0);

			setPaused(false);
			setVisible(true);
			fovMotion.spring(fovGoal, springs.walk);
		});
		Signals.pauseLuckbar.Connect(() => {
			setPaused(true);
		});
		Signals.closeLuckbar.Connect(() => {
			fovMotion.spring(defaultFov, springs.molasses);
			setVisible(false);
			setPaused(true);
			lastPlayedLuck = 1;
		});
	}, []);

	useEffect(() => {
		if (props.visible) {
			setLuckSz.immediate(0);
			setStartTime(Workspace.GetServerTimeNow());
			setCurrentLuck(0);
		}
		task.defer(() => {
			setVisible(props.visible);
		});
	}, [props.visible]);

	// Predict roll based on time since last update
	useEffect(() => {
		const connection = RunService.RenderStepped.Connect(() => {
			if (paused || !visible) return;

			const elapsedTime = Workspace.GetServerTimeNow() - startTime;
			const luckValue = computeLuckValue(elapsedTime);

			setCurrentLuck(luckValue);
		});

		return () => connection.Disconnect();
	}, [paused, startTime, visible]);

	useEffect(() => {
		setLuckSz.immediate(currentLuck / maxLuck);

		const flooredLuck = math.floor(currentLuck);
		if (flooredLuck % 2 === 0 && flooredLuck !== lastPlayedLuck && visible) {
			SoundService.PlayLocalSound(tickSound);
			lastPlayedLuck = flooredLuck;
		}

		if (visible || currentLuck === 0) return;
		// Give some visual aid to show the player how they rolled
		const character = Players.LocalPlayer.Character;
		if (!character) return;
		const rollTextVfxClone = detectorEffectTextContainer.Clone();
		rollTextVfxClone.PivotTo(character.GetPivot().add(new Vector3(math.random(-3, 3), 1, math.random(-3, 3))));
		let rollType;
		let highestValue = -1;
		for (const [roll, value] of Object.entries(gameConstants.ROLL_LUCK_VALUES)) {
			if (currentLuck >= value && value > highestValue) {
				rollType = roll;
				highestValue = value;
			}
		}
		if (!rollType) {
			warn("No roll type found for luck value", currentLuck);
			return;
		}
		const vfx = currentLuck > gameConstants.HIGH_ROLL_THRESHOLD ? highRollVfx : lowRollVfx;
		const vfxClone = vfx.Clone();
		for (const descendant of vfxClone.GetDescendants()) {
			if (descendant.IsA("ParticleEmitter")) {
				descendant.Color = gameConstants.ROLL_COLORS[rollType];
			}
		}
		vfxClone.Position = Vector3.zero;
		vfxClone.Parent = character.PrimaryPart;

		const gui = rollTextVfxClone.WaitForChild("DetectorEffectText") as BillboardGui;
		const text = gui.WaitForChild("Text") as TextLabel;
		text.Text = ROLL_TYPES[rollType];
		const gradient = text.WaitForChild("TextGradient") as UIGradient;
		gradient.Color = gameConstants.ROLL_COLORS[rollType];
		const rollSound = luckRollSoundContainer.FindFirstChild(rollType) as Sound;
		if (rollSound) {
			SoundService.PlayLocalSound(rollSound);
		}
		const stroke = text.WaitForChild("UIStroke") as UIStroke;
		rollTextVfxClone.Parent = Workspace;

		const textPopoutTweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Exponential, Enum.EasingDirection.Out);
		const floatUpTweenInfo = new TweenInfo(2, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);

		TweenService.Create(text, textPopoutTweenInfo, { TextSize: 40 }).Play();
		TweenService.Create(gui, floatUpTweenInfo, { StudsOffsetWorldSpace: new Vector3(0, 3, 0) }).Play();
		if (rollType !== "Bad") {
			emitUsingAttributes(vfxClone);
		}

		task.delay(1, () => {
			const tween = TweenService.Create(text, textPopoutTweenInfo, { TextSize: 1, TextTransparency: 1 });
			TweenService.Create(stroke, textPopoutTweenInfo, { Transparency: 1 }).Play();
			tween.Completed.Connect(() => {
				rollTextVfxClone.Destroy();
				vfxClone.Destroy();
			});

			tween.Play();
		});
	}, [currentLuck, visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Luck Container"}
			Position={new UDim2(0.65, 0, 0.5, 0)}
			Size={UDim2.fromScale(0.0466, 0.495)}
			Visible={visible}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://139244894119518"}
				key={"Luck Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
			>
				<frame
					AnchorPoint={new Vector2(0.5, 1)}
					BackgroundColor3={Color3.fromRGB(255, 255, 0).Lerp(
						Color3.fromRGB(85, 255, 0),
						currentLuck / maxLuck,
					)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Fill"}
					Position={UDim2.fromScale(0.5, 0.95)}
					Size={luckSz.map((v) => UDim2.fromScale(0.5, math.clamp(v - 0.08, 0.1, 1)))}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.25, 0)} />
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Luck Meter"}
						Position={UDim2.fromScale(1.4, 0)}
						Size={UDim2.fromOffset(100, 50)}
						AnchorPoint={new Vector2(0, 0.5)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							SortOrder={Enum.SortOrder.LayoutOrder}
							HorizontalAlignment={Enum.HorizontalAlignment.Left}
							VerticalAlignment={Enum.VerticalAlignment.Center}
							Padding={new UDim(0, 0)}
						/>

						<uisizeconstraint MinSize={new Vector2(100, 35)} />

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://85733831609212"}
							key={"Luck Icon"}
							Position={UDim2.fromScale(0, 0.273)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(math.sqrt(currentLuck) / 4, math.sqrt(currentLuck) / 2)}
						>
							<textlabel
								key={"TextLabel"}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Position={UDim2.fromScale(1, 0.5)}
								Size={UDim2.fromScale(1, 0.735)}
								Text={string.format("x%.1f", currentLuck)}
								AnchorPoint={new Vector2(0, 0.5)}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextXAlignment={Enum.TextXAlignment.Left}
								TextScaled={true}
								TextWrapped={false}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
							</textlabel>
						</imagelabel>
					</frame>
				</frame>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.142} />
		</frame>
	);
}
