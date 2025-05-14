//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { PlaytimeReward, timePlayedRewards } from "shared/config/timePlayedConfig";
import { interval } from "shared/util/interval";
import { formatShortTime, shortenNumber } from "shared/util/nameUtil";
import { Events, Functions } from "client/network";
import { AnimatedProductButton } from "./gamepassShop";
import { getDeveloperProductInfo } from "shared/util/monetizationUtil";
import Object from "@rbxts/object-utils";
import { ItemType, RewardType } from "shared/networkTypes";
import { hasGiftAtom } from "client/atoms/rewardAtoms";
import { Signals } from "shared/signals";
import { SoundService } from "@rbxts/services";
import { AnimatedButton } from "./buttons";
import { usePx } from "client/hooks/usePx";

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
	alreadyClaimed: boolean;
	shouldResetClaims: boolean;
	serverClaimed: boolean | undefined;
	requiredTime: number;
	rewardType: RewardType | ItemType;
	rewardName: string | undefined;
	onClaimed: (index: number) => void;
	pxProvider: (value: number) => number;
}) => {
	const [timeLeft, setTimeLeft] = useState(props.requiredTime - time());
	const [serverAllowedToClaim, setServerAllowedToClaim] = useState(false);
	const [claimed, setClaimed] = useState(props.alreadyClaimed);

	const px = props.pxProvider;

	const [rewardImage] = useState(
		REWARD_IMAGES[props.rewardType] ??
			gameConstants.SHOP_CONFIGS[props.rewardType as ItemType][props.rewardName!]?.itemImage ??
			undefined,
	);

	useEffect(() => {
		if (!rewardImage) {
			warn(`No image found for reward type ${props.rewardType} ${props.rewardName}`);
		}
	}, [rewardImage]);

	useEffect(() => {
		if (props.shouldResetClaims) {
			setClaimed(false);
			setTimeLeft(props.requiredTime - time());
		}
	}, [props.shouldResetClaims]);

	useEffect(() => {
		const thread = task.spawn(() => {
			if (serverAllowedToClaim) return;
			while (time() < props.requiredTime) {
				if (SEC_INTERVAL(props.order)) {
					setTimeLeft(props.requiredTime - time());
				}
				task.wait(1);
			}
			if (time() >= props.requiredTime && !claimed) {
				setTimeLeft(0);
			}
		});

		if (!hasGiftAtom()) {
			hasGiftAtom(!claimed && (serverAllowedToClaim || time() >= props.requiredTime));
		}

		return () => {
			task.cancel(thread);
		};
	}, [timeLeft, serverAllowedToClaim]);

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
			key={props.order}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={UDim2.fromScale(0.224, 0.306)}
			ZIndex={10}
		>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				clickable={!claimed}
				errorText={"Already claimed!"}
				onClick={() => {
					if (serverAllowedToClaim || time() >= props.requiredTime) {
						setClaimed(true);
						if (serverAllowedToClaim) {
							setServerAllowedToClaim(false);
						}

						Functions.claimPlaytimeReward(props.order)
							.then((result) => {
								// The hope is that this never happens, but just incase for some reason they get out of sync and the server rejects, then it will reset the claimed state
								if (!result) {
									warn("Failed to claim reward, resetting claimed state.");
									setClaimed(false);
									Signals.invalidAction.Fire("Can't claim this right now!");
									return;
								}

								props.onClaimed(props.order);
							})
							.catch(warn);
					} else {
						Signals.invalidAction.Fire("Can't claim this yet!");
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
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={px(3)} />

					<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.19, 0)} PaddingRight={new UDim(0.19, 0)} />

					<uigradient
						key={"UIGradient"}
						Enabled={!claimed && timeLeft <= 0}
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
						Visible={props.cfg.rewardAmount !== undefined}
					>
						<uistroke key={"UIStroke"} Thickness={px(2)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							key={"mm"}
							Position={UDim2.fromScale(0.5, 0.46)}
							Size={UDim2.fromScale(1, 1)}
							Text={`x${shortenNumber(props.cfg.rewardAmount ?? 1, false)}`}
							TextColor3={Color3.fromRGB(253, 253, 253)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Thickness={px(2)} />
						</textlabel>
					</textlabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={rewardImage}
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

const MAX_IMAGE_ROTATION = 25;

export const PlaytimeRewardsUi = (props: PlaytimeRewardsProps) => {
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [visible, setVisible] = useState(false);
	const [claimedAll, setClaimedAll] = useState(false);
	const [allowClaimAll, setAllowClaimAll] = useState(false);
	const [playTimeRewardsDPInfo, setPlayTimeRewardsDPInfo] = useState<DeveloperProductInfo>();
	const [startTime, setStartTime] = useState(time());
	const [claimed, setClaimed] = useState(new Map<number, boolean>());
	const [imageRotation, setImageRotation] = useMotion(-MAX_IMAGE_ROTATION);

	const px = usePx();

	const menuRef = createRef<Frame>();

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.45), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
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

	useEffect(() => {
		let currentRotation = imageRotation.getValue();
		const rotationThread = task.spawn(() => {
			while (false) {
				// Make gift image bob back and forth
				task.wait(0.6);
				currentRotation = currentRotation < MAX_IMAGE_ROTATION ? MAX_IMAGE_ROTATION : -MAX_IMAGE_ROTATION;
				setImageRotation.spring(currentRotation, springs.bubbly);
			}
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Playtime Reward Frame"}
			Position={popInPos}
			Size={UDim2.fromScale(0.604, 0.791)}
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
				// menuRefToClose={menuRef}
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
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(0.3, 0.5)}
					Size={UDim2.fromScale(0.552, 0.654)}
					Text={"Free Gifts!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(5.3)} />
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
					Rotation={imageRotation}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

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
							serverClaimed={allowClaimAll}
							alreadyClaimed={claimed.get(i) ?? false}
							shouldResetClaims={claimed.size() >= timePlayedRewards.size()}
							rewardType={cfg.rewardType}
							rewardName={cfg.itemName}
							pxProvider={px}
							onClaimed={(index) => {
								hasGiftAtom(false);
								setClaimed((prevClaimed) => {
									const newClaimed = new Map(Object.entries(prevClaimed));
									newClaimed.set(index, true);

									// Check if all rewards are claimed after the state update
									if (newClaimed.size() >= timePlayedRewards.size()) {
										let allClaimed = true;
										for (const [, value] of newClaimed) {
											if (!value) {
												allClaimed = false;
												break;
											}
										}
										if (allClaimed) {
											setClaimedAll(true);
										}
									}

									return newClaimed;
								});
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
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Label"}
					Position={UDim2.fromScale(0.0229885, 0.0224008)}
					Size={UDim2.fromScale(0.954023, 0.330954)}
					Text={"Skip All!"}
					TextColor3={new Color3()}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(100, 75, 39)} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"Label"}
						Position={UDim2.fromScale(0.5, 0.4)}
						Size={UDim2.fromScale(1, 1)}
						Text={"Skip All!"}
						TextColor3={Color3.fromRGB(253, 253, 253)}
						TextScaled={true}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(100, 75, 39)} Thickness={px(3)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(223, 255, 79)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(255, 158, 129)),
								])
							}
							Rotation={90}
						/>
					</textlabel>
				</textlabel>

				<AnimatedProductButton
					productId={gameConstants.DEVPRODUCT_IDS["Unlock All Playtime Rewards"]}
					productType={Enum.InfoType.Product}
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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 66, 34)} Thickness={px(3)} />

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
				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.94} />
			</frame>

			<frame
				BackgroundTransparency={1}
				key={"Disclaimer"}
				Position={UDim2.fromScale(0.045, 0.78)}
				Size={UDim2.fromScale(0.56, 0.197)}
			>
				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Label"}
					Position={UDim2.fromScale(-0.0194564, 0.447359)}
					Size={UDim2.fromScale(1.03891, 0.526756)}
					Text={"Leaving Resets Progress!"}
					TextColor3={Color3.fromRGB(253, 83, 86)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={1}
						key={"Label"}
						Position={UDim2.fromScale(0.5, 0.46)}
						Size={UDim2.fromScale(1, 1)}
						Text={"Leaving Resets Progress!"}
						TextColor3={Color3.fromRGB(253, 83, 86)}
						TextScaled={true}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />
					</textlabel>
				</textlabel>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.94} />
			</frame>
		</frame>
	);
};
