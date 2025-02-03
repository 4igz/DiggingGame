import React, { useEffect } from "@rbxts/react";
import { Events } from "client/network";
import { fullTargetConfig } from "shared/config/targetConfig";
import { ItemAddedPopup, ItemPopupProps } from "./itemAddedPopup";
import { SoldItemPopup, SoldItemPopupProps } from "./soldItemPopup";

const POPUP_TYPES = {
	ItemAdded: "ItemAdded",
	SoldItem: "SoldItem",
};

interface PopupProps {
	id: number; // NEW: unique ID
	popupType: keyof typeof POPUP_TYPES;
	popupProps: ItemPopupProps | SoldItemPopupProps;
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

		Events.soldItem.connect((itemName, itemRarity, sellAmount) => {});

		Events.soldAllItems.connect((count, sellAmount) => {});
	}, []);

	return (
		<frame
			Size={UDim2.fromScale(0.5, 0.6)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			BackgroundTransparency={1}
		>
			<uilistlayout
				SortOrder={Enum.SortOrder.LayoutOrder}
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
				Padding={new UDim(0.125, 0)}
			/>
			{popups.map((popup) => {
				if (popup.popupType === "ItemAdded") {
					// Use "popup.id" for a stable React key:
					if (popup.popupType === "ItemAdded") {
						return <ItemAddedPopup key={popup.id} {...(popup.popupProps as ItemPopupProps)} />;
					} else if (popup.popupType === "SoldItem") {
						return <SoldItemPopup key={popup.id} {...(popup.popupProps as SoldItemPopupProps)} />;
					}
				}
			})}
		</frame>
	);
};
