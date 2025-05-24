import React, { useEffect, useRef, useState } from "@rbxts/react";
import { usePx } from "client/hooks/usePx";
import { AnimatedButton } from "./buttons";
import { Signals } from "shared/signals";
import { springs } from "client/utils/springs";
import { useMotion } from "client/hooks/useMotion";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { Events, Functions } from "client/network";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { subscribe } from "@rbxts/charm";
import { canClaimedTimedReward } from "client/atoms/uiAtoms";
import { TweenService } from "@rbxts/services";

const platform = getPlayerPlatform();

const DEFAULT_POS = UDim2.fromScale(0.075, platform === "Mobile" ? 0.04 : 0.1);
const CLOSED_POS = UDim2.fromScale(-0.2, platform === "Mobile" ? 0.04 : 0.1);

export const freeTimedRewardButton = (props: { uiController: UiController }) => {
	const [buttonPos, buttonPosMotion] = useMotion(DEFAULT_POS);
	const [visible, setVisible] = useState(false);
	const [claimable, setClaimable] = useState(false);
	const px = usePx();
	const arrowRef = useRef<ImageLabel>();

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

		subscribe(canClaimedTimedReward, setClaimable);
	}, []);

	useEffect(() => {
		if (claimable && arrowRef.current) {
			const tween1 = TweenService.Create(arrowRef.current, new TweenInfo(1), {
				Position: UDim2.fromScale(1.25, 0.5),
			});
			const tween2 = TweenService.Create(arrowRef.current, new TweenInfo(1), {
				Position: UDim2.fromScale(1.5, 0.5),
			});
			let running = true;
			const thread = task.spawn(() => {
				while (running) {
					tween1.Play();
					tween1.Completed.Wait();
					tween2.Play();
					tween2.Completed.Wait();
				}
			});

			return () => {
				running = false;
				task.cancel(thread);
				tween1.Destroy();
				tween2.Destroy();
			};
		}
	}, [claimable, arrowRef.current]);

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
					Image={"rbxassetid://136665615709133"}
					ImageColor3={Color3.fromRGB(255, 0, 4)}
					Position={UDim2.fromScale(1.5, 0.5)}
					Rotation={-90}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 0.75)}
					ZIndex={10}
					Visible={claimable}
					ref={arrowRef}
				/>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 0, 0)}
					key={".$Notification"}
					Position={UDim2.fromScale(0.8, 0)}
					Size={UDim2.fromScale(0.307, 0.307)}
					Visible={claimable}
					ZIndex={34}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						Text={"!"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={45}
					>
						<uistroke key={"UIStroke"} Thickness={px(2)} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.025, 0)}
							PaddingLeft={new UDim(0.05, 0)}
							PaddingRight={new UDim(0.05, 0)}
							PaddingTop={new UDim(0.025, 0)}
						/>
					</textlabel>

					<uistroke key={"UIStroke"} Thickness={px(3)} />

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</frame>

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
					Image={"rbxassetid://82871848306408"}
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
