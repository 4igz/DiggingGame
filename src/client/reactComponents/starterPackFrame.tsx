import { subscribe } from "@rbxts/charm";
import React, { useEffect, useState } from "@rbxts/react";
import { SoundService } from "@rbxts/services";
import { highestLimitedOfferPack } from "client/atoms/rewardAtoms";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { BuyButton } from "./buttons";
import { gameConstants } from "shared/gameConstants";
import { GamepassController } from "client/controllers/gamepassController";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { NATURE, NONE, RETRO } from "./packPopup";
import { getRewardImage } from "shared/util/rewardUtil";
import { limitedOffer } from "shared/config/limitedOffer";
import { spaceWords } from "shared/util/nameUtil";

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

	useEffect(() => {
		subscribe(highestLimitedOfferPack, (newValue) => {
			setOffer(newValue);
		});
	}, []);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	const rewardImage = (num: 0 | 1 | 2) => {
		return getRewardImage(limitedOffer[math.min(offer, limitedOffer.size() - 1)][num]) ?? "";
	};

	const rewardName = (num: 0 | 1 | 2) => {
		return spaceWords(limitedOffer[math.min(offer, limitedOffer.size() - 1)][num].itemName!);
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

					<uistroke key={"UIStroke"} Thickness={11} />
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(142, 109, 57)}
					key={"DropShadow"}
					Position={UDim2.fromScale(-4.05927e-8, 0)}
					Size={UDim2.fromScale(1, 1.03)}
					ZIndex={0}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

					<uistroke key={"UIStroke"} Color={Color3.fromRGB(142, 109, 57)} Thickness={5} />
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
						Thickness={4.5}
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
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3} />
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

				<frame
					BackgroundColor3={new Color3(1, 1, 1)}
					LayoutOrder={1}
					key={"Item"}
					Position={UDim2.fromScale(0.120244, -8.75313e-8)}
					Size={UDim2.fromScale(0.167837, 0.366181)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.07, 0)} />

					<uistroke key={"UIStroke"} Thickness={4} />

					<imagelabel
						Size={UDim2.fromScale(1, 1)}
						Image={rewardImage(0)}
						BackgroundTransparency={1}
						ScaleType={Enum.ScaleType.Fit}
						key={"RewardImage"}
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
							Thickness={4}
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
						Size={UDim2.fromScale(0.990199, 0.192045)}
						Text={rewardName(0)}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3.5} />
					</textlabel>
				</frame>

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
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3.5} />
				</textlabel>

				<frame
					BackgroundColor3={new Color3(1, 1, 1)}
					LayoutOrder={3}
					key={"Item"}
					Position={UDim2.fromScale(0.416081, -8.75313e-8)}
					Size={UDim2.fromScale(0.167837, 0.366181)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

					<uistroke key={"UIStroke"} Thickness={4} />

					<imagelabel
						Size={UDim2.fromScale(1, 1)}
						Image={rewardImage(1)}
						BackgroundTransparency={1}
						ScaleType={Enum.ScaleType.Fit}
						key={"RewardImage"}
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
							Thickness={4}
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
								new ColorSequenceKeypoint(0, Color3.fromRGB(162, 98, 32)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(253, 223, 1)),
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
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3.5} />
					</textlabel>
				</frame>

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
					<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3.5} />
				</textlabel>

				<frame
					BackgroundColor3={new Color3(1, 1, 1)}
					LayoutOrder={5}
					key={"Item"}
					Position={UDim2.fromScale(0.711919, -8.75313e-8)}
					Size={UDim2.fromScale(0.167837, 0.366181)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

					<uistroke key={"UIStroke"} Thickness={4} />

					<imagelabel
						Size={UDim2.fromScale(1, 1)}
						Image={rewardImage(2)}
						BackgroundTransparency={1}
						ScaleType={Enum.ScaleType.Fit}
						key={"RewardImage"}
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
							Thickness={4}
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
								new ColorSequenceKeypoint(0, Color3.fromRGB(162, 98, 32)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(253, 223, 1)),
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
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={3.5} />
					</textlabel>
				</frame>
			</frame>

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.PACK_FRAME_UI}
				isMenuVisible={visible}
				size={UDim2.fromScale(0.2, 0.25)}
			/>

			<BuyButton
				position={UDim2.fromScale(0.5, 0.8)}
				size={UDim2.fromScale(0.334, 0.15)}
				gamepassController={props.gamepassController}
				productType={Enum.InfoType.Product}
				id={gameConstants.DEVPRODUCT_IDS["StarterPack"]}
				active={true}
				anchorPoint={new Vector2(0.5, 0.5)}
				discountedPrice={gameConstants.STARTER_PACK_DISCOUNTED_PRICE}
				isDiscounted={true}
			>
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
			</BuyButton>
		</frame>
	);
};
