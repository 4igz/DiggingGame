import React, { Dispatch } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { Item, ItemType, Rarity } from "shared/networkTypes";
import { spaceWords } from "shared/util/nameUtil";

const SHOP_MENUS = {
	MetalDetectors: "Detectors",
	Store: "Store",
	Shovels: "Shovels",
};

interface SelectionButtonProps {
	setSelectedShop: Dispatch<keyof typeof SHOP_MENUS>;
	title: keyof typeof SHOP_MENUS;
	subtitle: string;
	icon: string;
}

const SelectionButtonComponent: React.FC<SelectionButtonProps> = (props) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(200, 202, 218)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Segment"}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.12, 0)} />

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
				key={"Title"}
				Position={UDim2.fromScale(0.0672, 0.681)}
				Size={UDim2.fromScale(0.707, 0.266)}
				Text={spaceWords(props.title)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.icon}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Crop}
				Size={UDim2.fromScale(0.512, 0.739)}
				ZIndex={0}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/AccanthisADFStd.json")}
				key={"SubTitle"}
				Position={UDim2.fromScale(0.216, 0.0866)}
				Size={UDim2.fromScale(0.707, 0.223)}
				Text={props.subtitle}
				TextColor3={Color3.fromRGB(253, 223, 0)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<textbutton
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={0.999}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/SourceSansPro.json")}
				key={"ButtonOverlay"}
				Size={UDim2.fromScale(1, 1)}
				Text={""}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextScaled={true}
				TextWrapped={true}
				Event={{
					MouseButton1Click: () => {
						props.setSelectedShop(props.title);
					},
				}}
			/>
		</frame>
	);
};

interface TopbarSelectionButtonProps {
	setSelectedShop: Dispatch<keyof typeof SHOP_MENUS>;
	name: keyof typeof SHOP_MENUS;
	icon: string;
}

const TopbarSelectionButtonComponent: React.FC<TopbarSelectionButtonProps> = (props) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(194, 196, 212)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Segment"}
			Position={UDim2.fromScale(0.763, 0)}
			Size={UDim2.fromScale(0.237, 1)}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

			<uistroke key={"UIStroke"} Thickness={3} />

			<imagebutton
				key={"ImageButton"}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Image={props.icon}
				Event={{
					MouseButton1Click: () => {
						props.setSelectedShop(props.name);
					},
				}}
			/>
		</frame>
	);
};

interface ItemStat {
	key: string;
	value: string | number;
	icon: string; // Icon emoji or asset ID
}

interface GenericItemProps {
	itemName: string;
	rarity: Rarity;
	stats: ItemStat[]; // List of stats to display
	image: string;
	owned: boolean;
	itemType: Exclude<ItemType, "Target">;
	price: number;
	order: number;
}

const ShopItemComponent: React.FC<GenericItemProps> = ({
	itemName,
	rarity,
	stats,
	image,
	owned,
	order,
	itemType,
	price,
}) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(203, 138, 58)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Size={UDim2.fromScale(0.05, 0.894)}
			LayoutOrder={order}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				key={"Main"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(0.916, 0.937)}
			>
				{/* Checkerboard Pattern */}
				<imagelabel
					BackgroundTransparency={1}
					Image={"http://www.roblox.com/asset/?id=17497141137"}
					ImageColor3={Color3.fromRGB(0, 0, 0)}
					ImageTransparency={0.98}
					ScaleType={Enum.ScaleType.Tile}
					Size={UDim2.fromScale(1, 1)}
					TileSize={UDim2.fromOffset(45, 45)}
				/>
				{/* Stats Section */}
				<frame
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.5, 0)}
					Size={UDim2.fromScale(1, 0.334)}
					key={"StatsList"}
				>
					<uilistlayout
						key={"UIListLayout"}
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{stats.map((stat) => (
						<textlabel
							BackgroundTransparency={1}
							FontFace={
								new Font(
									"rbxasset://fonts/families/Arial.json",
									Enum.FontWeight.Bold,
									Enum.FontStyle.Italic,
								)
							}
							Size={UDim2.fromScale(0.829, 0.323)}
							Text={`x${string.format("%.1f", stat.value)} ${stat.icon}`}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							key={stat.key}
						>
							<uistroke key={"UIStroke"} Thickness={2} />
						</textlabel>
					))}

					<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.04, 0)} PaddingTop={new UDim(0.02, 0)} />
				</frame>
				{/* Rarity and Item Name */}
				<textlabel
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.0537, 0.78)}
					Size={UDim2.fromScale(0.888, 0.0781)}
					Text={rarity}
					TextColor3={gameConstants.RARITY_COLORS[rarity]}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Right}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>
				<textlabel
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.0537, 0.861)}
					Size={UDim2.fromScale(0.888, 0.108)}
					Text={spaceWords(itemName)}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Right}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>
				{/* Item Preview */}
				<imagelabel Image={image} Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} ZIndex={0} />

				<textlabel
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxasset://fonts/families/SourceSansPro.json")}
					key={"Price"}
					Position={UDim2.fromScale(0, 1)}
					Size={UDim2.fromScale(0.4, 0.4)}
					Text={`$${price}`}
					TextColor3={Color3.fromRGB(255, 201, 74)}
					TextScaled={true}
					TextWrapped={true}
					Visible={!owned}
				>
					<uistroke key={"UIStroke"} Thickness={2} />
				</textlabel>

				<textbutton
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={owned ? 0.65 : 1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://12187373592")}
					Size={UDim2.fromScale(1, 1)}
					Text={"OWNED"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextTransparency={owned ? 0 : 1}
					Event={{
						MouseButton1Click: () => {
							if (!owned) {
								Events.buyItem(itemType, itemName);
							}
						},
					}}
				/>
			</frame>
		</frame>
	);
};

interface ShopProps {
	visible: boolean;
	uiController: UiController;
}

export const ShopComponent: React.FC<ShopProps> = (props) => {
	const [visible, setVisible] = React.useState(props.visible);
	const [selectedShop, setSelectedShop] = React.useState<keyof typeof SHOP_MENUS | "">("");
	const [shopContent, setShopContent] = React.useState<Array<Item & { owned: boolean }>>([]);
	const [pos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.6));

	React.useEffect(() => {
		if (selectedShop === "") {
			setShopContent([]);
		} else if (selectedShop === "MetalDetectors" || selectedShop === "Shovels") {
			const shopConfig = gameConstants.SHOP_CONFIGS[selectedShop];
			const content: Array<Item & { owned: boolean }> = [];

			for (const [itemName, itemConfig] of pairs(shopConfig)) {
				content.push({
					...itemConfig,
					owned: false,
					type: selectedShop,
					name: itemName,
				} as Item & { owned: boolean });
			}

			Functions.getInventory(selectedShop).then(([_, items]) => {
				setShopContent(
					content.map((item) => {
						const foundItem = items.find((i) => i.name === item.name);
						if (foundItem) {
							return { ...item, owned: true };
						}
						return item;
					}),
				);
			});
		} else if (selectedShop === "Store") {
		}
	}, [selectedShop]);

	React.useEffect(() => {
		const connection = Events.updateInventory.connect((inventoryType, [_, inventory]) => {
			if (inventoryType !== selectedShop) return; // Ensure the event only updates the correct shop
			setShopContent((prev) =>
				prev.map((item) => {
					const foundItem = inventory.find((i) => i.name === item.name);
					return foundItem ? { ...item, owned: true } : item;
				}),
			);
		});

		// Cleanup the event listener on component unmount
		return () => {
			connection.Disconnect();
		};
	}, [selectedShop]);

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			posMotion.spring(UDim2.fromScale(0.5, 0.5), springs.bubbly);
		} else {
			posMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={0.6}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"MiniShop"}
			Position={pos}
			Size={UDim2.fromScale(0.402, 0.514)}
			Visible={visible}
		>
			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(102, 109, 119)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(140, 149, 163)),
					])
				}
				Rotation={-90}
			/>

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />

			<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

			<frame
				BackgroundColor3={Color3.fromRGB(240, 18, 25)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ExitButton"}
				Position={UDim2.fromScale(0.944, -0.0488)}
				Size={UDim2.fromScale(0.0836, 0.135)}
				ZIndex={2}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />

				<uicorner key={"UICorner"} CornerRadius={new UDim(0.22, 0)} />

				<textbutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={
						new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
					}
					key={"ButtonActual"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Text={"X"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					ZIndex={3}
					Event={{
						MouseButton1Click: () => {
							props.uiController.closeUi(gameConstants.SHOP_UI);
						},
					}}
				>
					<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.16, 0)} PaddingTop={new UDim(0.16, 0)} />
				</textbutton>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ProfilePicture"}
				Position={UDim2.fromScale(-0.0533, -0.0905)}
				Size={UDim2.fromScale(0.134, 0.217)}
				ZIndex={2}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

				<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(102, 109, 119)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(140, 149, 163)),
						])
					}
					Rotation={-90}
				/>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.7)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"http://www.roblox.com/asset/?id=75094056849212"}
					Position={UDim2.fromScale(0.5, 0.7)}
					Size={UDim2.fromScale(1.34, 1.34)}
					ZIndex={2}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />
				</imagelabel>
			</frame>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font(
						"rbxasset://fonts/families/AccanthisADFStd.json",
						Enum.FontWeight.Bold,
						Enum.FontStyle.Normal,
					)
				}
				key={"Title"}
				Position={UDim2.fromScale(0.122, -0.0599)}
				Size={UDim2.fromScale(0.457, 0.12)}
				Text={"Bob's Shop"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={2}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />
			</textlabel>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ButtonSelection"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Visible={selectedShop === ""}
				ZIndex={5}
			>
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Grid"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(0.818, 0.811)}
				>
					<uigridlayout
						key={"UIGridLayout"}
						CellPadding={UDim2.fromScale(0.025, 0.04)}
						CellSize={UDim2.fromScale(0.45, 0.45)}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<SelectionButtonComponent
						setSelectedShop={setSelectedShop}
						title={"MetalDetectors"}
						subtitle={"Find treasure easier!"}
						icon={""}
					/>
					<SelectionButtonComponent
						setSelectedShop={setSelectedShop}
						title={"Shovels"}
						subtitle={"Dig faster!"}
						icon={""}
					/>
				</frame>
			</frame>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Shop"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"ButtonList"}
					Position={UDim2.fromScale(0.526, -0.051)}
					Size={UDim2.fromScale(0.389, 0.151)}
					ZIndex={5}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Right}
						Padding={new UDim(0.04, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<TopbarSelectionButtonComponent
						setSelectedShop={setSelectedShop}
						name={"MetalDetectors"}
						icon={""}
					/>
					<TopbarSelectionButtonComponent setSelectedShop={setSelectedShop} name={"Shovels"} icon={""} />
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Main"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Store"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						Visible={selectedShop === SHOP_MENUS.Store}
						ZIndex={0}
					>
						<scrollingframe
							key={"ScrollingFrame"}
							Active={true}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(27, 42, 53)}
							BorderSizePixel={0}
							BottomImage={""}
							CanvasSize={UDim2.fromScale(5, 0)}
							Position={UDim2.fromScale(0.0267, -0.00105)}
							ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
							ScrollBarImageTransparency={0.2}
							ScrollBarThickness={6}
							Size={UDim2.fromScale(0.973, 1)}
							TopImage={""}
							ZIndex={0}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(27, 42, 53)}
								BorderSizePixel={0}
								key={"Content"}
								Size={UDim2.fromScale(2, 1)}
								ZIndex={0}
							>
								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									Padding={new UDim(0.0025, 0)}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>

								<frame
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									key={"Segment"}
									Position={UDim2.fromScale(0, 0.025)}
									Size={UDim2.fromScale(0.0552, 0.92)}
									ZIndex={0}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

									<uistroke key={"UIStroke"} Color={Color3.fromRGB(30, 78, 124)} Thickness={5} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(0.317, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(28, 187, 255)),
											])
										}
										Rotation={-45}
									/>

									<imagelabel
										key={"ImageLabel"}
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"}
										Position={UDim2.fromScale(0.466, 0.023)}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(0.504, 0.487)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />
									</imagelabel>

									<frame
										BackgroundColor3={Color3.fromRGB(68, 236, 33)}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										key={"ClaimButton"}
										Position={UDim2.fromScale(0.562, 0.831)}
										Size={UDim2.fromScale(0.407, 0.135)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

										<uistroke key={"UIStroke"} Thickness={3} Transparency={0.2} />

										<textbutton
											key={"TextButton"}
											AnchorPoint={new Vector2(0.5, 0.5)}
											BackgroundColor3={Color3.fromRGB(255, 255, 255)}
											BackgroundTransparency={1}
											BorderColor3={Color3.fromRGB(0, 0, 0)}
											BorderSizePixel={0}
											FontFace={
												new Font(
													"rbxasset://fonts/families/Arial.json",
													Enum.FontWeight.Bold,
													Enum.FontStyle.Normal,
												)
											}
											Position={UDim2.fromScale(0.5, 0.5)}
											Size={UDim2.fromScale(1, 1)}
											Text={" 99"}
											TextColor3={Color3.fromRGB(255, 255, 255)}
											TextScaled={true}
											TextWrapped={true}
										>
											<uistroke key={"UIStroke"} Thickness={3} />

											<uipadding
												key={"UIPadding"}
												PaddingBottom={new UDim(0.06, 0)}
												PaddingTop={new UDim(0.12, 0)}
											/>
										</textbutton>
									</frame>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Italic,
											)
										}
										key={"SegmentTitle"}
										Position={UDim2.fromScale(0.0471, 0.0507)}
										Size={UDim2.fromScale(0.368, 0.404)}
										Text={"Adds +1 BAIT to every throw!"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Normal,
											)
										}
										key={"SubTitle"}
										Position={UDim2.fromScale(0.0466, 0.831)}
										Size={UDim2.fromScale(0.383, 0.13)}
										Text={"Expires after 12h of play"}
										TextColor3={Color3.fromRGB(253, 223, 0)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
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
										key={"Title"}
										Position={UDim2.fromScale(0.608, 0.754)}
										Size={UDim2.fromScale(0.315, 0.0572)}
										Text={"50% OFF"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(60, 160, 248)} Thickness={3} />
									</textlabel>

									<imagelabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"http://www.roblox.com/asset/?id=16228703358"}
										ImageColor3={Color3.fromRGB(0, 0, 0)}
										ImageTransparency={0.95}
										key={"BackDrop"}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(1, 1)}
										ZIndex={0}
									/>

									<imagelabel
										key={"ImageLabel"}
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"http://www.roblox.com/asset/?id=75094056849212"}
										ImageTransparency={0.2}
										Position={UDim2.fromScale(0, 0.419)}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(0.608, 0.581)}
										ZIndex={0}
									/>
								</frame>

								<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.0005, 0)} />

								<frame
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									key={"Segment"}
									Position={UDim2.fromScale(0, 0.025)}
									Size={UDim2.fromScale(0.0552, 0.92)}
									ZIndex={0}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

									<uistroke key={"UIStroke"} Color={Color3.fromRGB(30, 78, 124)} Thickness={5} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(0.317, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(28, 187, 255)),
											])
										}
										Rotation={-45}
									/>

									<imagelabel
										key={"ImageLabel"}
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"}
										Position={UDim2.fromScale(0.466, 0.023)}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(0.504, 0.487)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />
									</imagelabel>

									<frame
										BackgroundColor3={Color3.fromRGB(68, 236, 33)}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										key={"ClaimButton"}
										Position={UDim2.fromScale(0.562, 0.831)}
										Size={UDim2.fromScale(0.407, 0.135)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

										<uistroke key={"UIStroke"} Thickness={3} Transparency={0.2} />

										<textbutton
											key={"TextButton"}
											AnchorPoint={new Vector2(0.5, 0.5)}
											BackgroundColor3={Color3.fromRGB(255, 255, 255)}
											BackgroundTransparency={1}
											BorderColor3={Color3.fromRGB(0, 0, 0)}
											BorderSizePixel={0}
											FontFace={
												new Font(
													"rbxasset://fonts/families/Arial.json",
													Enum.FontWeight.Bold,
													Enum.FontStyle.Normal,
												)
											}
											Position={UDim2.fromScale(0.5, 0.5)}
											Size={UDim2.fromScale(1, 1)}
											Text={" 99"}
											TextColor3={Color3.fromRGB(255, 255, 255)}
											TextScaled={true}
											TextWrapped={true}
										>
											<uistroke key={"UIStroke"} Thickness={3} />

											<uipadding
												key={"UIPadding"}
												PaddingBottom={new UDim(0.06, 0)}
												PaddingTop={new UDim(0.12, 0)}
											/>
										</textbutton>
									</frame>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Italic,
											)
										}
										key={"SegmentTitle"}
										Position={UDim2.fromScale(0.0471, 0.0507)}
										Size={UDim2.fromScale(0.368, 0.404)}
										Text={"Adds +1 BAIT to every throw!"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Normal,
											)
										}
										key={"SubTitle"}
										Position={UDim2.fromScale(0.0466, 0.831)}
										Size={UDim2.fromScale(0.383, 0.13)}
										Text={"Expires after 12h of play"}
										TextColor3={Color3.fromRGB(253, 223, 0)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
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
										key={"Title"}
										Position={UDim2.fromScale(0.608, 0.754)}
										Size={UDim2.fromScale(0.315, 0.0572)}
										Text={"50% OFF"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(60, 160, 248)} Thickness={3} />
									</textlabel>

									<imagelabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"http://www.roblox.com/asset/?id=16228703358"}
										ImageColor3={Color3.fromRGB(0, 0, 0)}
										ImageTransparency={0.95}
										key={"BackDrop"}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(1, 1)}
										ZIndex={0}
									/>
								</frame>

								<frame
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									key={"Segment"}
									Position={UDim2.fromScale(0, 0.025)}
									Size={UDim2.fromScale(0.0552, 0.92)}
									ZIndex={0}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(0.04, 0)} />

									<uistroke key={"UIStroke"} Color={Color3.fromRGB(30, 78, 124)} Thickness={5} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(0.317, Color3.fromRGB(71, 224, 255)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(28, 187, 255)),
											])
										}
										Rotation={-45}
									/>

									<imagelabel
										key={"ImageLabel"}
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"}
										Position={UDim2.fromScale(0.466, 0.023)}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(0.504, 0.487)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />
									</imagelabel>

									<frame
										BackgroundColor3={Color3.fromRGB(68, 236, 33)}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										key={"ClaimButton"}
										Position={UDim2.fromScale(0.562, 0.831)}
										Size={UDim2.fromScale(0.407, 0.135)}
									>
										<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

										<uistroke key={"UIStroke"} Thickness={3} Transparency={0.2} />

										<textbutton
											key={"TextButton"}
											AnchorPoint={new Vector2(0.5, 0.5)}
											BackgroundColor3={Color3.fromRGB(255, 255, 255)}
											BackgroundTransparency={1}
											BorderColor3={Color3.fromRGB(0, 0, 0)}
											BorderSizePixel={0}
											FontFace={
												new Font(
													"rbxasset://fonts/families/Arial.json",
													Enum.FontWeight.Bold,
													Enum.FontStyle.Normal,
												)
											}
											Position={UDim2.fromScale(0.5, 0.5)}
											Size={UDim2.fromScale(1, 1)}
											Text={" 99"}
											TextColor3={Color3.fromRGB(255, 255, 255)}
											TextScaled={true}
											TextWrapped={true}
										>
											<uistroke key={"UIStroke"} Thickness={3} />

											<uipadding
												key={"UIPadding"}
												PaddingBottom={new UDim(0.06, 0)}
												PaddingTop={new UDim(0.12, 0)}
											/>
										</textbutton>
									</frame>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Italic,
											)
										}
										key={"SegmentTitle"}
										Position={UDim2.fromScale(0.0471, 0.0507)}
										Size={UDim2.fromScale(0.368, 0.404)}
										Text={"Adds +1 BAIT to every throw!"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										FontFace={
											new Font(
												"rbxasset://fonts/families/AccanthisADFStd.json",
												Enum.FontWeight.Bold,
												Enum.FontStyle.Normal,
											)
										}
										key={"SubTitle"}
										Position={UDim2.fromScale(0.0466, 0.831)}
										Size={UDim2.fromScale(0.383, 0.13)}
										Text={"Expires after 12h of play"}
										TextColor3={Color3.fromRGB(253, 223, 0)}
										TextScaled={true}
										TextWrapped={true}
										TextXAlignment={Enum.TextXAlignment.Left}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
									</textlabel>

									<textlabel
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
										key={"Title"}
										Position={UDim2.fromScale(0.608, 0.754)}
										Size={UDim2.fromScale(0.315, 0.0572)}
										Text={"50% OFF"}
										TextColor3={Color3.fromRGB(255, 255, 255)}
										TextScaled={true}
										TextWrapped={true}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(60, 160, 248)} Thickness={3} />
									</textlabel>

									<imagelabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"http://www.roblox.com/asset/?id=16228703358"}
										ImageColor3={Color3.fromRGB(0, 0, 0)}
										ImageTransparency={0.95}
										key={"BackDrop"}
										ScaleType={Enum.ScaleType.Crop}
										Size={UDim2.fromScale(1, 1)}
										ZIndex={0}
									/>
								</frame>
							</frame>
						</scrollingframe>
					</frame>

					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Shop"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						ZIndex={0}
						Visible={selectedShop !== "" && selectedShop !== SHOP_MENUS.Store}
					>
						<scrollingframe
							key={"ScrollingFrame"}
							Active={true}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(27, 42, 53)}
							BorderSizePixel={0}
							BottomImage={""}
							AutomaticCanvasSize={Enum.AutomaticSize.X}
							// CanvasSize={UDim2.fromScale(1, 0)}
							ScrollingDirection={Enum.ScrollingDirection.X}
							Position={UDim2.fromScale(0.0177, -9.64e-8)}
							ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
							ScrollBarImageTransparency={0.2}
							ScrollBarThickness={10}
							Size={UDim2.fromScale(0.982, 1)}
							TopImage={""}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(27, 42, 53)}
								BorderSizePixel={0}
								key={"Content"}
								Size={UDim2.fromScale(8.14, 1)}
							>
								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									Padding={new UDim(0.0008, 0)}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>

								{shopContent.map((item) => {
									const stats: ItemStat[] = [];

									if (item.type === "MetalDetectors") {
										stats.push(
											{ key: "detectionDistance", value: item.strength, icon: "🧲" },
											{ key: "luck", value: item.luck, icon: "🍀" },
										);
									} else if (item.type === "Shovels") {
										stats.push({
											key: "strength",
											value: item.strengthMult,
											icon: "💪",
										});
									} else if (item.type === "Target") {
										return;
									}

									// Push to new inventory
									return (
										<ShopItemComponent
											itemName={item.name}
											rarity={item.rarityType}
											stats={stats}
											image={item.itemImage}
											owned={item.owned}
											order={item.shopOrder ?? 0}
											itemType={item.type}
											price={item.price}
										/>
									);
								})}
							</frame>
						</scrollingframe>
					</frame>
				</frame>
			</frame>
		</frame>
	);
};
