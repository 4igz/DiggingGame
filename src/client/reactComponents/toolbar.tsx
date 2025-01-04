import React from "@rbxts/react";
import { Players, StarterGui, UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { shovelConfig } from "shared/config/shovelConfig";
import { targetConfig } from "shared/config/targetConfig";

interface ToolbarItemProps {
	icon: string;
	itemName: string;
	isEquipped: boolean;
	order: number;
	tool: Tool;
}

function spaceWords(input: string): string {
	// If an lowercase letter precedes a uppercase letter, insert a space between them
	const [result] = input.gsub("(%l)(%u)", "%1 %2");
	return result;
}

const ToolbarItemComponent: React.FC<ToolbarItemProps> = (props) => {
	return (
		<frame
			BackgroundColor3={props.isEquipped ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(0, 0, 0)}
			BackgroundTransparency={0.5}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Size={UDim2.fromScale(0.25, 0.9)}
			LayoutOrder={props.order}
		>
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

			<uicorner key={"UICorner"} />

			<uistroke key={"UIStroke"} Thickness={3} />

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(0, 85, 127)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
					])
				}
				Rotation={90}
				Enabled={props.isEquipped}
			/>

			<textlabel
				AnchorPoint={new Vector2(0, 1)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font(
						"rbxasset://fonts/families/ComicNeueAngular.json",
						Enum.FontWeight.Bold,
						Enum.FontStyle.Normal,
					)
				}
				key={"ItemName"}
				Position={UDim2.fromScale(0, 1)}
				Size={UDim2.fromScale(1, 0.283)}
				Text={spaceWords(props.itemName)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={2} />
			</textlabel>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ItemImage"}
				Size={UDim2.fromScale(1, 1)}
				Image={props.icon}
				ZIndex={-1}
			/>

			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font(
						"rbxasset://fonts/families/ComicNeueAngular.json",
						Enum.FontWeight.Bold,
						Enum.FontStyle.Normal,
					)
				}
				key={"Order"}
				Position={UDim2.fromScale(0.1, 0)}
				Size={UDim2.fromScale(0.5, 0.4)}
				Text={tostring(props.order)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>
		</frame>
	);
};

export const Toolbar = () => {
	const [items, setItems] = React.useState<Array<ToolbarItemProps>>([]);

	const updateToolbar = () => {
		// Loop through backpack, character, and update the toolbar
	};

	const equipToolByOrder = (order: number) => {
		const item = items.find((i) => i.order === order);
		if (item?.tool) {
			const localPlayer = Players.LocalPlayer;
			const backpack = localPlayer.FindFirstChild("Backpack");
			const character = localPlayer.Character;

			if (!character || !backpack) return;

			// Unequip all tools except the one being equipped
			character
				.GetChildren()
				.filter((child) => child.IsA("Tool"))
				.forEach((child) => {
					if (child !== item.tool) {
						child.Parent = backpack;
					}
				});

			// Equip or unequip the selected tool
			if (item.tool.Parent === character) {
				item.tool.Parent = backpack;
			} else {
				item.tool.Parent = character;
			}

			// Update `isEquipped` without removing or re-adding the tool
			setItems((prev) =>
				prev.map((i) =>
					i.order === order
						? { ...i, isEquipped: item.tool.Parent === character }
						: { ...i, isEquipped: false },
				),
			);
		}
	};

	React.useEffect(() => {
		const trove = new Trove();

		trove.add(
			UserInputService.InputBegan.Connect((input, gameProcessed) => {
				if (!gameProcessed && input.UserInputType === Enum.UserInputType.Keyboard) {
					const keyOrder = input.KeyCode.Value - 48; // Keycode for 1 is 49
					if (keyOrder >= 1 && keyOrder <= items.size()) {
						equipToolByOrder(keyOrder);
					}
				}
			}),
		);

		// Cleanup connections
		return () => {
			trove.destroy();
		};
	}, [items]);

	const handleChildAdded = (child: Instance, equipped: boolean) => {
		if (child.IsA("Tool")) {
			const cfg = metalDetectorConfig[child.Name] || targetConfig[child.Name] || shovelConfig[child.Name];
			if (!cfg) return;

			setItems((prev) => {
				// Check if the tool already exists in the toolbar
				const existingItem = prev.find((item) => item.tool === child);

				if (existingItem) {
					// Update the `isEquipped` status if the tool already exists
					return prev.map((item) => (item.tool === child ? { ...item, isEquipped: equipped } : item));
				}

				// Assign the next available order, retaining consistent ordering
				const usedOrders = new Set(prev.map((item) => item.order));
				let nextOrder = 1;
				while (usedOrders.has(nextOrder)) {
					nextOrder++;
				}

				// Add the new tool with the next available order
				const newItem: ToolbarItemProps = {
					icon: cfg.itemImage,
					itemName: child.Name,
					isEquipped: equipped,
					order: nextOrder,
					tool: child,
				};

				return [...prev, newItem];
			});
		}
	};

	const handleToolRemoved = (tool: Instance) => {
		if (tool.IsA("Tool")) {
			setItems((prev) => prev.filter((item) => item.tool !== tool));
		}
	};

	React.useEffect(() => {
		const localPlayer = Players.LocalPlayer;
		const trove = new Trove();

		const setupListeners = (character: Model, backpack: Instance) => {
			trove.add(backpack.ChildAdded.Connect((child) => handleChildAdded(child, false)));
			trove.add(backpack.ChildRemoved.Connect(handleToolRemoved));
			trove.add(character.ChildAdded.Connect((child) => handleChildAdded(child, true)));
			trove.add(character.ChildRemoved.Connect(handleToolRemoved));

			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			if (humanoid) {
				trove.add(
					humanoid.Died.Connect(() => {
						trove.destroy();
						setItems([]);
					}),
				);
			}
			trove.add(
				localPlayer.CharacterRemoving.Connect(() => {
					trove.destroy();
					setItems([]);
				}),
			);
			trove.add(
				backpack.AncestryChanged.Connect(() => {
					trove.destroy();
					setItems([]);
				}),
			);
		};

		trove.add(
			localPlayer.CharacterAdded.Connect((character) => {
				const backpack = localPlayer.WaitForChild("Backpack");

				// Handle existing tools
				character.GetChildren().forEach((child) => handleChildAdded(child, true));
				backpack.GetChildren().forEach((child) => handleChildAdded(child, false));

				setupListeners(character, backpack);
			}),
		);

		const character = localPlayer.Character;
		const backpack = localPlayer.FindFirstChild("Backpack");

		if (character && backpack) {
			setupListeners(character, backpack);
		}

		return () => {
			trove.destroy();
		};
	}, [items]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 1)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Holder"}
			Position={UDim2.fromScale(0.5, 1)}
			Size={UDim2.fromScale(0.75, 0.159)}
		>
			<uilistlayout
				key={"UIListLayout"}
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.01, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			{items.map((item, index) => (
				<ToolbarItemComponent key={`ToolbarItem_${index}`} {...item} />
			))}
		</frame>
	);
};
