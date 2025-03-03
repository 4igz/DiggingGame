//!optimize 2
import React, { useEffect } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { fullTargetConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/gameConstants";
import { Rarity } from "shared/networkTypes";
import { shortenNumber } from "shared/util/nameUtil";

const RC = gameConstants.RARITY_COLORS;

export interface SoldItemPopupProps {
	itemName?: keyof typeof fullTargetConfig;
	itemRarity?: Rarity;
	sellCount?: number;
	sellAmount: number;
	isSellAll: boolean;
	onComplete: () => void;
}

const SOLD_ALL_COLOR = new Color3(0, 0.68, 1);

export const SoldItemPopup = (props: SoldItemPopupProps) => {
	const [sizeMotion, setSizeMotion] = useMotion(UDim2.fromScale(0, 0));

	const [spinValue, setSpinValue] = React.useState(0);
	const [imageRotation, setImageRotation] = useMotion(0);

	const POPUP_TIME = 5;

	useEffect(() => {
		setSizeMotion.spring(UDim2.fromScale(0.3, 0.1), springs.responsive);

		task.delay(POPUP_TIME, () => {
			setSizeMotion.onComplete(() => {
				props.onComplete();
			});
			setSizeMotion.spring(UDim2.fromScale(0, 0), springs.responsive);
		});

		let currentRotation = imageRotation.getValue();
		const MAX_ROTATION = 45;
		const rotationThread = task.spawn(() => {
			while (true) {
				// Make image bob back and forth
				task.wait(1);
				currentRotation = currentRotation < MAX_ROTATION ? MAX_ROTATION : 0;
				setImageRotation.spring(currentRotation, springs.bubbly);
			}
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	// Second effect handles the event data
	useEffect(() => {
		const SPIN_FREQUENCY = 0.1; // Smaller value = slower spin

		const connection = RunService.RenderStepped.Connect(() => {
			setSpinValue(0.5 * (1 + math.sin(2 * math.pi * SPIN_FREQUENCY * tick())));
		});

		return () => {
			connection.Disconnect();
		};
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 1)}
			BackgroundTransparency={1}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={sizeMotion}
			Visible={true}
		>
			<uilistlayout
				key={"UIListLayout"}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
			/>

			<frame
				AnchorPoint={new Vector2(1, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ImageHolder"}
				Position={UDim2.fromScale(0.625, 0.219)}
				Size={UDim2.fromScale(0.5, 2)}
			>
				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://74632346775366"}
					key={"Star"}
					Rotation={spinValue * 360}
					Size={UDim2.fromScale(1, 1)}
				/>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"ItemImage"}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={5}
					Image={props.itemName ? fullTargetConfig[props.itemName].itemImage : "rbxassetid://96446480715038"}
					Rotation={imageRotation}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
				</imagelabel>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://104992023858077"}
					key={"Radial"}
					Rotation={spinValue * 360}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				/>
			</frame>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"ExplainerText"}
				RichText={true}
				Size={UDim2.fromScale(2, 1)}
				TextXAlignment={Enum.TextXAlignment.Center}
				Text={`You just sold ${
					props.isSellAll
						? ""
						: `${"aeiou".find(string.lower((props.itemName ?? "").sub(0, 1))).size() > 0 ? "an " : "a "}`
				}<font color="rgb(${math.round(
					props.itemRarity ? RC[props.itemRarity].R * 255 : SOLD_ALL_COLOR.R * 255,
				)},${math.round(props.itemRarity ? RC[props.itemRarity].G * 255 : SOLD_ALL_COLOR.G * 255)},${math.round(
					props.itemRarity ? RC[props.itemRarity].B * 255 : SOLD_ALL_COLOR.B * 255,
				)})">${
					props.isSellAll
						? `${props.sellCount} ${(props.sellCount ?? 0) > 1 ? "ITEMS" : "ITEM"}`
						: props.itemName
				}</font> for <font color="rgb(0, 255, 0)"><b>$${shortenNumber(props.sellAmount)}</b></font>!`}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={false}
				AutomaticSize={Enum.AutomaticSize.X}
			>
				<uistroke key={"UIStroke"} />
			</textlabel>
		</frame>
	);
};
