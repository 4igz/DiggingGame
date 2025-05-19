import React, { useEffect, useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { usePx } from "client/hooks/usePx";

interface TutorialMessageProps {
	message: string;
	visible: boolean;
}

export const TutorialMessage = (props: TutorialMessageProps) => {
    const [popInPos, posMotion] = useMotion(UDim2.fromScale());
	const [visible, setVisible] = useState(props.visible);

	const px = usePx();

	useEffect(() => {
        
    }, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	return (
		<frame
			AnchorPoint={new Vector2(1, 1)}
			BackgroundTransparency={1}
			key={"TutorialMessage"}
			Position={UDim2.fromScale(0.7, 0.8)}
			Size={UDim2.fromScale(0.364771, 0.127074)}
		>
			<imagelabel
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://83143085311406"}
				key={"Gradient"}
				Position={UDim2.fromScale(0.034, 0.493)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.75, 0.914)}
				SliceCenter={new Rect(23, 22, 372, 67)}
				SliceScale={0.7}
			/>

			<textlabel
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658221428")}
				key={"Description"}
				Position={UDim2.fromScale(0.0693001, 0.116001)}
				Size={UDim2.fromScale(0.54355, 0.722434)}
				Text={props.message}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke
					key={"UIStroke"}
					LineJoinMode={Enum.LineJoinMode.Bevel}
					Thickness={px(2)}
					Transparency={0.2}
				/>
			</textlabel>

			<frame
				BackgroundTransparency={1}
				key={"Seller Profile"}
				Position={UDim2.fromScale(0.597494, -0.734143)}
				Size={UDim2.fromScale(0.367506, 1.32014)}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://101474809776872"}
					key={"Background"}
					Position={UDim2.fromScale(0.458678, 0.933597)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1.07079, 1.05101)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://77754309050946"}
						key={"Profile"}
						Position={UDim2.fromScale(0.497479, 0.448476)}
						Size={UDim2.fromScale(0.6, 0.7541)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</imagelabel>
			</frame>
		</frame>
	);
};
