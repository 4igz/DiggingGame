import React from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { usePx } from "client/hooks/usePx";
import { springs } from "client/utils/springs";
import { Signals } from "shared/signals";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface HintProps {
	visible: boolean;
}

export const DetectorHint = (props: HintProps) => {
	const [visible, setVisible] = React.useState(false);
	const [transparency, setTransparency] = useMotion(1);
	const platform = getPlayerPlatform();

	const px = usePx();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			const seenSpring = task.delay(4, () => {
				setTransparency.spring(0, springs.crawl);
			});

			const autoDiggingSignal = Signals.setAutoDiggingEnabled.Connect(() => {
				setVisible(false);
			});

			const luckBarEnabledSignal = Signals.setLuckbarVisible.Connect(() => {
				setVisible(false);
			});

			return () => {
				autoDiggingSignal.Disconnect();
				luckBarEnabledSignal.Disconnect();
				task.cancel(seenSpring);
			};
		} else {
			setTransparency.immediate(1);
		}
	}, [visible]);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Visible={visible}>
			<textlabel
				Text={`<font color="rgb(200,200,200)"><b>Hold</b></font> ${
					platform === "Mobile" ? "the detector button" : platform === "Console" ? "R2" : "left click"
				} to search for treasures!`}
				Position={UDim2.fromScale(0.5, 0.1)}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				TextTransparency={transparency}
				Font={Enum.Font.BuilderSans}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Size={UDim2.fromScale(0.5, 0.075)}
				TextScaled={true}
				RichText={true}
			>
				<uistroke Thickness={px(2)} Transparency={transparency} />
			</textlabel>
		</frame>
	);
};
