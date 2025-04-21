import React, { useEffect, useState } from "@rbxts/react";
import { AnimatedProductButton } from "./gamepassShop";
import { highestLimitedOfferPack } from "client/atoms/rewardAtoms";
import { gameConstants } from "shared/gameConstants";
import { usePx } from "client/hooks/usePx";
import { subscribe } from "@rbxts/charm";
import { useMotion } from "client/hooks/useMotion";
import { Signals } from "shared/signals";
import { springs } from "client/utils/springs";

const RETRO = 2;
const NATURE = 1;
const NONE = 0;

const DEFAULT_POS = new UDim2(1, -5, 0, 15);
const CLOSED_POS = UDim2.fromScale(1.2, 0);

export const PackPopup = () => {
	const [offer, setOffer] = useState(highestLimitedOfferPack());
	const px = usePx();
	const [menuPos, menuPosMotion] = useMotion(DEFAULT_POS);

	useEffect(() => {
		subscribe(highestLimitedOfferPack, (newValue) => {
			setOffer(newValue);
		});

		Signals.menuOpened.Connect((isOpen) => {
			menuPosMotion.spring(isOpen ? CLOSED_POS : DEFAULT_POS, springs.default);
		});
	}, []);

	return (
		<AnimatedProductButton
			key={"Pack"}
			productId={gameConstants.DEVPRODUCT_IDS["StarterPack"]}
			productType={Enum.InfoType.Product}
			anchorPoint={new Vector2(1, 0)}
			position={menuPos}
			size={UDim2.fromScale(0.120245, 0.187709)}
			visible={offer < RETRO}
			backgroundTransparency={0}
		>
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

			<uicorner key={"UICorner"} CornerRadius={new UDim(1, 8)} />

			<uistroke key={"UIStroke"} Thickness={6} />

			<frame BackgroundTransparency={1} key={"PackInfo"} Size={UDim2.fromScale(1, 1)}>
				{offer === NONE ? (
					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
						key={"PackName"}
						Position={UDim2.fromScale(-0.142857, 0.805736)}
						Size={UDim2.fromScale(1.27976, 0.282467)}
						Text={"Nature Pack"}
						TextColor3={Color3.fromRGB(157, 255, 132)}
						// TextScaled={true}
						TextSize={px(25)}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(4)} />
					</textlabel>
				) : (
					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://12187371840", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
						key={"PackName"}
						Position={UDim2.fromScale(-0.142857, 0.805736)}
						Size={UDim2.fromScale(1.27976, 0.282467)}
						Text={"GAMING PACK"}
						TextColor3={Color3.fromRGB(140, 207, 255)}
						// TextScaled={true}
						TextSize={px(25)}
						ZIndex={5}
					>
						<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Miter} Thickness={px(4)} />
					</textlabel>
				)}

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://12187371840", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"OP"}
					Position={UDim2.fromScale(-0.243544, 0)}
					Size={UDim2.fromScale(0.82363, 0.337662)}
					Text={"OP!"}
					TextColor3={new Color3(1, 1, 1)}
					// TextScaled={true}
					TextSize={px(30)}
					ZIndex={2}
					Visible={offer === NATURE}
				>
					<uistroke
						key={"UIStroke"}
						Color={Color3.fromRGB(54, 54, 54)}
						LineJoinMode={Enum.LineJoinMode.Miter}
						Thickness={5}
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
					Image={"rbxassetid://89099653396204"}
					ImageTransparency={0.8}
					key={"Sunburst"}
					Size={UDim2.fromScale(1, 1)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(1, 8)} />
				</imagelabel>
				<imagelabel
					BackgroundTransparency={1}
					Image={offer === NONE ? "rbxassetid://100120531177856" : "rbxassetid://137425474420788"}
					key={"Rewards"}
					Position={UDim2.fromScale(-0.0802641, 0)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1.18145, 1.10007)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(1, 8)} />
				</imagelabel>
			</frame>

			{offer === NONE ? (
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(55, 255, 0)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(6, 89, 0)),
						])
					}
					Rotation={90}
				/>
			) : (
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(4, 138, 169)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(1, 83, 134)),
						])
					}
					Rotation={90}
				/>
			)}
		</AnimatedProductButton>
	);
};
