import { subscribe } from "@rbxts/charm";
import React, { useEffect, useState } from "@rbxts/react";
import { MarketplaceService, Players, SoundService } from "@rbxts/services";
import { highestLimitedOfferPack } from "client/atoms/rewardAtoms";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { GamepassController } from "client/controllers/gamepassController";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { NATURE, NONE, RETRO } from "./packPopup";
import { getRewardImage, getRewardStats } from "shared/util/rewardUtil";
import { limitedOffer } from "shared/config/limitedOffer";
import { formatItemName, separateWithCommas, shortenNumber, spaceWords } from "shared/util/nameUtil";
import { getDeveloperProductInfo } from "shared/util/monetizationUtil";
import { AnimatedButton } from "./buttons";
import { usePx } from "client/hooks/usePx";
import { Reward } from "shared/networkTypes";
import { TooltipStats } from "./tooltips";

const BuyButton = () => {
	const packPrice = getDeveloperProductInfo(
		gameConstants.DEVPRODUCT_IDS["StarterPack"],
		Enum.InfoType.Product,
	).expect()?.PriceInRobux;

	const px = usePx();

	return (
		<AnimatedButton
			position={UDim2.fromScale(0.5, 0.8)}
			size={UDim2.fromScale(0.334, 0.15)}
			zindex={4}
			backgroundTransparency={0}
			onClick={() => {
				if (highestLimitedOfferPack() < RETRO) {
					MarketplaceService.PromptProductPurchase(
						Players.LocalPlayer,
						gameConstants.DEVPRODUCT_IDS["StarterPack"],
					);
				}
			}}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.24, 0)} />

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(53, 205, 64)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(73, 243, 120)),
					])
				}
				Rotation={-90}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(208, 37, 255)}
				key={"Discount"}
				Position={UDim2.fromScale(0.259073, -0.285)}
				Size={UDim2.fromScale(0.49132, 0.523003)}
				ZIndex={5}
			>
				<uigradient
					key={"UIGradient"}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 1),
							new NumberSequenceKeypoint(0.397756, 0.24375),
							new NumberSequenceKeypoint(0.498753, 0.24375),
							new NumberSequenceKeypoint(0.599751, 0.25625),
							new NumberSequenceKeypoint(1, 1),
						])
					}
				/>

				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(-0.00166464, 0.155)}
					Size={UDim2.fromScale(0.990199, 0.75)}
					Text={`${math.round(
						((gameConstants.STARTER_PACK_DISCOUNTED_PRICE - packPrice!) /
							gameConstants.STARTER_PACK_DISCOUNTED_PRICE) *
							100,
					)}% OFF`}
					TextColor3={new Color3(1, 1, 1)}
					// TextScaled={true}
					TextSize={px(20)}
					ZIndex={5}
				>
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={2} />

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(197, 29, 203)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(253, 161, 248)),
							])
						}
						Rotation={-90}
					/>
				</textlabel>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 0, 0)}
				key={"CrossOut"}
				Position={UDim2.fromScale(0.6, 1.06596)}
				Rotation={-16}
				Size={UDim2.fromScale(0.386633, 0.0607558)}
				ZIndex={5}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(0, 94, 43)}
				key={"DropShadow"}
				Size={UDim2.fromScale(1, 1.12)}
				ZIndex={3}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.2, 0)} />

				<uistroke key={"UIStroke"} Color={Color3.fromRGB(27, 27, 27)} Thickness={4} />
			</frame>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://128980446510485"}
				key={"Icon"}
				Position={UDim2.fromScale(0.323415, 0.51)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.144519, 1.74736)}
				ZIndex={4}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://128980446510485"}
				key={"OldIcon"}
				Position={UDim2.fromScale(0.661606, 1.097)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.0710421, 1.0127)}
				ZIndex={4}
			/>

			<textlabel
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundTransparency={1}
				FontFace={
					new Font(
						"rbxasset://fonts/families/GothamSSm.json",
						Enum.FontWeight.ExtraBold,
						Enum.FontStyle.Normal,
					)
				}
				key={"Amount"}
				Position={UDim2.fromScale(0.287475, 0.51)}
				Size={UDim2.fromScale(0.582348, 0.64174)}
				Text={separateWithCommas(tostring(packPrice))}
				TextColor3={new Color3(1, 1, 1)}
				// TextScaled={true}
				TextSize={px(40)}
				TextStrokeColor3={Color3.fromRGB(106, 106, 106)}
				ZIndex={4}
			/>

			<textlabel
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundTransparency={1}
				FontFace={
					new Font(
						"rbxasset://fonts/families/GothamSSm.json",
						Enum.FontWeight.ExtraBold,
						Enum.FontStyle.Normal,
					)
				}
				key={"OldAmount"}
				Position={UDim2.fromScale(0.661586, 1.09565)}
				Size={UDim2.fromScale(0.338414, 0.371925)}
				Text={separateWithCommas(gameConstants.STARTER_PACK_DISCOUNTED_PRICE)}
				TextColor3={new Color3(1, 1, 1)}
				// TextScaled={true}
				TextSize={px(20)}
				TextStrokeColor3={Color3.fromRGB(106, 106, 106)}
				ZIndex={4}
			/>
		</AnimatedButton>
	);
};

interface StatsFrameProps {
	reward: Reward;
	visible: boolean;
	position?: UDim2;
	xAlignment?: Enum.HorizontalAlignment;
}

export const StatsFrame = (props: StatsFrameProps) => {
	const px = usePx();

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Stats"}
			Visible={props.visible}
			Position={props.position ?? UDim2.fromScale(0.025, 0.2)}
			Size={UDim2.fromScale(0.446, 0.353)}
			ZIndex={500000}
		>
			<uilistlayout key={"UIListLayout"} Padding={new UDim(0.05, 0.2)} SortOrder={Enum.SortOrder.LayoutOrder} />

			{getRewardStats(props.reward).map((stat) => {
				return (
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={stat.key}
						Size={UDim2.fromScale(0.902, 0.4)}
						ZIndex={10}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0.05, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
							HorizontalAlignment={props.xAlignment ?? Enum.HorizontalAlignment.Left}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Icon"}
							Position={UDim2.fromScale(0.287, 0.0263)}
							ScaleType={Enum.ScaleType.Fit}
							ZIndex={500}
							Size={UDim2.fromScale(0.3, 0.947)}
						>
							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={stat.icon ?? "rbxassetid://85733831609212"}
								key={"Icon"}
								Position={UDim2.fromScale(-0.115, -0.0498)}
								ScaleType={Enum.ScaleType.Fit}
								ZIndex={500}
								Size={UDim2.fromScale(1.17, 1.05)}
							/>
						</imagelabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Amount"}
							Position={UDim2.fromScale(0.808, 0.382)}
							Size={UDim2.fromScale(1.02, 0.763)}
							Text={`x${shortenNumber(tonumber(stat.value) ?? 0)}`}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							// TextScaled={true}
							// TextWrapped={true}
							TextSize={px(25)}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={500}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.0198, 0)}
								PaddingTop={new UDim(0.0198, 0)}
							/>
						</textlabel>
					</frame>
				);
			})}
		</frame>
	);
};

interface StarterPackFrameProps {
	visible: boolean;
	gamepassController: GamepassController;
	uiController: UiController;
}

// Describe the next pack
const PACK_NAME = {
	[RETRO]: "",
	[NATURE]: "Limited Retro Pack!",
	[NONE]: "Limited Nature Pack!",
};

const PACK_DESCRIPTION = {
	[RETRO]: "",
	[NATURE]: "Buy the OP Retro pack! The ultimate pack in the game!",
	[NONE]: "Buy the Nature pack! The ultimate starter pack!",
};

export const StarterPackFrame = (props: StarterPackFrameProps) => {
	const [offer, setOffer] = useState(highestLimitedOfferPack());
	const [visible, setVisible] = useState(false);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [hoverState, setHoverState] = useState(0);

	const px = usePx();

	useEffect(() => {
		subscribe(highestLimitedOfferPack, (newValue) => {
			setOffer(newValue);
		});
	}, []);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	const getReward = (num: 0 | 1 | 2): Reward => {
		return limitedOffer[math.min(offer, limitedOffer.size() - 1)][num];
	};

	const rewardImage = (num: 0 | 1 | 2) => {
		return getRewardImage(getReward(num)) ?? "";
	};

	const rewardName = (num: 0 | 1 | 2) => {
		const item = getReward(num);
		return formatItemName(item.rewardType, item.itemName!);
	};

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.5), springs.responsive);
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("OpenShop") as Sound);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(217, 181, 127)}
			key={"PackFrame"}
			Position={popInPos}
			Size={UDim2.fromScale(0.508275, 0.512814)}
			Visible={visible}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(175, 137, 80)} Thickness={5} />

			<frame BackgroundTransparency={1} key={"Background"} Size={UDim2.fromScale(1, 1)}>
				<frame
					BackgroundColor3={Color3.fromRGB(142, 109, 57)}
					key={"Outline"}
					Position={UDim2.fromScale(-4.05927e-8, 0)}
					Size={UDim2.fromScale(1, 1.03)}
					ZIndex={-1}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

					<uistroke key={"UIStroke"} Thickness={px(11)} />
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(142, 109, 57)}
					key={"DropShadow"}
					Position={UDim2.fromScale(-4.05927e-8, 0)}
					Size={UDim2.fromScale(1, 1.03)}
					ZIndex={0}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

					<uistroke key={"UIStroke"} Color={Color3.fromRGB(142, 109, 57)} Thickness={px(5)} />
				</frame>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(-0.0402282, -0.105609)}
					Size={UDim2.fromScale(0.815845, 0.192045)}
					Text={PACK_NAME[offer]}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke
						key={"UIStroke"}
						Color={Color3.fromRGB(65, 49, 24)}
						LineJoinMode={Enum.LineJoinMode.Miter}
						Thickness={px(4.5)}
					/>

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(255, 160, 64)),
								new ColorSequenceKeypoint(0.515571, Color3.fromRGB(255, 211, 110)),
								new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
							])
						}
						Rotation={-90}
					/>
				</textlabel>

				<imagelabel
					BackgroundTransparency={1}
					Image={"http://www.roblox.com/asset/?id=124516698954739"}
					ImageColor3={Color3.fromRGB(255, 145, 49)}
					ImageTransparency={0.4}
					key={"Glow"}
					Position={UDim2.fromScale(0.048435, -0.0363722)}
					Size={UDim2.fromScale(0.899178, 1)}
				/>

				<frame BackgroundTransparency={1} ClipsDescendants={true} key={"Fx"} Size={UDim2.fromScale(1, 1)}>
					<imagelabel
						key={"ImageLabel"}
						BackgroundTransparency={1}
						ClipsDescendants={true}
						Image={"rbxassetid://100500395047552"}
						ImageTransparency={0.935}
						Position={UDim2.fromScale(-0.148426, -0.29708)}
						ScaleType={Enum.ScaleType.Crop}
						Size={UDim2.fromScale(1.27561, 1.67536)}
					/>
				</frame>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Description"}
					Position={UDim2.fromScale(0.0764899, 0.519876)}
					Size={UDim2.fromScale(0.845214, 0.178954)}
					Text={PACK_DESCRIPTION[offer]}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3)} />
				</textlabel>
			</frame>

			<frame
				BackgroundTransparency={1}
				key={"Grid"}
				Position={UDim2.fromScale(0, 0.134332)}
				Size={UDim2.fromScale(1, 0.865668)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(-0.02, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					Wraps={true}
				/>

				<AnimatedButton
					layoutOrder={1}
					key={"Item1"}
					position={UDim2.fromScale(0.120244, -8.75313e-8)}
					size={UDim2.fromScale(0.167837, 0.366181)}
					onHover={() => {
						setHoverState(1);
					}}
					onLeave={() => {
						setHoverState(0);
					}}
					clickable={false}
				>
					<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={new Color3(1, 1, 1)}>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.07, 0)} />

						<uistroke key={"UIStroke"} Thickness={px(4)} />

						{/* <StatsFrame reward={getReward(0)} visible={hoverState === 1} /> */}

						<TooltipStats reward={getReward(0)} visible={hoverState === 1} />

						<imagelabel
							Size={UDim2.fromScale(1, 1)}
							Image={rewardImage(0)}
							BackgroundTransparency={1}
							ScaleType={Enum.ScaleType.Fit}
							key={"RewardImage"}
							ZIndex={2}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Position={UDim2.fromScale(0.5, 0.5)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://104992023858077"}
							key={"Radial"}
							Size={UDim2.fromScale(1, 1)}
							ZIndex={1}
						/>

						<textlabel
							key={"TextLabel"}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187373592", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							Position={UDim2.fromScale(-0.328813, -0.198093)}
							Size={UDim2.fromScale(0.900974, 0.450216)}
							Text={"OP!"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(65, 49, 24)}
								LineJoinMode={Enum.LineJoinMode.Miter}
								Thickness={px(4)}
							/>

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(255, 160, 64)),
										new ColorSequenceKeypoint(0.515571, Color3.fromRGB(255, 211, 110)),
										new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
									])
								}
								Rotation={-90}
							/>
						</textlabel>

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(96, 14, 98)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(204, 55, 253)),
								])
							}
							Rotation={-90}
						/>

						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Reward"}
							Position={UDim2.fromScale(0.00732248, 0.889156)}
							Size={UDim2.fromScale(1, 0.15)}
							Text={rewardName(0)}
							TextColor3={new Color3(1, 1, 1)}
							TextSize={px(30)}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3.5)} />
						</textlabel>
					</frame>
				</AnimatedButton>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187373592", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
					LayoutOrder={2}
					key={"Plus"}
					Position={UDim2.fromScale(0.268081, 8.75313e-8)}
					Size={UDim2.fromScale(0.168, 0.366496)}
					Text={"+"}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3.5)} />
				</textlabel>

				<AnimatedButton
					layoutOrder={3}
					key={"Item2"}
					position={UDim2.fromScale(0.416081, -8.75313e-8)}
					size={UDim2.fromScale(0.167837, 0.366181)}
					onHover={() => {
						setHoverState(2);
					}}
					onLeave={() => {
						setHoverState(0);
					}}
					clickable={false}
				>
					<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={new Color3(1, 1, 1)}>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

						<uistroke key={"UIStroke"} Thickness={px(4)} />

						{/* <StatsFrame reward={getReward(1)} visible={hoverState === 2} /> */}

						<TooltipStats reward={getReward(1)} visible={hoverState === 2} />

						<imagelabel
							Size={UDim2.fromScale(1, 1)}
							Image={rewardImage(1)}
							BackgroundTransparency={1}
							ScaleType={Enum.ScaleType.Fit}
							key={"RewardImage"}
							ZIndex={2}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Position={UDim2.fromScale(0.5, 0.5)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://104992023858077"}
							key={"Radial"}
							Size={UDim2.fromScale(1, 1)}
							ZIndex={1}
						/>

						<textlabel
							key={"TextLabel"}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187373592", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							Position={UDim2.fromScale(-0.328813, -0.198093)}
							Size={UDim2.fromScale(0.900974, 0.450216)}
							Text={"OP!"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(65, 49, 24)}
								LineJoinMode={Enum.LineJoinMode.Miter}
								Thickness={px(4)}
							/>

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(255, 160, 64)),
										new ColorSequenceKeypoint(0.515571, Color3.fromRGB(255, 211, 110)),
										new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
									])
								}
								Rotation={-90}
							/>
						</textlabel>

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(207, 181, 0)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(255, 227, 71)),
								])
							}
							Rotation={-90}
						/>

						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Reward"}
							Position={UDim2.fromScale(0.00732248, 0.889156)}
							Size={UDim2.fromScale(0.990199, 0.192045)}
							Text={rewardName(1)}
							TextColor3={new Color3(1, 1, 1)}
							TextSize={px(30)}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3.5)} />
						</textlabel>
					</frame>
				</AnimatedButton>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187373592", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
					LayoutOrder={4}
					key={"Plus"}
					Position={UDim2.fromScale(0.563919, 8.75313e-8)}
					Size={UDim2.fromScale(0.168, 0.366496)}
					Text={"+"}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3.5)} />
				</textlabel>

				<AnimatedButton
					layoutOrder={5}
					key={"Item3"}
					position={UDim2.fromScale(0.711919, -8.75313e-8)}
					size={UDim2.fromScale(0.167837, 0.366181)}
				>
					<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={new Color3(1, 1, 1)}>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

						<uistroke key={"UIStroke"} Thickness={px(4)} />

						<imagelabel
							Size={UDim2.fromScale(1, 1)}
							Image={rewardImage(2)}
							BackgroundTransparency={1}
							ScaleType={Enum.ScaleType.Fit}
							key={"RewardImage"}
							ZIndex={2}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Position={UDim2.fromScale(0.5, 0.5)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://104992023858077"}
							key={"Radial"}
							Size={UDim2.fromScale(1, 1)}
							ZIndex={1}
						/>

						<textlabel
							key={"TextLabel"}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187373592", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							Position={UDim2.fromScale(-0.328813, -0.198093)}
							Size={UDim2.fromScale(0.900974, 0.450216)}
							Text={"OP!"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(65, 49, 24)}
								LineJoinMode={Enum.LineJoinMode.Miter}
								Thickness={px(4)}
							/>

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(255, 160, 64)),
										new ColorSequenceKeypoint(0.515571, Color3.fromRGB(255, 211, 110)),
										new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
									])
								}
								Rotation={-90}
							/>
						</textlabel>

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(207, 181, 0)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(255, 227, 71)),
								])
							}
							Rotation={-90}
						/>

						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Reward"}
							Position={UDim2.fromScale(0.00732248, 0.889156)}
							Size={UDim2.fromScale(0.990199, 0.192045)}
							Text={rewardName(2)}
							TextColor3={new Color3(1, 1, 1)}
							TextSize={px(30)}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(3.5)} />
						</textlabel>
					</frame>
				</AnimatedButton>
			</frame>

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.PACK_FRAME_UI}
				isMenuVisible={visible}
				size={UDim2.fromScale(0.2, 0.25)}
			/>

			<BuyButton />
		</frame>
	);
};
