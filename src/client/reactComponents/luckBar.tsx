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
	const [luckSz, setLuckSz] = useMotion(UDim2.fromScale(0, 0));
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(props.visible);

		if (props.visible) {
			setLuckSz.immediate(UDim2.fromScale(1, 0));
			setCurrentLuck(0);
		}
	}, [props.visible]);

	// Listen to server updates
	useEffect(() => {
		const connection = Events.updateLuckRoll.connect((luckValue: number, serverTime: number) => {
			setCurrentLuck(luckValue);
			setVisible(true);
		});

		return () => connection.Disconnect();
	}, []);

	// Predict roll based on time since last update
	useEffect(() => {
		const connection = RunService.RenderStepped.Connect((dt) => {
			if (props.paused) return;
			// const elapsed = Workspace.GetServerTimeNow() - localTime;
			// const predictedTime = startTime + elapsed;
			const predictedTime = Workspace.GetServerTimeNow();

			const sineValue = math.sin(predictedTime * math.pi);
			const adjustedValue = math.sign(sineValue) * (1 - math.pow(1 - math.abs(sineValue), 0.5)); // Flipped exponential
			const predictedLuck = 10 * math.abs(adjustedValue);

			setCurrentLuck(predictedLuck);
		});

		return () => connection.Disconnect();
	}, [props.paused]);

	useEffect(() => {
		setLuckSz.spring(UDim2.fromScale(1, currentLuck / maxLuck), springs.bubbly);
	}, [currentLuck]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={new UDim2(0.65, 0, 0.5, 0)}
			Size={new UDim2(0.01, 0, 0.3, 0)}
			BackgroundColor3={Color3.fromRGB(30, 30, 30)}
			BorderSizePixel={0}
			Visible={visible}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />
			<frame
				Size={luckSz}
				BackgroundColor3={Color3.fromRGB(50, 200, 50)}
				BorderSizePixel={0}
				ZIndex={2}
				Position={new UDim2(1, 0, 1, 0)}
				AnchorPoint={new Vector2(1, 1)}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</frame>

			<textlabel
				AnchorPoint={new Vector2(0.5, 1)}
				BackgroundTransparency={1}
				Font={Enum.Font.GothamBold}
				Position={UDim2.fromScale(0.5, 0)}
				Size={UDim2.fromScale(1, 0.25)}
				Text={string.format("🍀%.1fx", currentLuck)}
				TextColor3={Color3.fromRGB(18, 209, 28)}
				TextScaled={false}
				TextXAlignment={Enum.TextXAlignment.Center}
				TextSize={lerp(18, 24, currentLuck / maxLuck)}
			>
				<uistroke Thickness={3} />
			</textlabel>
		</frame>
	);
}
