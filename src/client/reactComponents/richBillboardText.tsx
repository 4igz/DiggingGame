//!optimize 2
import React, { RefObject } from "@rbxts/react";

interface BillboardGuiProps {
	text: string;
	adornee: PVInstance | Attachment | RefObject<PVInstance> | RefObject<Attachment>;
	bbgSize?: UDim2;
	isRichText?: boolean;
	isTextScaled?: boolean;
	textSize?: number;
	textColor?: Color3;
	font?: Enum.Font;
	offsetWorldSpace?: Vector3;
	enabled: boolean;
	strokeColor?: Color3;
}

export const RichBillboardText = (props: BillboardGuiProps) => {
	const [isEnabled, setEnabled] = React.useState(true);

	React.useEffect(() => {
		if (props.enabled === undefined) return;
		setEnabled(props.enabled);
	}, [props.enabled]);

	return (
		<billboardgui
			StudsOffset={props.offsetWorldSpace ?? Vector3.zero}
			Size={props.bbgSize ?? new UDim2(9, 0, 2, 0)}
			Adornee={props.adornee}
			Enabled={isEnabled ?? true}
			AlwaysOnTop={true}
		>
			<textlabel
				Text={props.text}
				RichText={props.isRichText ?? false}
				TextScaled={props.isTextScaled ?? true}
				TextWrapped={true}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				TextColor3={props.textColor ?? new Color3(1, 1, 1)}
				TextStrokeTransparency={0.5}
				TextStrokeColor3={new Color3(0, 0, 0)}
				Font={props.font ?? Enum.Font.BuilderSans}
			>
				<uistroke Thickness={2} Color={props.strokeColor} />
			</textlabel>
		</billboardgui>
	);
};
