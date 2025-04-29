//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { Events, Functions } from "client/network";
import { dailyRewards, DAILY_REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { ItemType, RewardType } from "shared/networkTypes";
import { formatShortTime, shortenNumber, spaceWords } from "shared/util/nameUtil";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { usePx } from "client/hooks/usePx";
import { SoundService } from "@rbxts/services";
import { AnimatedButton } from "./buttons";

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
	size: UDim2;
	timeLeft: number;
}

// This component represents a single daily reward tile
const DailyRewardTile = ({
	day,
	streak,
	reward,
	isClaimable,
	onClaim,
	rewardType,
	timeLeft,
	rewardName,
	size,
}: DailyRewardTileProps) => {
	// Calculate visual states based on streak and day
	const [rewardImage] = useState(
		REWARD_IMAGES[rewardType] ??
			gameConstants.SHOP_CONFIGS[rewardType as ItemType][rewardName!]?.itemImage ??
			undefined,
	);
	const isCompleted = streak >= day;
	const isToday = streak + 1 === day;

	const px = usePx();

	useEffect(() => {
		if (!rewardImage) {
			warn(`No image found for reward type ${rewardType} ${rewardName}`);
		}
	}, [rewardImage]);

	return (
		<frame
			BackgroundTransparency={1}
			LayoutOrder={day === 7 ? 7 : ((day - 1) % 3) * 2 + math.floor((day - 1) / 3) + 1}
			key={day}
			Size={size}
		>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				// active={!isCompleted}
				clickable={isToday && isClaimable}
				selectable={isToday && isClaimable}
				onClick={onClaim}
				errorText={isCompleted ? "Already claimed this!" : "Can't claim this yet!"}
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
							day !== 7
								? new ColorSequence([
										new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
										new ColorSequenceKeypoint(0.50692, Color3.fromRGB(251, 235, 64)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(255, 128, 124)),
								  ])
								: new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(255, 187, 69)),
										new ColorSequenceKeypoint(0.49654, Color3.fromRGB(146, 160, 251)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(255, 60, 60)),
								  ])
						}
						Rotation={50}
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
					ZIndex={50}
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
					ZIndex={500}
				/>
				{/* Reward icon */}
				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={rewardImage}
					Position={UDim2.fromScale(0.5, 0.53)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.717771, 0.71777)}
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
						Visible={day === 6}
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
						Visible={day === 6}
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
						Visible={day === 6}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</imagelabel>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"PetName"}
					Position={UDim2.fromScale(0.17, 0.2)}
					Size={UDim2.fromScale(0.39149, 0.192151)}
					Text={"OP!"}
					TextColor3={Color3.fromRGB(109, 97, 27)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={10}
					Visible={day === 7}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(109, 97, 27)} Thickness={px(3.5)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"PetName"}
						Position={UDim2.fromScale(0.5, 0.45)}
						Size={UDim2.fromScale(1, 1)}
						Text={"OP!"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={12}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(109, 97, 27)} Thickness={px(3.5)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(255, 152, 35)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(243, 255, 162)),
								])
							}
							Rotation={-90}
						/>
					</textlabel>
				</textlabel>
				{/* Day label */}
				<textlabel
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Day"}
					Position={UDim2.fromScale(0.5, -0.069)}
					Size={UDim2.fromScale(0.578014, 0.152524)}
					Text={`Day ${day}`}
					TextColor3={Color3.fromRGB(43, 43, 43)}
					TextScaled={true}
					ZIndex={100}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 43, 43)} Thickness={px(2.8)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"Day"}
						Position={UDim2.fromScale(0.5, 0.4)}
						Size={UDim2.fromScale(1, 1)}
						Text={`Day ${day}`}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={101}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 43, 43)} Thickness={px(2.8)} />
					</textlabel>
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
					ZIndex={21}
					Visible={day !== 7}
				>
					<uistroke key={"UIStroke"} Thickness={px(3)} />
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Name"}
					Position={UDim2.fromScale(0.495733, 0.793151)}
					Size={UDim2.fromScale(0.806989, 0.145015)}
					Text={rewardType !== "Money" ? spaceWords(rewardName ?? "") : `x${reward}`}
					TextColor3={Color3.fromRGB(21, 21, 21)}
					TextScaled={true}
					ZIndex={21}
					Visible={day === 7}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(21, 21, 21)} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"Amount"}
						Position={UDim2.fromScale(0.5, 0.43)}
						Size={UDim2.fromScale(1, 1)}
						Text={rewardType !== "Money" ? spaceWords(rewardName ?? "") : `x${reward}`}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={22}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(21, 21, 21)} Thickness={px(3)} />
					</textlabel>
				</textlabel>

				{/* Background radial */}
				<imagelabel
					BackgroundTransparency={1}
					Image={"rbxassetid://127815852198424"}
					ImageTransparency={0.3}
					key={"Money Cover"}
					Position={UDim2.fromScale(0, 0)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
					Visible={day === 7}
					ZIndex={11}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

					<uigradient
						key={"UIGradient"}
						Rotation={90}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 0),
								new NumberSequenceKeypoint(0.366584, 0.4875),
								new NumberSequenceKeypoint(1, 1),
							])
						}
					/>
				</imagelabel>
				{/* Claim button - only visible on the current day if claimable */}
				<imagelabel
					Active={false}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://89920685859779"}
					key={"ClaimOrTimerButton"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Selectable={isToday && isClaimable}
					Size={UDim2.fromScale(1, 0.5)}
					SliceCenter={new Rect(0, 0, 1024, 1024)}
					Visible={isToday}
					ZIndex={500}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							isClaimable
								? new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(120, 255, 147)),
										new ColorSequenceKeypoint(0.223, Color3.fromRGB(84, 178, 102)),
										new ColorSequenceKeypoint(0.505, Color3.fromRGB(77, 163, 94)),
										new ColorSequenceKeypoint(0.732, Color3.fromRGB(77, 164, 94)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(120, 255, 147)),
								  ])
								: new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(59, 59, 59)),
										new ColorSequenceKeypoint(0.5, Color3.fromRGB(0, 0, 0)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(59, 59, 59)),
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
						Text={isClaimable ? "Claim!" : formatShortTime(timeLeft)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={px(35)}
						ZIndex={500}
					>
						<uistroke key={"UIStroke"} Thickness={px(3.2)} />

						<uigradient
							key={"UIGradient"}
							Color={
								isClaimable
									? new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(43, 255, 10)),
											new ColorSequenceKeypoint(0.349, Color3.fromRGB(43, 255, 10)),
											new ColorSequenceKeypoint(0.438, Color3.fromRGB(186, 255, 185)),
											new ColorSequenceKeypoint(0.469, Color3.fromRGB(186, 255, 185)),
											new ColorSequenceKeypoint(0.502, Color3.fromRGB(186, 255, 185)),
											new ColorSequenceKeypoint(0.645, Color3.fromRGB(43, 255, 10)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(43, 255, 10)),
									  ])
									: new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(255, 0, 0)),
											new ColorSequenceKeypoint(0.25, Color3.fromRGB(255, 69, 69)),
											new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 204, 204)),
											new ColorSequenceKeypoint(0.75, Color3.fromRGB(255, 69, 69)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(255, 0, 0)),
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

const MAX_IMAGE_ROTATION = 25;

export const DailyRewards = (props: DailyRewardsProps) => {
	const [lastClaimed, setLastClaimed] = React.useState(0);
	const [timeLeft, setTimeLeft] = React.useState(0);
	const [streak, setStreak] = React.useState(0);
	const [visible, setVisible] = React.useState(false);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [imageRotation, setImageRotation] = useMotion(-MAX_IMAGE_ROTATION);

	const menuRef = createRef<Frame>();

	const px = usePx();

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
			popInMotion.spring(UDim2.fromScale(0.5, 0.55), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	useEffect(() => {
		let currentRotation = imageRotation.getValue();
		const rotationThread = task.spawn(() => {
			while (true) {
				// Make gift image bob back and forth
				task.wait(1);
				currentRotation = currentRotation < MAX_IMAGE_ROTATION ? MAX_IMAGE_ROTATION : -MAX_IMAGE_ROTATION;
				setImageRotation.spring(currentRotation, springs.bubbly);
			}
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	// Handler for claiming rewards
	const handleClaim = () => {
		Events.claimDailyReward();
		SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("Claim") as Sound);
	};

	// Check if rewards are claimable
	const isClaimable = timeLeft <= 0;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			key={"Daily Reward Container"}
			Position={popInPos}
			Size={UDim2.fromScale(0.631, 0.704)}
			ref={menuRef}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://133515423550411"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				SliceCenter={new Rect(70, 183, 979, 449)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1)}
			>
				<frame
					key={"Frame"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					ClipsDescendants={true}
					Position={UDim2.fromScale(0.5, 0.486)}
					Size={UDim2.fromScale(0.947, 0.87)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.05, 0)} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://101723443450777"}
						key={"Bubbles"}
						Position={UDim2.fromScale(0.499779, 0.498256)}
						ScaleType={Enum.ScaleType.Slice}
						SliceCenter={new Rect(367, 222, 694, 222)}
						Size={UDim2.fromScale(1, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.0289, 0)} />
					</imagelabel>
				</frame>

				<ExitButton
					uiController={props.uiController}
					uiName={gameConstants.DAILY_REWARD_UI}
					isMenuVisible={visible}
					menuRefToClose={menuRef}
				/>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.8} />

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				key={"Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(0.998463, 0.853392)}
			>
				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.02, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					FillDirection={"Vertical"}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Wraps={true}
				/>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0, 16)} />

				{dailyRewards.map((reward, index) => {
					return (
						<DailyRewardTile
							key={`reward-${index + 1}`}
							day={index + 1}
							streak={streak}
							reward={shortenNumber(reward.rewardAmount ?? 1, false)}
							isClaimable={isClaimable}
							onClaim={handleClaim}
							timeLeft={timeLeft}
							rewardType={reward.rewardType}
							rewardName={reward.itemName}
							size={index !== 6 ? UDim2.fromScale(0.179, 0.377) : UDim2.fromScale(0.3, 0.845)}
						/>
					);
				})}
			</frame>

			<frame
				BackgroundTransparency={1}
				key={"Title"}
				Position={UDim2.fromScale(-0.0358, -0.083)}
				Size={UDim2.fromScale(0.469, 0.168)}
				ZIndex={10}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(0.9, 0.5)}
					Size={UDim2.fromScale(1.04396, 1.1697)}
					Text={`Daily Rewards ${timeLeft > 0 ? `- Come back later!` : ""}`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={false}
					TextSize={px(50)}
					TextXAlignment={"Left"}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(5.3)} />
				</textlabel>

				<imagelabel
					BackgroundTransparency={1}
					key={"Icon"}
					Position={UDim2.fromScale(0.00590958, -0.34286)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.285, 1.38)}
					ZIndex={10}
					Rotation={0 /*imageRotation.map((v) => v - 10)*/}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://82246683047981"}
						key={"Icon"}
						Position={UDim2.fromScale(0.676524, 0.493855)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1.18132, 1.18559)}
						ZIndex={10}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</imagelabel>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.85} />
			</frame>
		</frame>
	);
};
