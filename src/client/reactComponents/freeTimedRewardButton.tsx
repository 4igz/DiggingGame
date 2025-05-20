import React, { useEffect, useState } from "@rbxts/react";
import { usePx } from "client/hooks/usePx";
import { AnimatedButton } from "./buttons";
import { Signals } from "shared/signals";
import { springs } from "client/utils/springs";
import { useMotion } from "client/hooks/useMotion";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { Events, Functions } from "client/network";

const DEFAULT_POS = UDim2.fromScale(0.075, 0.04);
const CLOSED_POS = UDim2.fromScale(-0.2, 0.04);

export const freeTimedRewardButton = (props: { uiController: UiController }) => {
	const [buttonPos, buttonPosMotion] = useMotion(DEFAULT_POS);
	const [visible, setVisible] = useState(false);
	const px = usePx();

	useEffect(() => {
		Signals.menuOpened.Connect((isOpen) => {
			buttonPosMotion.spring(isOpen ? CLOSED_POS : DEFAULT_POS, springs.responsive);
		});

		Functions.getClaimedTimedReward.invoke().then((hasClaimedAlready) => {
			setVisible(!hasClaimedAlready);
		});

		Events.claimedTimedReward.connect(() => {
			setVisible(false);
		});
	}, []);

	return (
		<AnimatedButton
			anchorPoint={new Vector2(0.5, 0.5)}
			position={buttonPos}
			size={UDim2.fromScale(0.104, 0.16)}
			onClick={() => {
				props.uiController.toggleUi(gameConstants.FREE_TIMED_REWARD_MENU);
			}}
			visible={visible}
		>
			<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={new Color3(1, 1, 1)}>
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
				<uistroke key={"UIStroke"} Thickness={px(3)} />
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://105628174237609"}
					key={".$ImageLabel"}
					Position={UDim2.fromScale(0.387802, 0.451376)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.566177, 0.642951)}
					ZIndex={20}
				>
					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://116607654900413"}
						Position={UDim2.fromScale(0.945742, 0.748929)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.262258, 0.262258)}
						ZIndex={20}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://116607654900413"}
						Position={UDim2.fromScale(0.0315809, 0.208903)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.209279, 0.209279)}
						ZIndex={20}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://116607654900413"}
						Position={UDim2.fromScale(0.816955, 0.891513)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.175156, 0.175156)}
						ZIndex={20}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</imagelabel>

				<imagelabel
					BackgroundTransparency={1}
					Image={"rbxassetid://77934386944359"}
					key={".6"}
					Position={UDim2.fromScale(-0.14612, 0.0114329)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1.49893, 0.988567)}
					ZIndex={5}
				/>

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(21, 251, 255)),
							new ColorSequenceKeypoint(0.288927, Color3.fromRGB(13, 154, 161)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(7, 7, 141)),
						])
					}
					Rotation={26}
				/>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)}
					key={"OP"}
					Position={UDim2.fromScale(0.208841, 0.144971)}
					Size={UDim2.fromScale(1, 1.01232)}
					Text={"OP"}
					TextColor3={new Color3(1, 1, 1)}
					TextSize={px(45)}
					ZIndex={20}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
							])
						}
					/>
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"MenuText"}
					Position={UDim2.fromScale(0.501305, 0.937593)}
					Size={UDim2.fromScale(0.768337, 0.293328)}
					Text={"FREE"}
					TextColor3={new Color3(1, 1, 1)}
					// TextScaled={true}
					TextSize={px(35)}
					ZIndex={5}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(31, 31, 31)} Thickness={px(3)} />
				</textlabel>
			</frame>
		</AnimatedButton>
	);
};
