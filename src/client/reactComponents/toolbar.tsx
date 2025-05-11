//!optimize 2
import React, { useEffect, useState, useMemo, useRef } from "@rbxts/react";
import { Players, UserInputService, SoundService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { useMotion } from "client/hooks/useMotion";
import { usePx } from "client/hooks/usePx";
import { springs } from "client/utils/springs";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { shovelConfig } from "shared/config/shovelConfig";
import { fullTargetConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/gameConstants";
import { ItemType, Rarity } from "shared/networkTypes";
import { Signals } from "shared/signals";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface ToolbarItemProps {
	icon: string;
	itemName: string;
	isEquipped: boolean;
	order: number;
	tool: Tool;
	rarity: Rarity;
	platform?: string;
	itemType: ItemType;
	equipToolByOrder: (order: number) => void;
}

const MOBILE_TOOLBAR_SCALE = 1.25;

const ToolbarItemComponent: React.FC<ToolbarItemProps> = (props) => {
	const px = usePx();

	return (
		<imagebutton
			BackgroundColor3={
				gameConstants.RARITY_COLORS[props.rarity].Lerp(new Color3(1, 1, 1), 0.5) ??
				Color3.fromRGB(111, 111, 111)
			}
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
				ImageColor3={
					gameConstants.RARITY_COLORS[props.rarity].Lerp(new Color3(1, 1, 1), 0.6) ??
					Color3.fromRGB(111, 111, 111)
				}
				Size={UDim2.fromScale(1, 1)}
			>
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(
								0,
								(gameConstants.RARITY_COLORS[props.rarity] ?? Color3.fromRGB(20, 185, 255)).Lerp(
									Color3.fromRGB(0, 0, 0),
									0,
								),
							),
							new ColorSequenceKeypoint(
								0.716,
								(gameConstants.RARITY_COLORS[props.rarity] ?? Color3.fromRGB(20, 185, 255)).Lerp(
									Color3.fromRGB(0, 0, 0),
									0.1,
								),
							),
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
				ZIndex={100}
			>
				<uistroke key={"UIStroke"} Thickness={px(3)} />
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

const cleanupCallbacks: Array<() => void> = [];

const DEFAULT_POS = UDim2.fromScale(0.5, 0.9875);
const CLOSED_POS = UDim2.fromScale(0.5, 1.5);

export const Toolbar = () => {
	const [items, setItems] = useState<Array<ToolbarItemProps>>([]);
	const [platform, setPlatform] = useState(getPlayerPlatform());
	const itemsRef = useRef<Array<ToolbarItemProps>>([]);
	const [menuPos, menuPosMotion] = useMotion(DEFAULT_POS);
	const equippedOrderRef = useRef<number | undefined>(undefined);

	itemsRef.current = items; // Keep ref updated with latest items

	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => a.order > b.order);
	}, [items]);

	useEffect(() => {
		const connection = UserInputService.LastInputTypeChanged.Connect(() => {
			setPlatform(getPlayerPlatform());
		});
		return () => connection.Disconnect();
	}, []);

	useEffect(() => {
		Signals.menuOpened.Connect((isOpen) => {
			menuPosMotion.spring(isOpen ? CLOSED_POS : DEFAULT_POS, springs.default);
		});
	}, []);

	const cleanupPreviousTool = () => {
		while (cleanupCallbacks.size() > 0) {
			cleanupCallbacks.pop()?.();
		}
	};

	const equipToolByOrder = (order: number) => {
		const localPlayer = Players.LocalPlayer;
		const character = localPlayer.Character;
		const humanoid = character?.FindFirstChildOfClass("Humanoid");
		const backpack = localPlayer.FindFirstChild("Backpack");

		if (localPlayer.GetAttribute(gameConstants.BOAT_DRIVER_SITTING) === true) return;

		if (!character || !backpack || !humanoid) return;

		const item = itemsRef.current.find((item) => item.order === order);
		if (!item || !item.tool) return;

		cleanupPreviousTool();
		const trove = new Trove();

		// Use Humanoid:EquipTool instead of manually parenting
		if (item.tool.Parent === character) {
			humanoid.UnequipTools();
		} else {
			const handle = item.tool.RequiresHandle
				? item.tool.WaitForChild("Handle", 5)
				: item.tool.FindFirstChild("Handle");

			if (!handle) {
				const toolMotor = character.FindFirstChild("RightHand")?.FindFirstChild("ToolMotor") as
					| Motor6D
					| undefined;
				if (!toolMotor) return;
				const toolMainPart = item.tool.FindFirstChildWhichIsA("BasePart") as BasePart | undefined;
				if (!toolMainPart) return;

				// Create temporary weld
				const tempWeld = new Instance("WeldConstraint");
				tempWeld.Part0 = character.PrimaryPart;
				tempWeld.Part1 = toolMainPart;
				tempWeld.Parent = character.PrimaryPart;
				trove.add(tempWeld);

				trove.add(
					toolMotor.GetPropertyChangedSignal("Enabled").Connect(() => {
						trove.destroy();
					}),
					"Disconnect",
				);

				trove.add(
					item.tool.AncestryChanged.Connect((_, parent) => {
						if (parent !== character) {
							trove.destroy();
						}
					}),
					"Disconnect",
				);

				trove.add(() => {
					for (const descendant of item.tool.GetDescendants()) {
						if (descendant.IsA("BasePart")) {
							descendant.Transparency = 0;
						}
					}
				});

				// Store cleanup functions
				cleanupCallbacks.push(() => {
					trove.destroy();
				});
			}

			for (const descendant of item.tool.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.Anchored = false;
					descendant.Massless = true;
					descendant.CanCollide = false;
					// descendant.Transparency = handle ? 0 : 1;
				}
			}

			humanoid.EquipTool(item.tool);
		}

		equippedOrderRef.current = order;

		// Play equip sound
		const equipSound = SoundService.FindFirstChild("Tools")?.FindFirstChild("Equip") as Sound;
		if (equipSound) SoundService.PlayLocalSound(equipSound);
	};

	const handleChildAdded = (child: Instance, equipped: boolean = false) => {
		if (!child.IsA("Tool")) return;
		const cfg = metalDetectorConfig[child.Name] || fullTargetConfig[child.Name] || shovelConfig[child.Name];
		if (!cfg) return;

		const localPlayer = Players.LocalPlayer;
		const character = localPlayer.Character;
		const backpack = localPlayer.FindFirstChild("Backpack");

		// If tool is no longer in the character or backpack, remove it from the toolbar
		child.AncestryChanged.Once((_, parent) => {
			if (parent !== character && parent !== backpack) {
				setItems((prev) => prev.filter((item) => item.tool !== child));
			}
		});

		const itemType: ItemType = metalDetectorConfig[child.Name]
			? "MetalDetectors"
			: shovelConfig[child.Name]
			? "Shovels"
			: "Target";

		setItems((prev) => {
			if (prev.some((item) => item.tool.Name === child.Name))
				return prev.map((item) => {
					if (item.tool.Name === child.Name) {
						return { ...item, isEquipped: equipped };
					}
					return item;
				});
			const newItem: ToolbarItemProps = {
				icon: cfg.itemImage,
				itemName: child.Name,
				isEquipped: equipped,
				order: itemType === "MetalDetectors" ? 1 : itemType === "Shovels" ? 2 : prev.size() + 1,
				tool: child,
				itemType: itemType,
				rarity: cfg.rarityType,
				equipToolByOrder,
			};
			return [...prev.filter((item) => item.tool.Parent === backpack || item.tool.Parent === character), newItem];
		});
	};

	// Simplified next/previous functions using itemsRef
	const equipNextItem = () => {
		if (itemsRef.current.size() === 0) return;

		// Sort items by order
		const sortedItems = [...itemsRef.current].sort((a, b) => a.order > b.order);

		// Find the currently equipped item
		const currentIndex = sortedItems.findIndex((item) => item.isEquipped);

		// If nothing is equipped, equip the first item
		if (currentIndex === -1) {
			equipToolByOrder(sortedItems[0].order);
			return;
		}

		// Calculate the next index, wrapping around if needed
		const nextIndex = (currentIndex + 1) % sortedItems.size();

		// Equip the tool at the next index
		equipToolByOrder(sortedItems[nextIndex].order);
	};

	const equipPreviousItem = () => {
		if (itemsRef.current.size() === 0) return;

		// Sort items by order
		const sortedItems = [...itemsRef.current].sort((a, b) => a.order > b.order);

		// Find the currently equipped item
		const currentIndex = sortedItems.findIndex((item) => item.isEquipped);

		// If nothing is equipped, equip the last item
		if (currentIndex === -1) {
			equipToolByOrder(sortedItems[sortedItems.size() - 1].order);
			return;
		}

		// Calculate the previous index, wrapping around if needed
		const prevIndex = (currentIndex - 1 + sortedItems.size()) % sortedItems.size();

		// Equip the tool at the previous index
		equipToolByOrder(sortedItems[prevIndex].order);
	};

	useEffect(() => {
		const localPlayer = Players.LocalPlayer;
		const trove = new Trove();

		const onCharacterAdded = (char: Model) => {
			setItems([]);
			const backpack = localPlayer.WaitForChild("Backpack") as Instance;

			// Listen for new tools added to backpack/character
			trove.add(
				char.ChildAdded.Connect((child) => handleChildAdded(child, true)),
				"Disconnect",
			);
			trove.add(
				backpack.ChildAdded.Connect((child) => handleChildAdded(child)),
				"Disconnect",
			);

			// Listen for tools already in backpack/character
			for (const child of char.GetChildren()) handleChildAdded(child, true);
			for (const child of backpack.GetChildren()) handleChildAdded(child);
		};

		const handleInput = (input: InputObject, gameProcessed: boolean) => {
			if (gameProcessed) return;

			// Gamepad R1 -> next, L1 -> previous
			if (input.KeyCode === Enum.KeyCode.ButtonR1) {
				equipNextItem();
			} else if (input.KeyCode === Enum.KeyCode.ButtonL1) {
				equipPreviousItem();
			}

			// Keyboard 1..9
			if (input.UserInputType === Enum.UserInputType.Keyboard) {
				const keyOrder = input.KeyCode.Value - 48; // '1' is 49 in KeyCode
				if (keyOrder >= 1 && keyOrder <= 9) {
					equipToolByOrder(keyOrder);
				}
			}
		};

		trove.add(UserInputService.InputBegan.Connect(handleInput), "Disconnect");

		// Setup event listeners for tool tracking
		trove.add(localPlayer.CharacterAdded.Connect(onCharacterAdded), "Disconnect");
		if (localPlayer.Character) onCharacterAdded(localPlayer.Character);

		return () => trove.destroy();
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 1)}
			Size={UDim2.fromScale(0.75, 0.15 * (platform === "Mobile" ? MOBILE_TOOLBAR_SCALE : 1))}
			BackgroundTransparency={1}
			Position={menuPos}
			ZIndex={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0.01, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{sortedItems.map((item) => (
				<ToolbarItemComponent platform={platform} {...item} />
			))}
		</frame>
	);
};
