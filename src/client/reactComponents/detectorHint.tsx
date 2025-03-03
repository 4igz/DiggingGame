import React from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface HintProps {
	visible: boolean;
}

export const DetectorHint = (props: HintProps) => {
	const [visible, setVisible] = React.useState(false);
	const [transparency, setTransparency] = useMotion(1);
	const platform = getPlayerPlatform();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			task.wait(2);
			setTransparency.spring(0, springs.crawl);
		} else {
			setTransparency.immediate(1);
		}
	}, [visible]);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Visible={visible}>
			<textlabel
				Text={`<font color="rgb(0,60,200)"><b>Hold</b></font> ${
					platform === "Mobile" ? "the detect button" : platform === "Console" ? "R2" : "left click"
				} to search for treasures!`}
				Position={UDim2.fromScale(0.5, 0.78)}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				TextTransparency={transparency}
				Font={Enum.Font.BuilderSans}
				TextColor3={Color3.fromRGB(0, 120, 255)}
				Size={UDim2.fromScale(0.5, 0.075)}
				TextScaled={true}
				RichText={true}
			>
				<uistroke Thickness={2} Transparency={transparency} />
			</textlabel>
		</frame>
	);
};
