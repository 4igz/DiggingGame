import React, { useState } from "@rbxts/react";
import { AnimatedButton } from "./inventory";
import { MarketplaceService, Players } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";

export const BottomTips = () => {
	const [hoveringPremium, setHoveringPremium] = useState(false);

	const px = usePx();

	return (
		<AnimatedButton
			position={UDim2.fromScale(-0.000172565, 1)}
			size={UDim2.fromScale(0.033, 0.077)}
			anchorPoint={new Vector2(0, 1)}
			onClick={() => {
				MarketplaceService.PromptPremiumPurchase(Players.LocalPlayer);
			}}
			onHover={() => {
				setHoveringPremium(true);
			}}
			onLeave={() => {
				setHoveringPremium(false);
			}}
		>
			<textlabel
				FontFace={Font.fromEnum(Enum.Font.Bangers)}
				key={"Premium"}
				Text={""}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				<uistroke key={"UIStroke"} Thickness={4} />

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.3}
					BorderColor3={Color3.fromRGB(27, 42, 53)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"ToolTip"}
					Position={UDim2.fromScale(3.82001, -0.59)}
					Size={UDim2.fromScale(7, 0.4)}
					Text={"Premium users get +10% money and +10% experience!"}
					TextColor3={new Color3(1, 1, 1)}
					// TextScaled={true}
					TextSize={px(15)}
					TextWrapped={true}
					TextTransparency={0.1}
					ZIndex={100}
					Visible={hoveringPremium}
				>
					<uistroke
						key={"UIStroke"}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
						Thickness={10}
						Transparency={0.3}
					/>
					<uistroke
						key={"UIStroke"}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
						Thickness={2}
						Transparency={0.3}
						Color={new Color3()}
					/>
				</textlabel>
			</textlabel>
		</AnimatedButton>
	);
};
