import React, { createRef, useEffect, useState } from "@rbxts/react";
import { AnimatedButton, ExitButton } from "./mainUi";
import { UiController } from "client/controllers/uiController";
import { gameConstants, REWARD_IMAGES } from "shared/constants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { Reward } from "shared/networkTypes";
import { PlaytimeReward, timePlayedRewards } from "shared/config/timePlayedConfig";
import { interval } from "shared/util/interval";
import { formatShortTime } from "shared/util/nameUtil";
import { Events, Functions } from "client/network";

const SEC_INTERVAL = interval(1);

const RewardSlot = (props: { cfg: PlaytimeReward; order: number; timerRunning: boolean }) => {
	const [timeLeft, setTimeLeft] = useState(props.cfg.unlockTime - time());
	const [claimed, setClaimed] = useState(false);

	useEffect(() => {
		const thread = task.spawn(() => {
			if (!props.timerRunning) return;
			while (time() < props.cfg.unlockTime) {
				task.wait();
				if (SEC_INTERVAL(props.order)) {
					setTimeLeft(props.cfg.unlockTime - time());
				}
			}
			setTimeLeft(0);
		});

		return () => {
			task.cancel(thread);
		};
	}, [timeLeft, props.timerRunning]);

	return (
		<AnimatedButton
			size={UDim2.fromScale(0.224, 0.306)}
			layoutOrder={props.order}
			onClick={() => {
				if (!claimed && time() >= props.cfg.unlockTime) {
					setClaimed(true);
					Functions.claimPlaytimeReward(props.order).then((result) => {
						// The hope is that this never happens, but just incase for some reason they get out of sync, then it will reset the claimed state
						if (!result) {
							setClaimed(false);
							return;
						}

						// TODO: Add a UI notification for the player that they claimed the reward.
						
					});
				}
			}}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://112251593272565"}
				key={"Background"}
				Position={UDim2.fromScale(0.526, 0.513)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1.05, 1.03)}
				SliceCenter={new Rect(100, 259, 901, 259)}
			/>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={REWARD_IMAGES[props.cfg.rewardType]}
				key={"Icon"}
				Position={UDim2.fromScale(0.322, 0.12)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.397, 0.57)}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Timer"}
				Position={UDim2.fromScale(0.046, 0.628)}
				Size={UDim2.fromScale(0.954, 0.231)}
				Text={`${!claimed ? (timeLeft > 0 ? formatShortTime(timeLeft) : "CLAIM") : "CLAIMED"}`}
				TextColor3={Color3.fromRGB(253, 253, 253)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />

				<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.19, 0)} PaddingRight={new UDim(0.19, 0)} />
			</textlabel>
		</AnimatedButton>
	);
};

interface PlaytimeRewardsProps {
	visible: boolean;
	uiController: UiController;
}

export const PlaytimeRewardsUi = (props: PlaytimeRewardsProps) => {
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const [visible, setVisible] = useState(false);
	const menuRef = createRef<Frame>();

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.727, 0.606), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Playtime Reward Frame"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={popInSz}
			Visible={visible}
			ref={menuRef}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://133515423550411"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			/>

			<ExitButton
				menuRefToClose={menuRef}
				uiController={props.uiController}
				uiName={gameConstants.PLAYTIME_REWARD_UI}
			/>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />

			<frame
				BackgroundColor3={Color3.fromRGB(80, 130, 229)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Title"}
				Position={UDim2.fromScale(-0.0358, -0.083)}
				Size={UDim2.fromScale(0.469, 0.168)}
				ZIndex={10}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(0.825, 0.5)}
					Size={UDim2.fromScale(0.552, 0.654)}
					Text={"Free Gifts!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={5.3} />
				</textlabel>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://127513841052443"}
					key={"Icon"}
					Position={UDim2.fromScale(0, -0.191)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.285, 1.38)}
					ZIndex={10}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0.025, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.85} />
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Container"}
				Position={UDim2.fromScale(0.037, 0.0726)}
				Size={UDim2.fromScale(0.938, 0.662)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0.025, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					Wraps={true}
				/>

				{timePlayedRewards.map((cfg, i) => {
					return <RewardSlot cfg={cfg} order={i} timerRunning={visible} />;
				})}
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Skip Frame"}
				Position={UDim2.fromScale(0.672, 0.734)}
				Size={UDim2.fromScale(0.274, 0.207)}
			>
				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Label"}
					Position={UDim2.fromScale(0.046, 0.0581)}
					Size={UDim2.fromScale(0.954, 0.321)}
					Text={"Skip All!"}
					TextColor3={Color3.fromRGB(253, 253, 253)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding
						key={"UIPadding"}
						PaddingBottom={new UDim(0.00219, 0)}
						PaddingLeft={new UDim(0.279, 0)}
						PaddingRight={new UDim(0.279, 0)}
						PaddingTop={new UDim(0.00219, 0)}
					/>
				</textlabel>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={2}
					key={"Buy Btn Frame"}
					Position={UDim2.fromScale(0.157, 0.458)}
					Size={UDim2.fromScale(0.862, 0.565)}
				>
					<imagebutton
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://92239062767450"}
						key={"Buy Btn"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Slice}
						Size={UDim2.fromScale(0.904, 1.07)}
						SliceCenter={new Rect(47, 94, 539, 94)}
					>
						<frame
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Discount Number"}
							Position={UDim2.fromScale(0.5, 0.492)}
							Size={UDim2.fromScale(0.829, 0.524)}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								HorizontalAlignment={Enum.HorizontalAlignment.Center}
								Padding={new UDim(0.075, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
								VerticalAlignment={Enum.VerticalAlignment.Center}
							/>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://75287275007438"}
								key={"Robux"}
								Position={UDim2.fromScale(0.0126, 0.129)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.213, 1)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								AutomaticSize={Enum.AutomaticSize.X}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Timer"}
								Position={UDim2.fromScale(0.534, 0.5)}
								Size={UDim2.fromScale(0.202, 0.98)}
								Text={"99"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 66, 34)} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.00063, 0)}
									PaddingTop={new UDim(0.00063, 0)}
								/>
							</textlabel>
						</frame>
					</imagebutton>
				</frame>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.05, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.3} />
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Disclaimer"}
				Position={UDim2.fromScale(0.0453, 0.741)}
				Size={UDim2.fromScale(0.56, 0.197)}
			>
				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Label"}
					Position={UDim2.fromScale(0.0732, 0.416)}
					Size={UDim2.fromScale(0.854, 0.433)}
					Text={"Leaving resets progress!"}
					TextColor3={Color3.fromRGB(253, 83, 86)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Disclaimer"}
					Position={UDim2.fromScale(0.225, 0.434)}
					Size={UDim2.fromScale(0.549, 0.34)}
					Text={"Disclaimer!"}
					TextColor3={Color3.fromRGB(253, 253, 253)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.94} />
			</frame>
		</frame>
	);
};
