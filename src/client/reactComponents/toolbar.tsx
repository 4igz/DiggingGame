//!optimize 2
import React, { useEffect, useState } from "@rbxts/react";
import { Players, RunService, SoundService, UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { shovelConfig } from "shared/config/shovelConfig";
import { fullTargetConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/gameConstants";
import { ItemType } from "shared/networkTypes";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface ToolbarItemProps {
	icon: string;
	itemName: string;
	isEquipped: boolean;
	order: number;
	tool: Tool;
	platform?: string;
	itemType: ItemType;
	equipToolByOrder: (order: number) => void;
}

const MOBILE_TOOLBAR_SCALE = 1.5;

const ToolbarItemComponent: React.FC<ToolbarItemProps> = (props) => {
	return (
		<imagebutton
			BackgroundColor3={Color3.fromRGB(117, 117, 117)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"ToolBtn"}
			ScaleType={Enum.ScaleType.Fit}
			Selectable={false}
			Size={UDim2.fromScale(0.09 * (props.platform === "Mobile" ? MOBILE_TOOLBAR_SCALE : 1), 1)}
			LayoutOrder={props.order}
			Event={{
				MouseButton1Click: () => {
					props.equipToolByOrder(props.order);
				},
			}}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://77410935702468"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
			>
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(20, 185, 255)),
							new ColorSequenceKeypoint(0.716, Color3.fromRGB(18, 162, 224)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
						])
					}
					Rotation={90}
					Enabled={props.isEquipped}
				/>
			</imagelabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Number"}
				Position={UDim2.fromScale(0.11, 0.11)}
				Size={UDim2.fromScale(0.26, 0.31)}
				Text={tostring(props.order)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Icon"}
				Position={UDim2.fromScale(0.5, 0.48)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.7, 0.74)}
				Image={props.icon}
			/>
		</imagebutton>
	);
};

export const Toolbar = () => {
	const [items, setItems] = React.useState<Array<ToolbarItemProps>>([]);
	const [platform, setPlatform] = useState(getPlayerPlatform());

	useEffect(() => {
		const connection = UserInputService.LastInputTypeChanged.Connect(() => {
			setPlatform(getPlayerPlatform());
		});

		return () => {
			connection.Disconnect();
		};
	}, []);

	const equipToolByOrder = (order: number) => {
		setItems((prev) => {
			// 1) Find the item in the *current* state (prev)
			const item = prev.find((i) => i.order === order);
			if (!item || !item.tool) {
				return prev; // Nothing to equip
			}

			// 2) Validate backpack/character
			const localPlayer = Players.LocalPlayer;
			if (localPlayer.GetAttribute(gameConstants.BOAT_DRIVER_SITTING) === true) return prev;
			const backpack = localPlayer.FindFirstChild("Backpack");
			const character = localPlayer.Character;
			if (!character || !backpack) {
				return prev;
			}

			const equipSound = ((): Sound | undefined => {
				const toolsFolder = SoundService.FindFirstChild("Tools");
				if (!toolsFolder) return undefined;
				const sfx = toolsFolder.FindFirstChild("Equip") as Sound | undefined;
				return sfx;
			})(); // a bit *IIFE* but it works

			// 3) Play SFX if we have one
			if (equipSound) {
				SoundService.PlayLocalSound(equipSound);
			}

			let wasEquipped = false;

			if (item.tool.Parent === character) {
				item.tool.Parent = backpack;
			} else {
				// Safeguard: ensure tools are set up properly.
				const handle = item.tool.FindFirstChild("Handle");

				if (!handle) {
					const toolMotor = character.FindFirstChild("RightHand")?.FindFirstChild("ToolMotor") as
						| Motor6D
						| undefined;
					if (!toolMotor) return prev;
					const toolMainPart = item.tool.FindFirstChildWhichIsA("BasePart") as BasePart | undefined;
					if (!toolMainPart) return prev;

					const tempWeld = new Instance("Weld");
					tempWeld.Part0 = toolMotor.Part0;
					tempWeld.Part1 = toolMainPart;
					tempWeld.Parent = character.PrimaryPart;

					let changedAncestry: RBXScriptConnection | undefined;

					const enabledConnection = toolMotor.GetPropertyChangedSignal("Enabled").Connect(() => {
						for (const descendant of item.tool.GetDescendants()) {
							if (descendant.IsA("BasePart")) {
								descendant.Transparency = 0;
							}
						}
						tempWeld?.Destroy();
						enabledConnection?.Disconnect();
						changedAncestry?.Disconnect();
					});

					changedAncestry = item.tool.AncestryChanged.Connect((_, parent) => {
						if (parent !== character) {
							enabledConnection?.Disconnect();
							changedAncestry?.Disconnect();
							tempWeld?.Destroy();
							for (const descendant of item.tool.GetDescendants()) {
								if (descendant.IsA("BasePart")) {
									descendant.Transparency = 0;
								}
							}
						}
					});
				}

				for (const descendant of item.tool.GetDescendants()) {
					if (descendant.IsA("BasePart")) {
						descendant.Anchored = false;
						descendant.Massless = true;
						descendant.CanCollide = false;
						descendant.Transparency = handle ? 0 : 1;
					}
				}

				// 4) Unequip everything else first
				for (const child of character.GetChildren()) {
					if (child.IsA("Tool") && child !== item.tool) {
						child.Parent = backpack;
					}
				}

				wasEquipped = true;
				item.tool.Parent = character;
			}

			// 6) Return a new array, updating this item's isEquipped
			return prev.map((other) =>
				other.order === order ? { ...other, isEquipped: wasEquipped } : { ...other, isEquipped: false },
			);
		});
	};

	/**
	 * Equips the next item in ascending order. Wraps if at the end.
	 */
	const equipNextItem = () => {
		if (items.size() === 0) return;

		// Sort by order so we can cycle properly.
		const sorted = [...items].sort((a, b) => a.order < b.order);

		// Find the currently equipped item.
		let equippedIndex = sorted.findIndex((item) => item.isEquipped);

		// If none is equipped, we’ll just pick the first.
		if (equippedIndex === -1) {
			equippedIndex = 0;
		} else {
			equippedIndex = (equippedIndex + 1) % sorted.size();
		}

		// Equip the item at that index
		equipToolByOrder(sorted[equippedIndex].order);
	};

	/**
	 * Equips the previous item in ascending order. Wraps if at the start.
	 */
	const equipPreviousItem = () => {
		if (items.size() === 0) return;

		const sorted = [...items].sort((a, b) => a.order < b.order);

		let equippedIndex = sorted.findIndex((item) => item.isEquipped);

		// If none is equipped, pick last
		if (equippedIndex === -1) {
			equippedIndex = sorted.size() - 1;
		} else {
			// Move backwards, wrapping to the end if needed
			equippedIndex = (equippedIndex - 1 + sorted.size()) % sorted.size();
		}

		equipToolByOrder(sorted[equippedIndex].order);
	};

	/**
	 * Listen for user inputs:
	 *  - Keyboard (digits 1-9)
	 *  - Gamepad (R1 -> next, L1 -> previous)
	 */
	React.useEffect(() => {
		const trove = new Trove();

		trove.add(
			UserInputService.InputBegan.Connect((input, gameProcessed) => {
				if (gameProcessed) return;

				// Keyboard 1..9
				if (input.UserInputType === Enum.UserInputType.Keyboard) {
					const keyOrder = input.KeyCode.Value - 48; // '1' is 49 in KeyCode
					if (keyOrder >= 1 && keyOrder <= items.size()) {
						equipToolByOrder(keyOrder);
					}
				}

				// Gamepad R1 -> next, L1 -> previous
				if (input.UserInputType === Enum.UserInputType.Gamepad1) {
					if (input.KeyCode === Enum.KeyCode.ButtonR1) {
						equipNextItem();
					} else if (input.KeyCode === Enum.KeyCode.ButtonL1) {
						equipPreviousItem();
					}
				}
			}),
		);

		return () => {
			trove.destroy();
		};
	}, [items]);

	/**
	 * Once a new child (Tool) is found (in Backpack or Character),
	 * add it to our items array, or update if it already exists.
	 */
	const handleChildAdded = (child: Instance, equipped: boolean) => {
		if (!child.IsA("Tool")) return;

		// Identify the config
		const cfg = metalDetectorConfig[child.Name] || fullTargetConfig[child.Name] || shovelConfig[child.Name];
		if (!cfg) return;

		// Identify which ItemType
		const itemType: ItemType | undefined = metalDetectorConfig[child.Name]
			? "MetalDetectors"
			: shovelConfig[child.Name]
			? "Shovels"
			: fullTargetConfig[child.Name]
			? "Target"
			: undefined;
		if (!itemType) return;

		setItems((prev) => {
			const existing = prev.find((item) => item.tool === child);
			if (existing) {
				// Just update its "isEquipped" if the item is already in the array
				return prev.map((item) => (item.tool === child ? { ...item, isEquipped: equipped } : item));
			}

			// Not in the array yet, so we add it.
			// We assign the next available order (lowest integer not used).
			const usedOrders = new Set(prev.map((item) => item.order));
			let nextOrder = 1;
			while (usedOrders.has(nextOrder)) {
				nextOrder++;
			}

			const newItem: ToolbarItemProps = {
				icon: cfg.itemImage,
				itemName: child.Name,
				isEquipped: equipped,
				order: nextOrder,
				tool: child,
				itemType: itemType,
				equipToolByOrder,
			};
			return [...prev, newItem];
		});
	};

	function handleToolRemoved(tool: Instance) {
		if (!tool.IsA("Tool")) return;

		// If the tool’s new parent is STILL the player's backpack or character,
		// it only re‐parented—don’t remove from items. Possibly set isEquipped = false.
		const localPlayer = Players.LocalPlayer;
		const newParent = tool.Parent;
		if (newParent === localPlayer.Character || newParent === localPlayer.FindFirstChild("Backpack")) {
			// If it’s in the Backpack or Character, just mark isEquipped false (if you want).
			setItems((prev) => prev.map((item) => (item.tool === tool ? { ...item, isEquipped: false } : item)));
			return;
		}

		// Otherwise, it's truly gone from the player's possession -> remove it
		setItems((prev) => prev.filter((item) => item.tool !== tool));
	}

	React.useEffect(() => {
		const localPlayer = Players.LocalPlayer;

		// We only set up listeners once each time the Character changes,
		// not on every render or whenever items changes.
		const onCharacterAdded = (character: Model) => {
			const trove = new Trove();

			const backpack = localPlayer.WaitForChild("Backpack") as Instance;

			// ChildAdded in Backpack
			trove.add(
				backpack.ChildAdded.Connect((child) => {
					handleChildAdded(child, false);
				}),
			);
			trove.add(backpack.ChildRemoved.Connect(handleToolRemoved));

			// ChildAdded in Character
			trove.add(
				character.ChildAdded.Connect((child) => {
					handleChildAdded(child, true);
				}),
			);
			trove.add(character.ChildRemoved.Connect(handleToolRemoved));

			// Existing tools in both
			for (const child of character.GetChildren()) {
				handleChildAdded(child, true);
			}
			for (const child of backpack.GetChildren()) {
				handleChildAdded(child, false);
			}

			// When the character is removed or dies, clear items:
			const humanoid = character.FindFirstChildOfClass("Humanoid");
			if (humanoid) {
				trove.add(
					humanoid.Died.Connect(() => {
						setItems([]);
					}),
				);
			}
			trove.add(
				localPlayer.CharacterRemoving.Connect(() => {
					setItems([]);
				}),
			);

			// Cleanup function—destroy Trove connections
			const cleanup = () => {
				trove.destroy();
			};
			return cleanup;
		};

		// Handle a new character spawn
		const charAddedConn = localPlayer.CharacterAdded.Connect((char) => {
			onCharacterAdded(char);
		});

		// If we already have a character, set it up now
		if (localPlayer.Character) {
			onCharacterAdded(localPlayer.Character);
		}

		// Cleanup if Toolbar unmounts
		return () => {
			charAddedConn.Disconnect();
		};
	}, []); // IMPORTANT: No [items] dependency, so we don't re‐run on every state change.

	return (
		<frame
			key={"ToolbarHolder"}
			AnchorPoint={new Vector2(0.5, 1)}
			BackgroundTransparency={1}
			Position={UDim2.fromScale(0.5, 1)}
			Size={UDim2.fromScale(0.75, 0.15 * (platform === "Mobile" ? MOBILE_TOOLBAR_SCALE : 1))}
			ZIndex={1}
		>
			<uilistlayout
				key={"UIListLayout"}
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0.01, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{items.map((item, index) => (
				<ToolbarItemComponent key={`ToolbarItem_${index}`} platform={platform} {...item} />
			))}
		</frame>
	);
};
