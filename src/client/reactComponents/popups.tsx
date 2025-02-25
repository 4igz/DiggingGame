//!optimize 2
//!native
import React, { useEffect } from "@rbxts/react";
import { Events } from "client/network";
import { fullTargetConfig } from "shared/config/targetConfig";
import { TreasureAddedPopup, TreasurePopupProps } from "./itemAddedPopup";
import { SoldItemPopup, SoldItemPopupProps } from "./soldItemPopup";
import { Item } from "shared/networkTypes";
import { BoughtItemPopup, BoughtItemPopupProps } from "./boughtItemPopup";

const POPUP_TYPES = {
	ItemAdded: "ItemAdded",
	BoughtItem: "BoughtItem",
	SoldItem: "SoldItem",
};

interface PopupProps {
	id: number; // NEW: unique ID
	popupProps: TreasurePopupProps | SoldItemPopupProps | BoughtItemPopupProps;
	popupType: keyof typeof POPUP_TYPES;
}

export const Popups = () => {
	const [popups, setPopups] = React.useState<PopupProps[]>([]);

	// We'll store a ref to hold the next ID:
	const nextId = React.useRef(0);

	useEffect(() => {
		Events.targetAdded.connect((itemName, itemWeight, mapName) => {
			const item = fullTargetConfig[itemName];
			if (item) {
				nextId.current++;
				const newId = nextId.current;

				setPopups((prev) => [
					...prev,
					{
						id: newId,
						popupType: "ItemAdded",
						popupProps: {
							itemName,
							itemImage: item.itemImage,
							itemRarity: item.rarityType,
							itemWeight,
							mapName,
							// Pass a callback that removes *this* popup's ID:
							onComplete: () => {
								setPopups((prev2) => {
									return prev2.filter((popup) => popup.id !== newId);
								});
							},
						},
					},
				]);
			}
		});

		Events.soldItem.connect((itemName, itemRarity, sellAmount) => {
			nextId.current++;
			const newId = nextId.current;

			setPopups((prev) => [
				...prev,
				{
					id: newId,
					popupType: "SoldItem",
					popupProps: {
						itemName,
						itemRarity,
						sellAmount,
						isSellAll: false,
						// Pass a callback that removes *this* popup's ID:
						onComplete: () => {
							setPopups((prev2) => {
								return prev2.filter((popup) => popup.id !== newId);
							});
						},
					},
				},
			]);
		});

		Events.soldAllItems.connect((sellCount, sellAmount) => {
			nextId.current++;
			const newId = nextId.current;

			setPopups((prev) => [
				...prev,
				{
					id: newId,
					popupType: "SoldItem",
					popupProps: {
						itemName: "",
						sellAmount,
						isSellAll: true,
						sellCount,
						// Pass a callback that removes *this* popup's ID:
						onComplete: () => {
							setPopups((prev2) => {
								return prev2.filter((popup) => popup.id !== newId);
							});
						},
					},
				},
			]);
		});

		Events.boughtItem.connect((name, itemType, config) => {
			nextId.current++;
			const newId = nextId.current;

			setPopups((prev) => [
				...prev,
				{
					id: newId,
					popupType: "BoughtItem",
					popupProps: {
						itemName: name,
						itemImage: config.itemImage,
						itemRarity: config.rarityType,
						// Pass a callback that removes *this* popup's ID:
						onComplete: () => {
							setPopups((prev2) => {
								return prev2.filter((popup) => popup.id !== newId);
							});
						},
					},
				},
			]);
		});
	}, []);

	return (
		<frame
			Size={UDim2.fromScale(0.5, 0.6)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			BackgroundTransparency={1}
			ZIndex={100}
		>
			<uilistlayout
				SortOrder={Enum.SortOrder.LayoutOrder}
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
				Padding={new UDim(0.175, 0)}
			/>
			{popups.map((popup) => {
				if (popup.popupType === "ItemAdded") {
					return <TreasureAddedPopup key={popup.id} {...(popup.popupProps as TreasurePopupProps)} />;
				} else if (popup.popupType === "SoldItem") {
					return <SoldItemPopup key={popup.id} {...(popup.popupProps as SoldItemPopupProps)} />;
				} else if (popup.popupType === "BoughtItem") {
					return <BoughtItemPopup key={popup.id} {...(popup.popupProps as BoughtItemPopupProps)} />;
				}
			})}
		</frame>
	);
};
