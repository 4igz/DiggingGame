import Object from "@rbxts/object-utils";
import React, { useEffect } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { set } from "@rbxts/sift/out/Array";
import { Events } from "client/network";
import { fullTargetConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/constants";
import { Rarity } from "shared/networkTypes";
import { separateWithCommas } from "shared/util/nameUtil";

const RC = gameConstants.RARITY_COLORS;

export function getOneInXChance(itemName: string): number {
	const itemConfig = fullTargetConfig[itemName];
	if (!itemConfig) {
		return 0; // or handle however you prefer
	}

	// 1) Sum the inverses of all items' rarities
	let totalInverse = 0;
	for (const config of Object.values(fullTargetConfig)) {
		totalInverse += 1 / config.rarity;
	}

	// 2) Probability for `itemName` in the entire distribution
	const itemInverse = 1 / itemConfig.rarity;
	const probability = itemInverse / totalInverse;

	// 3) Convert the probability into "1 in X" format
	const oneInX = math.round(1 / probability);

	return oneInX;
}

export const ItemAddedPopup = () => {
	const [visible, setVisible] = React.useState(false);
	const [itemImage, setItemImage] = React.useState("rbxassetid://0");
	const [itemName, setItemName] = React.useState("Bag of coins");
	const [itemRarity, setItemRarity] = React.useState<Rarity>("Common");
	const [itemWeight, setItemWeight] = React.useState(0);

	const [spinValue, setSpinValue] = React.useState(0);

	const POPUP_TIME = 5;

	// First effect handles the visibility of the popup
	useEffect(() => {
		if (visible) {
			let hiderThread = task.delay(POPUP_TIME, () => {
				setVisible(false);
			});

			return () => {
				task.cancel(hiderThread);
			};
		}
	}, [visible, itemName, itemRarity, itemWeight, itemImage]);

	// Second effect handles the event data
	useEffect(() => {
		Events.targetAdded.connect((itemName, itemWeight) => {
			const item = fullTargetConfig[itemName];
			if (item) {
				setItemImage(item.itemImage);
				setItemRarity(item.rarityType);
				setItemWeight(itemWeight);
				setItemName(itemName);
				setVisible(true);
			}
		});

		const SPIN_FREQUENCY = 0.1; // Smaller value = slower spin

		RunService.RenderStepped.Connect(() => {
			setSpinValue(0.5 * (1 + math.sin(2 * math.pi * SPIN_FREQUENCY * tick())));
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Holder"}
			Position={UDim2.fromScale(0.5, 0.8)}
			Size={UDim2.fromScale(0.3, 0.1)}
			Visible={visible}
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
				Size={UDim2.fromScale(0.25, 1.59)}
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
					Image={itemImage}
					Rotation={spinValue * -360}
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
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"ExplainerText"}
				RichText={true}
				Size={UDim2.fromScale(1, 1)}
				Text={`You just discovered a <font color="rgb(${math.round(RC[itemRarity].R * 255)},${math.round(
					RC[itemRarity].G * 255,
				)},${math.round(RC[itemRarity].B * 255)})">1 in ${separateWithCommas(
					getOneInXChance(itemName),
				)} ${itemName}</font> at <font color="rgb(100,125,255)"><b>${string.format(
					"%.2f",
					itemWeight,
				)}</b></font> kg!`}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={24}
			>
				<uistroke key={"UIStroke"} />
			</textlabel>
		</frame>
	);
};
