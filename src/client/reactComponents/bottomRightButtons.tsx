import React from "@rbxts/react";
import { VolumeMuteButton } from "./volumeMuteButton";
import { UpdateLogButton } from "./updateLogButton";
import UiController from "client/controllers/uiController";

interface BottomRightButtonsProps {
	uiController: UiController;
}

export const BottomRightButtons = (props: BottomRightButtonsProps) => {
	return (
		<frame
			Size={UDim2.fromScale(0.05, 0.15)}
			Position={UDim2.fromScale(1.0025, 1)}
			AnchorPoint={new Vector2(1, 1)}
			BackgroundTransparency={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Right}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
				Padding={new UDim(0, 5)}
			/>

			<UpdateLogButton uiController={props.uiController} />
			<VolumeMuteButton />
		</frame>
	);
};
