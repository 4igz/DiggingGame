//!optimize 2
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Events } from "client/network";
import { fullTargetConfig } from "shared/config/targetConfig";
import { TreasureAddedPopup, TreasurePopupProps } from "./itemAddedPopup";
import { SoldItemPopup, SoldItemPopupProps } from "./soldItemPopup";
import { BoughtItemPopup, BoughtItemPopupProps } from "./boughtItemPopup";
import { Signals } from "shared/signals";
import { InventoryFullPopup, InventoryFullPopupProps } from "./inventoryFullPopup";
import { CantdoThisPopup, CantdoThisPopupProps } from "./cantDoThisPopup";
import { ClaimedPopup, ClaimedPopupProps } from "./claimedPopup";
import { gameConstants } from "shared/gameConstants";
import { ItemName, ItemType } from "shared/networkTypes";
import { ActionPopup, ActionPopupProps } from "./actionPopup";
import { SoundService } from "@rbxts/services";
import { FINISH_STEP } from "shared/config/tutorialConfig";
import { subscribe } from "@rbxts/charm";
import { tutorialActiveAtom } from "client/atoms/uiAtoms";

const POPUP_TYPES = {
	ItemAdded: "ItemAdded",
	BoughtItem: "BoughtItem",
	SoldItem: "SoldItem",
	InventoryFull: "InventoryFull",
	InvalidAction: "InvalidAction",
	Claimed: "Claimed",
	Action: "Action",
};

// Structure to track active popups
interface ActivePopup {
	id: number;
	key: string;
	type: keyof typeof POPUP_TYPES;
	count: number;
	timer?: thread;
	props:
		| TreasurePopupProps
		| SoldItemPopupProps
		| BoughtItemPopupProps
		| InventoryFullPopupProps
		| CantdoThisPopupProps
		| ClaimedPopupProps
		| ActionPopupProps;
}

interface PopupProps {
	popup: ActivePopup;
	onComplete: () => void;
}

const Popup = ({ popup, onComplete }: PopupProps) => {
	// Create the props with onComplete callback
	const commonProps = {
		onComplete: onComplete,
	};

	if (popup.type === "ItemAdded") {
		return (
			<TreasureAddedPopup
				key={popup.id}
				{...(popup.props as TreasurePopupProps)}
				{...commonProps}
				count={popup.count}
			/>
		);
	} else if (popup.type === "SoldItem") {
		return (
			<SoldItemPopup
				key={popup.id}
				{...(popup.props as SoldItemPopupProps)}
				{...commonProps}
				count={popup.count}
			/>
		);
	} else if (popup.type === "BoughtItem") {
		return (
			<BoughtItemPopup
				key={popup.id}
				{...(popup.props as BoughtItemPopupProps)}
				{...commonProps}
				count={popup.count}
			/>
		);
	} else if (popup.type === "InventoryFull") {
		return (
			<InventoryFullPopup
				key={popup.id}
				{...(popup.props as InventoryFullPopupProps)}
				{...commonProps}
				count={popup.count}
			/>
		);
	} else if (popup.type === "InvalidAction") {
		return (
			<CantdoThisPopup
				key={popup.id}
				{...(popup.props as CantdoThisPopupProps)}
				{...commonProps}
				count={popup.count}
			/>
		);
	} else if (popup.type === "Claimed") {
		return (
			<ClaimedPopup key={popup.id} {...(popup.props as ClaimedPopupProps)} {...commonProps} count={popup.count} />
		);
	} else if (popup.type === "Action") {
		return (
			<ActionPopup key={popup.id} {...(popup.props as ClaimedPopupProps)} {...commonProps} count={popup.count} />
		);
	}
};

export const Popups = () => {
	const [activePopups, setActivePopups] = useState<ActivePopup[]>([]);
	const [tutorialActive, setTutorialActive] = useState(false);
	const nextId = useRef(0);
	// For tracking pending popups that are waiting to be displayed
	const pendingPopupsRef = useRef<Map<string, { type: keyof typeof POPUP_TYPES; props: any; timer?: thread }>>(
		new Map(),
	);
	// Flag to track if we're currently processing state updates
	const isProcessingRef = useRef(false);

	// Helper to generate a unique key for each popup type
	const getPopupKey = (popupType: keyof typeof POPUP_TYPES, content: string): string => {
		return `${popupType}:${content}`;
	};

	// Process any pending popups that are waiting to be displayed
	// This is the updated processPendingPopups function
	const processPendingPopups = () => {
		if (isProcessingRef.current || pendingPopupsRef.current.size() === 0) {
			return;
		}

		isProcessingRef.current = true;

		// Make a copy of the pending keys to avoid modification during iteration
		const pendingKeys = table.clone(pendingPopupsRef.current);

		// Process each pending popup
		for (const [popupKey] of pendingKeys) {
			const pendingPopup = pendingPopupsRef.current.get(popupKey);
			if (pendingPopup) {
				// Use setActivePopups with a callback to ensure we're working with the latest state
				setActivePopups((currentPopups) => {
					// Check if this popup type already exists in active popups
					const existingPopupIndex = currentPopups.findIndex((p) => p.key === popupKey);

					if (existingPopupIndex >= 0) {
						// Update existing popup
						const updatedPopups = [...currentPopups];
						const existingPopup = updatedPopups[existingPopupIndex];

						// Cancel existing timer if any
						if (existingPopup.timer !== undefined) {
							task.cancel(existingPopup.timer);
						}

						updatedPopups[existingPopupIndex] = {
							...existingPopup,
							count: existingPopup.count + 1,
							props: { ...existingPopup.props, ...pendingPopup.props },
							timer: undefined, // Reset timer so the useEffect will create a new one
						};

						return updatedPopups;
					} else {
						// Create new popup
						nextId.current++;
						return [
							...currentPopups,
							{
								id: nextId.current,
								key: popupKey,
								type: pendingPopup.type,
								count: 1,
								props: pendingPopup.props,
								timer: undefined,
							},
						];
					}
				});

				// Remove from pending
				pendingPopupsRef.current.delete(popupKey);
			}
		}

		// Clear the processing flag after a short delay to allow state to update
		task.delay(0.1, () => {
			isProcessingRef.current = false;

			// Check if new pending popups were added during processing
			if (pendingPopupsRef.current.size() > 0) {
				processPendingPopups();
			}
		});
	};

	// Fix for the useEffect hook that manages popup timers
	useEffect(() => {
		// For each active popup that doesn't have a timer, set one up
		let changed = false;
		const POPUP_TIME = 3; // seconds

		const updatedPopups = [...activePopups];

		activePopups.forEach((popup, index) => {
			if (popup.timer === undefined) {
				// Set up a new timer
				const timer = task.delay(POPUP_TIME, () => {
					// Remove this popup when timer completes
					// setActivePopups((current) => current.filter((p) => p.id !== popup.id));
				});

				// Update the popup with the timer only
				updatedPopups[index] = {
					...popup,
					timer: timer,
				};
				changed = true;
			}
		});

		// Only update state if we changed something
		if (changed) {
			setActivePopups(updatedPopups);
		}

		// Clean up timers when component unmounts
		return () => {
			activePopups.forEach((popup) => {
				if (popup.timer !== undefined) {
					task.cancel(popup.timer);
				}
			});
		};
	}, [activePopups]);

	// The queuePopup function also needs to be updated to properly handle counts
	const queuePopup = (popupType: keyof typeof POPUP_TYPES, contentKey: string, props: any) => {
		const popupKey = getPopupKey(popupType, contentKey);

		// Check if this popup already exists in active popups
		const existingPopup = activePopups.find((popup) => popup.key === popupKey);

		if (popupType !== "ItemAdded" && popupType !== "Claimed" && existingPopup) {
			// Cancel the existing timer
			if (existingPopup.timer !== undefined) {
				task.cancel(existingPopup.timer);
			}

			// Update the existing popup with an incremented count
			setActivePopups((current) =>
				current.map((popup) =>
					popup.key === popupKey
						? { ...popup, count: popup.count + 1, timer: undefined, props: { ...popup.props, ...props } }
						: popup,
				),
			);
		} else {
			// Store in pending popups for new popups
			pendingPopupsRef.current.set(popupKey, {
				type: popupType,
				props: props,
			});

			// Try to process pending popups
			processPendingPopups();
		}
	};

	// Connect to events
	useEffect(() => {
		Events.targetAdded.connect((itemName, itemWeight, mapName) => {
			const item = fullTargetConfig[itemName];
			if (item) {
				if (item.hasCutscene) {
					task.wait(gameConstants.CUTSCENE_SUSPENSE_TIME + 1);
				}
				queuePopup("ItemAdded", `${itemName}-${itemWeight}`, {
					itemName,
					itemImage: item.itemImage,
					itemRarity: item.rarityType,
					itemWeight,
					mapName,
				});
			}
		});

		Events.soldItem.connect((itemName, itemRarity, sellAmount) => {
			queuePopup("SoldItem", `${itemName}:${sellAmount}`, {
				itemName,
				itemRarity,
				sellAmount,
				isSellAll: false,
			});
		});

		Events.soldAllItems.connect((sellCount, sellAmount) => {
			queuePopup("SoldItem", `sellAll:${sellCount}:${sellAmount}`, {
				itemName: "",
				sellAmount,
				isSellAll: true,
				sellCount,
			});
		});

		Events.boughtItem.connect((name, itemType, config) => {
			queuePopup("BoughtItem", name, {
				itemName: name,
				itemImage: config.itemImage,
				itemRarity: config.rarityType,
			});
		});

		Events.sendClaimedPopup.connect((kind, reward) => {
			queuePopup("Claimed", `claimed-${kind}-${reward}`, {
				itemRarity:
					typeOf(kind) === "string" && kind in gameConstants.SHOP_CONFIGS
						? gameConstants.SHOP_CONFIGS[kind as ItemType]?.[reward as ItemName]?.rarityType
						: undefined,
				reward: kind,
				itemName: reward,
			});
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("Claim") as Sound);
		});

		Signals.inventoryFull.Connect(() => {
			queuePopup("InventoryFull", "inventoryFull", {});
		});

		Signals.invalidAction.Connect((text) => {
			const popupText = text || "Can't do this!";
			queuePopup("InvalidAction", popupText, {
				text: popupText,
			});
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("ErrorSound") as Sound);
		});

		Events.sendInvalidActionPopup.connect((message) => {
			const popupText = message || "Can't do this!";
			queuePopup("InvalidAction", popupText, {
				text: popupText,
			});
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("ErrorSound") as Sound);
		});

		Events.sendActionPopup.connect((message) => {
			const popupText = message || "Done!";
			queuePopup("Action", popupText, {
				text: popupText,
			});
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("ActionSuccess") as Sound);
		});

		Signals.actionPopup.Connect((text) => {
			const popupText = text || "Done!";
			queuePopup("Action", popupText, {
				text: popupText,
			});
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("ActionSuccess") as Sound);
		});

		subscribe(tutorialActiveAtom, (active) => {
			setTutorialActive(active);
		});
	}, []);

	return (
		<frame
			Size={UDim2.fromScale(0.5, 0.6)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={tutorialActive ? UDim2.fromScale(0.5, 0.35) : UDim2.fromScale(0.5, 0.45)}
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
			{activePopups.map((popup) => (
				<Popup
					key={popup.id}
					popup={popup}
					onComplete={() => {
						setActivePopups((prev) => prev.filter((v) => v.id !== popup.id));
					}}
				/>
			))}
		</frame>
	);
};
