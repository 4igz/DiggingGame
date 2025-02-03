import React, { useEffect, useState } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";
import { set } from "@rbxts/sift/out/Array";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { Signals } from "shared/signals";
import { computeLuckValue } from "shared/util/detectorUtil";

interface LuckBarProps {
	visible: boolean;
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

const camera = Workspace.CurrentCamera;
const defaultFov = camera?.FieldOfView ?? 70;
const fovGoal = 60;

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
			fovMotion.spring(defaultFov, springs.molasses);
		});
		Signals.closeLuckbar.Connect(() => {
			setVisible(false);
			setPaused(true);
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
		setLuckSz.spring(currentLuck / maxLuck, springs.responsive);
	}, [currentLuck]);

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
					BackgroundColor3={Color3.fromRGB(255, 0, 0).Lerp(Color3.fromRGB(85, 255, 0), currentLuck / maxLuck)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Fill"}
					Position={UDim2.fromScale(0.5, 0.95)}
					Size={luckSz.map((v) => UDim2.fromScale(0.5, v - 0.08))}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.25, 0)} />
				</frame>
			</imagelabel>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Luck Meter"}
				Position={UDim2.fromScale(-0.571, -0.142)}
				Size={UDim2.fromScale(2.14, 0.124)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://85733831609212"}
					key={"Luck Icon"}
					Position={UDim2.fromScale(0, 0.273)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.483, 1.18)}
				/>

				<textlabel
					key={"TextLabel"}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					Position={UDim2.fromScale(0.483, 0.266)}
					Size={UDim2.fromScale(0.592, 0.735)}
					Text={string.format("x%.1f", currentLuck)}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.0282, 0)} PaddingRight={new UDim(0.0282, 0)} />
				</textlabel>
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.142} />
		</frame>
	);
}
