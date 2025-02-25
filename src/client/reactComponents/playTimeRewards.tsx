//!optimize 2
//!native
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { AnimatedButton, ExitButton } from "./inventory";
import { UiController } from "client/controllers/uiController";
import { gameConstants, REWARD_IMAGES } from "shared/constants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { PlaytimeReward, timePlayedRewards } from "shared/config/timePlayedConfig";
import { interval } from "shared/util/interval";
import { formatShortTime, shortenNumber } from "shared/util/nameUtil";
import { Events, Functions } from "client/network";
import { AnimatedProductButton } from "./gamepassShop";
import { ProductType } from "shared/config/shopConfig";
import { getDeveloperProductInfo } from "shared/util/monetizationUtil";

const SEC_INTERVAL = interval(1);

const enabledGradient = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
	new ColorSequenceKeypoint(0.479, Color3.fromRGB(123, 255, 207)),
	new ColorSequenceKeypoint(1, Color3.fromRGB(74, 255, 101)),
]);

const disabledGradient = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
	new ColorSequenceKeypoint(0.479, Color3.fromRGB(123, 202, 255)),
	new ColorSequenceKeypoint(1, Color3.fromRGB(52, 106, 255)),
]);

const RewardSlot = (props: {
	order: number;
	cfg: PlaytimeReward;
	timerRunning: boolean;
	serverClaimed: boolean | undefined;
	requiredTime: number;
	onClaimed: (index: number) => void;
}) => {
	const [timeLeft, setTimeLeft] = useState(props.requiredTime - time());
	const [serverAllowedToClaim, setServerAllowedToClaim] = useState(false);
	const [claimed, setClaimed] = useState(false);

	useEffect(() => {
		const thread = task.spawn(() => {
			if (!props.timerRunning) return;
			if (claimed) {
				setClaimed(false);
			}
			while (time() < props.requiredTime && props.timerRunning) {
				task.wait();
				if (SEC_INTERVAL(props.order)) {
					setTimeLeft(props.requiredTime - time());
				}
			}
			if (time() >= props.requiredTime && !claimed) {
				setTimeLeft(0);
			}
		});

		return () => {
			task.cancel(thread);
		};
	}, [timeLeft, props.timerRunning]);

	useEffect(() => {
		if (props.serverClaimed) {
			setServerAllowedToClaim(true);
			setTimeLeft(0);
		}
	}, [props.serverClaimed]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			key={"1"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={UDim2.fromScale(0.224, 0.306)}
			ZIndex={10}
		>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				onClick={() => {
					if (!claimed && (serverAllowedToClaim || time() >= props.requiredTime)) {
						setClaimed(true);
						if (serverAllowedToClaim) {
							setServerAllowedToClaim(false);
						}

						Functions.claimPlaytimeReward(props.order).then((result) => {
							// The hope is that this never happens, but just incase for some reason they get out of sync and the server rejects, then it will reset the claimed state
							if (!result) {
								warn("Failed to claim reward, resetting claimed state.");
								setClaimed(false);
								return;
							}

							props.onClaimed(props.order);

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
					Image={"rbxassetid://115335272426529"}
					key={".$Background"}
					Position={UDim2.fromScale(0.526, 0.513)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1.05, 1.03)}
					SliceCenter={new Rect(100, 259, 901, 259)}
				>
					<uigradient key={"UIGradient"} Color={claimed ? enabledGradient : disabledGradient} Rotation={90} />
				</imagelabel>

				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={".$Timer"}
					Position={UDim2.fromScale(0.046, 0.596)}
					Size={UDim2.fromScale(0.954, 0.294)}
					Text={`${!claimed ? (timeLeft > 0 ? formatShortTime(timeLeft) : "CLAIM") : "CLAIMED"}`}
					TextColor3={Color3.fromRGB(205, 255, 148)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.19, 0)} PaddingRight={new UDim(0.19, 0)} />
				</textlabel>

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://114978900536475"}
					key={"Check"}
					Position={UDim2.fromScale(0.498, 0.35)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.662, 0.645)}
					SliceCenter={new Rect(100, 259, 901, 259)}
					ZIndex={99}
					Visible={claimed}
				/>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Prize"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Visible={props.cfg.rewardAmount !== undefined}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
						key={"mm"}
						Position={UDim2.fromScale(0.568, 0.371)}
						Size={UDim2.fromScale(0.241, 0.227)}
						Text={`x${shortenNumber(props.cfg.rewardAmount ?? 0, false)}`}
						TextColor3={Color3.fromRGB(253, 253, 253)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Thickness={2} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							key={"mm"}
							Position={UDim2.fromScale(0.5, 0.43)}
							Size={UDim2.fromScale(1, 1)}
							Text={`x${shortenNumber(props.cfg.rewardAmount ?? 0, false)}`}
							TextColor3={Color3.fromRGB(253, 253, 253)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Thickness={2} />
						</textlabel>
					</textlabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={REWARD_IMAGES[props.cfg.rewardType]}
						key={"Icon"}
						Position={UDim2.fromScale(0.298, 0.0603)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.426, 0.613)}
					/>
				</frame>
			</AnimatedButton>
		</frame>
	);
};

interface PlaytimeRewardsProps {
	visible: boolean;
	uiController: UiController;
}

export const PlaytimeRewardsUi = (props: PlaytimeRewardsProps) => {
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const [visible, setVisible] = useState(false);
	const [claimedAll, setClaimedAll] = useState(false);
	const [allowClaimAll, setAllowClaimAll] = useState(false);
	const [playTimeRewardsDPInfo, setPlayTimeRewardsDPInfo] = useState<DeveloperProductInfo>();
	const [startTime, setStartTime] = useState(time());
	const [claimed, setClaimed] = useState(new Map<number, boolean>());
	const menuRef = createRef<Frame>();

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.604, 0.791), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
		}

		getDeveloperProductInfo(
			gameConstants.DEVPRODUCT_IDS["Unlock All Playtime Rewards"],
			Enum.InfoType.Product,
		).then((info) => {
			if (info !== undefined) {
				setPlayTimeRewardsDPInfo(info as DeveloperProductInfo);
			}
		});
	}, [visible]);

	useEffect(() => {
		Events.boughtPlaytimeRewardSkip.connect(() => {
			setAllowClaimAll(true);
		});
	}, []);

	useEffect(() => {
		if (claimedAll) {
			setClaimed(new Map());
			setStartTime(time());
			setAllowClaimAll(false);
			setClaimedAll(false);
		}
	}, [claimedAll]);

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
				isMenuVisible={visible}
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
					return (
						<RewardSlot
							requiredTime={cfg.unlockTime + startTime}
							cfg={cfg}
							order={i}
							timerRunning={!allowClaimAll && visible}
							serverClaimed={allowClaimAll}
							onClaimed={(index) => {
								const newClaimed = claimed.set(index, true);
								setClaimed(newClaimed);

								if (claimed.size() >= timePlayedRewards.size()) {
									let allClaimed = true;

									// Ensure all rewards are claimed
									for (const [_, value] of claimed) {
										if (!value) {
											allClaimed = false;
											break;
										}
									}

									if (allClaimed) {
										setClaimedAll(true);
									}
								}
							}}
						/>
					);
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

				<AnimatedProductButton
					productId={gameConstants.DEVPRODUCT_IDS["Unlock All Playtime Rewards"]}
					productType={ProductType.DevProduct}
					predicate={() => !allowClaimAll}
					position={UDim2.fromScale(0.157, 0.458)}
					size={UDim2.fromScale(0.862, 0.565)}
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
								Text={allowClaimAll ? "Claimed" : tostring(playTimeRewardsDPInfo?.PriceInRobux)}
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
				</AnimatedProductButton>

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
