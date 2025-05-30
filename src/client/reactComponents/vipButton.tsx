import React, { useEffect, useState } from "@rbxts/react";
import { AnimatedButton } from "./buttons";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { SoundService } from "@rbxts/services";
import { Events, Functions } from "client/network";

const CLOSED_POS = UDim2.fromScale(-0.2, 0.8);
const OPEN_POS = UDim2.fromScale(0.02, 0.8);

export const VipButton = (props: { uiController: UiController }) => {
	const [visible, setVisible] = useState(true);
	const [pos, posMotion] = useMotion(CLOSED_POS);

	useEffect(() => {
		Signals.menuOpened.Connect((isOpen) => {
			posMotion.spring(isOpen ? CLOSED_POS : OPEN_POS, springs.responsive);
		});

		Events.updateOwnedGamepasses.connect((ownedGps) => {
			if (ownedGps.get("VIP") === true) {
				setVisible(false);
				if (props.uiController.currentOpenUi === gameConstants.VIP_MENU) {
					props.uiController.closeCurrentOpenMenu();
				}
			}
		});

		Functions.getOwnedGamepasses.invoke().then((ownedGps) => {
			if (ownedGps.get("VIP") === true) {
				setVisible(false);
			}
		});
	}, []);

	return (
		<AnimatedButton
			key={"VIPButton"}
			position={pos}
			size={UDim2.fromScale(0.0650681, 0.224631)}
			anchorPoint={new Vector2(0, 0.5)}
			onClick={() => {
				props.uiController.toggleUi(gameConstants.VIP_MENU);
				SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("OpenShop") as Sound);
			}}
			visible={visible}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://91946808805915"}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={10}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.829558, 0.830803)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.154783, 0.154783)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.769745, 0.902351)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.097641, 0.0976409)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					ImageTransparency={0.2}
					Position={UDim2.fromScale(0.141191, 0.345594)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.139223, 0.139224)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(1.04975, 0.563414)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.13062, 0.13062)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(1.09201, 0.344579)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.201628, 0.201628)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.788312, -0.0147406)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.138729, 0.13873)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(-0.0427124, 0.739598)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.201628, 0.201628)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(-0.00294339, 0.369471)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.131594, 0.131594)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://127815852198424"}
				ImageColor3={Color3.fromRGB(37, 215, 255)}
				ImageTransparency={0.4}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1.5, 1.5)}
				ZIndex={-300}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

				<uigradient
					key={"UIGradient"}
					Rotation={90}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 0),
							new NumberSequenceKeypoint(0.839152, 0),
							new NumberSequenceKeypoint(1, 0.4),
						])
					}
				/>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
		</AnimatedButton>
	);
};
