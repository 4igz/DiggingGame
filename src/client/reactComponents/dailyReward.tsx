//!optimize 2
//!native
import React, { createRef, useEffect } from "@rbxts/react";
import { Events, Functions } from "client/network";
import { dailyRewards, DAILY_REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { gameConstants, REWARD_IMAGES } from "shared/constants";
import { RewardType } from "shared/networkTypes";
import { formatShortTime } from "shared/util/nameUtil";
import { ExitButton } from "./inventory";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";

interface RewardProps {
	day: number;
	streak: number;
}

const DailyReward = (props: RewardProps) => {
	const cfg = dailyRewards[props.day - 1];

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			LayoutOrder={props.day}
			Position={UDim2.fromScale(-0.076, -0.175)}
			Size={UDim2.fromScale(0.134, 0.931)}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				ImageColor3={props.day - 1 > props.streak ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 255, 0)}
				Image={"rbxassetid://128347679935987"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Info"}
				Position={UDim2.fromScale(0.142, 0.0821)}
				Size={UDim2.fromScale(0.745, 0.776)}
			>
				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={REWARD_IMAGES[cfg.rewardType as RewardType]}
					LayoutOrder={1}
					key={"Reward Icon"}
					Position={UDim2.fromScale(0, 0.25)}
					Size={UDim2.fromScale(0.911, 0.692)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Day Label"}
					Size={UDim2.fromScale(0.911, 0.25)}
					Text={`Day ${props.day}`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.025, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
			</frame>
		</frame>
	);
};

interface DailyRewardsProps {
	visible: boolean;
	uiController: UiController;
}

export const DailyRewards = (props: DailyRewardsProps) => {
	const [lastClaimed, setLastClaimed] = React.useState(0);
	const [timeLeft, setTimeLeft] = React.useState(0);
	const [streak, setStreak] = React.useState(0);
	const [visible, setVisible] = React.useState(false);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));

	const menuRef = createRef<Frame>();

	useEffect(() => {
		Functions.getLastDailyClaimTime().then((time) => {
			if (!time) return; // If this happens, it's likely the player left before the profile could be loaded
			setLastClaimed(time);
		});

		Functions.getDailyStreak().then((streak) => {
			if (!streak) return;
			setStreak(streak);
		});

		Events.updateDailyStreak.connect((streak, lastClaimTime) => {
			setStreak(streak);
			setLastClaimed(lastClaimTime);
		});
	}, []);

	useEffect(() => {
		if (lastClaimed === 0) return;

		const thread = task.spawn(() => {
			while (true) {
				const timePassed = tick() - lastClaimed;
				const timeLeft = math.clamp(DAILY_REWARD_COOLDOWN - timePassed, 0, DAILY_REWARD_COOLDOWN);
				setTimeLeft(timeLeft);
				task.wait(1);
			}
		});

		return () => {
			task.cancel(thread);
		};
	}, [lastClaimed]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.538, 0.465), springs.responsive);
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
			key={"Daily Reward Container"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={popInSz}
			Visible={visible}
			ref={menuRef}
		>
			<ExitButton
				uiName={gameConstants.DAILY_REWARD_UI}
				uiController={props.uiController}
				menuRefToClose={menuRef}
				isMenuVisible={visible}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://133515423550411"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1)}
				SliceCenter={new Rect(70, 183, 979, 449)}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Container"}
				Position={UDim2.fromScale(0.0263, 0.328)}
				Size={UDim2.fromScale(0.946, 0.543)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0.01, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				{dailyRewards.map((_, i) => (
					<DailyReward day={i + 1} streak={streak} />
				))}
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Info"}
				Position={UDim2.fromScale(0.0263, 0.0868)}
				Size={UDim2.fromScale(0.945, 0.189)}
			>
				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Timer"}
					Position={UDim2.fromScale(0.795, 0)}
					Size={UDim2.fromScale(0.195, 1)}
					Text={formatShortTime(timeLeft)}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={4} />
				</textlabel>

				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.00507, 0)}
					Size={UDim2.fromScale(0.36, 1)}
					Text={"Daily Rewards!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={4} />
				</textlabel>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				LayoutOrder={4}
				key={"Sell All Btn Frame"}
				Position={UDim2.fromScale(0.337, 0.853)}
				Size={UDim2.fromScale(0.293, 0.272)}
			>
				<imagebutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://92239062767450"}
					key={"Sell All Btn"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(40, 86, 544, 87)}
					SliceScale={0.3}
					Event={{
						MouseButton1Click: () => {
							Events.claimDailyReward();
						},
					}}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Label"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.684, 0.524)}
						Text={"Claim!"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.071, 0)}
							PaddingLeft={new UDim(0.226, 0)}
							PaddingRight={new UDim(0.226, 0)}
							PaddingTop={new UDim(0.071, 0)}
						/>
					</textlabel>
				</imagebutton>
			</frame>
		</frame>
	);
};
