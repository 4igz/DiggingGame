//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { Events, Functions } from "client/network";
import { dailyRewards, DAILY_REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { ItemType, RewardType } from "shared/networkTypes";
import { formatShortTime, shortenNumber } from "shared/util/nameUtil";
import { AnimatedButton, ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import Sift from "@rbxts/sift";
import { hasDailyAtom } from "client/atoms/rewardAtoms";

interface DailyRewardsProps {
	visible: boolean;
	uiController: UiController;
}

interface DailyRewardTileProps {
	day: number;
	streak: number;
	reward: string;
	isClaimable: boolean;
	rewardType: RewardType;
	rewardName?: string;
	onClaim: () => void;
}

// This component represents a single daily reward tile
const DailyRewardTile = ({
	day,
	streak,
	reward,
	isClaimable,
	onClaim,
	rewardType,
	rewardName,
}: DailyRewardTileProps) => {
	// Calculate visual states based on streak and day
	const [rewardImage] = useState(
		REWARD_IMAGES[rewardType] ??
			gameConstants.SHOP_CONFIGS[rewardType as ItemType][rewardName!]?.itemImage ??
			undefined,
	);
	const isCompleted = streak >= day;
	const isToday = streak + 1 === day;

	useEffect(() => {
		if (!rewardImage) {
			warn(`No image found for reward type ${rewardType} ${rewardName}`);
		}
	}, [rewardImage]);

	return (
		<frame BackgroundTransparency={1} LayoutOrder={day} key={`day-${day}`} Size={UDim2.fromScale(0.134, 0.931)}>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				active={day === 7 || (isToday && isClaimable)}
				clickable={isToday && isClaimable}
				selectable={isToday && isClaimable}
				onClick={onClaim}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://92826426523322"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(154, 133, 512, 596)}
					SliceScale={0.2}
					ZIndex={2}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
								new ColorSequenceKeypoint(0.483, Color3.fromRGB(255, 251, 126)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(255, 154, 53)),
							])
						}
						Rotation={45}
					/>
				</imagelabel>

				{/* Darkened overlay for completed or pending days */}
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://104781048145019"}
					ImageColor3={Color3.fromRGB(0, 0, 0)}
					ImageTransparency={0.23}
					key={"Overlay"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(154, 133, 512, 596)}
					SliceScale={0.2}
					Visible={isCompleted}
					ZIndex={4}
				/>

				{/* Check mark for completed days */}
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://118437638878933"}
					ImageColor3={Color3.fromRGB(98, 255, 0)}
					key={"CheckMark"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.7, 0.7)}
					SliceCenter={new Rect(0, 0, 1024, 1024)}
					Visible={isCompleted}
					ZIndex={6}
				/>

				{/* Reward icon */}
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={rewardImage}
					key={"Reward Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.75, 0.75)}
					SliceCenter={new Rect(0, 0, 1024, 1024)}
					ZIndex={3}
				/>

				{/* Day label */}
				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Day Label"}
					Position={UDim2.fromScale(0.0412, -0.106)}
					Size={UDim2.fromScale(0.911, 0.25)}
					Text={`Day ${day}`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					ZIndex={5}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>

				{/* Reward amount */}
				<textlabel
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Amount"}
					Position={UDim2.fromScale(0.437, 0.566)}
					Size={UDim2.fromScale(0.515, 0.25)}
					Text={`x${reward}` || "x2k"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					ZIndex={3}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>

				{/* Background radial */}
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://122246063149121"}
					key={"Radial"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={2}
				/>

				{/* Claim button - only visible on the current day if claimable */}
				<imagelabel
					Active={false}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://89920685859779"}
					key={"ClaimButton"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Selectable={isToday && isClaimable}
					Size={UDim2.fromScale(1, 0.5)}
					SliceCenter={new Rect(0, 0, 1024, 1024)}
					Visible={isToday && isClaimable}
					ZIndex={4}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(120, 255, 147)),
								new ColorSequenceKeypoint(0.223, Color3.fromRGB(84, 178, 102)),
								new ColorSequenceKeypoint(0.505, Color3.fromRGB(77, 163, 94)),
								new ColorSequenceKeypoint(0.732, Color3.fromRGB(77, 164, 94)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(120, 255, 147)),
							])
						}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 1),
								new NumberSequenceKeypoint(0.0329, 1),
								new NumberSequenceKeypoint(0.0917, 0.644),
								new NumberSequenceKeypoint(0.501, 0.319),
								new NumberSequenceKeypoint(0.91, 0.656),
								new NumberSequenceKeypoint(0.976, 1),
								new NumberSequenceKeypoint(1, 1),
							])
						}
					/>

					<textlabel
						key={"TextLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={
							new Font(
								"rbxasset://fonts/families/FredokaOne.json",
								Enum.FontWeight.Bold,
								Enum.FontStyle.Normal,
							)
						}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.8, 1)}
						Text={"Claim!"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						ZIndex={4}
					>
						<uistroke key={"UIStroke"} Thickness={3.2} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(43, 255, 10)),
									new ColorSequenceKeypoint(0.349, Color3.fromRGB(43, 255, 10)),
									new ColorSequenceKeypoint(0.438, Color3.fromRGB(186, 255, 185)),
									new ColorSequenceKeypoint(0.469, Color3.fromRGB(186, 255, 185)),
									new ColorSequenceKeypoint(0.502, Color3.fromRGB(186, 255, 185)),
									new ColorSequenceKeypoint(0.645, Color3.fromRGB(43, 255, 10)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(43, 255, 10)),
								])
							}
							Rotation={90}
						/>
					</textlabel>
				</imagelabel>

				{/* Glow effect for today's reward */}
				{isToday && (
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://98576192168714"}
						ImageColor3={Color3.fromRGB(255, 251, 129)}
						ImageTransparency={0.05}
						key={"Glow"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						SliceCenter={new Rect(154, 133, 512, 596)}
						SliceScale={0.2}
					>
						<uiscale key={"UIScale"} Scale={1.3} />
					</imagelabel>
				)}
			</AnimatedButton>
		</frame>
	);
};

export const DailyRewards = (props: DailyRewardsProps) => {
	const [lastClaimed, setLastClaimed] = React.useState(0);
	const [timeLeft, setTimeLeft] = React.useState(0);
	const [streak, setStreak] = React.useState(0);
	const [visible, setVisible] = React.useState(false);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));

	const menuRef = createRef<Frame>();

	// Effect to fetch last claim time and streak
	useEffect(() => {
		Functions.getLastDailyClaimTime()
			.then((time) => {
				setLastClaimed(time);
			})
			.catch(warn);

		Functions.getDailyStreak()
			.then((streak) => {
				setStreak(streak);
			})
			.catch(warn);

		// Listen for streak updates
		Events.updateDailyStreak.connect((streak, lastClaimTime) => {
			setStreak(streak);
			setLastClaimed(lastClaimTime);
		});
	}, []);

	// Effect to update timer
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

	// Effect to handle visibility
	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	// Effect to handle animation
	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.538, 0.465), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
		}
	}, [visible]);

	// Handler for claiming rewards
	const handleClaim = () => {
		Events.claimDailyReward();
	};

	// Check if rewards are claimable
	const isClaimable = timeLeft <= 0;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			key={"Daily Reward Container"}
			Position={UDim2.fromScale(0.5, 0.49)}
			Size={popInSz}
			Visible={visible}
			ref={menuRef}
		>
			{/* Background */}
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://100601270697881"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.526)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1.37)}
				SliceCenter={new Rect(65, 82, 555, 626)}
				SliceScale={0.25}
			>
				<ExitButton
					uiName={gameConstants.DAILY_REWARD_UI}
					uiController={props.uiController}
					menuRefToClose={menuRef}
					isMenuVisible={visible}
				/>
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(88, 108, 200)),
							new ColorSequenceKeypoint(0.23, Color3.fromRGB(67, 82, 152)),
							new ColorSequenceKeypoint(0.5, Color3.fromRGB(56, 69, 128)),
							new ColorSequenceKeypoint(0.751, Color3.fromRGB(65, 80, 148)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(88, 108, 200)),
						])
					}
					Rotation={90}
				/>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://82246683047981"}
				key={".$Icon"}
				Position={UDim2.fromScale(0.0678, -0.151)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.239, 0.243)}
			/>

			<frame
				BackgroundTransparency={1}
				key={"Info"}
				Position={UDim2.fromScale(0.0263, 0.0868)}
				Size={UDim2.fromScale(0.945, 0.189)}
			>
				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Timer"}
					Position={UDim2.fromScale(0.636, -1.75)}
					Size={UDim2.fromScale(0.195, 1)}
					Text={timeLeft > 0 ? formatShortTime(timeLeft) : "CLAIM NOW!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Thickness={4} />
				</textlabel>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.107, -1.97)}
					Size={UDim2.fromScale(0.47, 1.46)}
					Text={"Daily Rewards!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Thickness={4} />
				</textlabel>
			</frame>
			{/* Container for reward tiles */}
			<frame
				BackgroundTransparency={1}
				key={"Container"}
				Position={UDim2.fromScale(0.0263, -0.0106)}
				Size={UDim2.fromScale(0.946, 1.11)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.01, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Wraps={true}
				/>

				{/* Left side grid with 6 tiles */}
				<frame
					key={"LeftFrame"}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(4.55e-8, 0)}
					Size={UDim2.fromScale(0.59, 1)}
				>
					<uigridlayout
						key={"UIGridLayout"}
						CellPadding={UDim2.fromScale(0.02, 0.02)}
						CellSize={UDim2.fromScale(0.32, 0.46)}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					{/* Render first 6 reward tiles */}
					{Sift.Array.slice(dailyRewards, 1, 6).map((reward, index) => {
						return (
							<DailyRewardTile
								key={`reward-${index + 1}`}
								day={index + 1}
								streak={streak}
								reward={shortenNumber(reward.rewardAmount ?? 1, false)}
								isClaimable={isClaimable}
								onClaim={handleClaim}
								rewardType={reward.rewardType}
								rewardName={reward.itemName}
							/>
						);
					})}
				</frame>

				{/* Right side with day 7 */}
				<frame
					key={"RightFrame"}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(4.55e-8, 0)}
					Size={UDim2.fromScale(0.39, 1)}
				>
					<uigridlayout
						key={"UIGridLayout"}
						CellSize={UDim2.fromScale(1, 0.94)}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					{/* Day 7 is special - it gets its own container */}
					<DailyRewardTile
						key="reward-7"
						day={7}
						streak={streak}
						reward={shortenNumber(dailyRewards[6].rewardAmount ?? 1, false)}
						isClaimable={isClaimable}
						onClaim={handleClaim}
						rewardType={dailyRewards[6].rewardType}
						rewardName={dailyRewards[6].itemName}
					/>
				</frame>
			</frame>
		</frame>
	);
};
