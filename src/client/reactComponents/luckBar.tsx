import React, { useEffect, useState } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";

interface LuckBarProps {
	visible: boolean;
	paused: boolean;
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export default function LuckBar(props: LuckBarProps) {
	const maxLuck = 10;

	const [currentLuck, setCurrentLuck] = useState(0);
	const [luckSz, setLuckSz] = useMotion(0);
	const [visible, setVisible] = useState(false);
	const [startTime, setStartTime] = useState(0);

	useEffect(() => {
		setVisible(props.visible);

		if (props.visible) {
			setLuckSz.immediate(0);
			setStartTime(Workspace.GetServerTimeNow());
			setCurrentLuck(0);
		}
	}, [props.visible]);

	// Listen to server updates
	useEffect(() => {
		const connection = Events.updateLuckRoll.connect((luckValue: number, serverTime: number) => {
			setCurrentLuck(luckValue);
			setStartTime(Workspace.GetServerTimeNow());

			setVisible(true);
		});

		return () => connection.Disconnect();
	}, []);

	// Predict roll based on time since last update
	useEffect(() => {
		const connection = RunService.RenderStepped.Connect(() => {
			if (props.paused) return;

			const elapsedTime = Workspace.GetServerTimeNow() - startTime; // Elapsed time
			const frequencyScale = 0.75; // Frequency adjustment for oscillation
			const sineValue = math.sin(elapsedTime * math.pi * frequencyScale);
			const MAGNET_AT = 0.9;

			// Adjust for exponential shape and amplitude
			let adjustedValue = math.sign(sineValue) * (1 - math.pow(1 - math.abs(sineValue), 0.5));

			// Magnet effect: clamp to 10 if above 0.9
			if (math.abs(adjustedValue) > MAGNET_AT) {
				adjustedValue = 1; // Magnet to top
			}

			// Scale to 0-10 range
			const luckValue = 10 * math.abs(adjustedValue);

			setCurrentLuck(luckValue);
		});

		return () => connection.Disconnect();
	}, [props.paused, startTime]);

	useEffect(() => {
		setLuckSz.spring((maxLuck - currentLuck) / maxLuck, springs.responsive);
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
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://86778411977516"}
					key={"Fill"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
				>
					<uigradient
						key={"UIGradient"}
						Offset={luckSz.map((sz) => new Vector2(0.5, sz))}
						Rotation={90}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 1),
								new NumberSequenceKeypoint(0.00125, 0),
								new NumberSequenceKeypoint(1, 0),
							])
						}
					/>
				</imagelabel>
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
