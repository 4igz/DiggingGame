import React, { Dispatch, useEffect } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { Item, ItemType, Rarity } from "shared/networkTypes";
import { separateWithCommas, spaceWords } from "shared/util/nameUtil";
import { ExitButton } from "./mainUi";

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
	buttonPosition: UDim2;
	backgroundImage: string;
}

const SelectionButtonComponent: React.FC<SelectionButtonProps> = (props) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [sz, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.95, 1.05];

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isPressed]);

	return (
		<imagebutton
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Shovel"}
			Position={props.buttonPosition}
			Selectable={false}
			Size={sz.map((s) => {
				return UDim2.fromScale(0.505 * s, 0.487 * s);
			})}
			Event={{
				MouseButton1Click: () => {
					props.setSelectedShop(props.title);
					setPressed(true);
					task.delay(0.1, () => setPressed(false));
				},
				MouseEnter: () => setIsHovered(true),
				MouseLeave: () => setIsHovered(false),
			}}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.backgroundImage}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Title"}
				Position={UDim2.fromScale(0.108, 0.701)}
				Size={UDim2.fromScale(0.78, 0.162)}
				Text={spaceWords(props.title)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={10}
			>
				<uistroke key={"UIStroke"} Thickness={3} />

				<uipadding key={"UIPadding"} />
			</textlabel>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.icon}
				key={"Icon"}
				Position={UDim2.fromScale(0.307, 0.133)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.362, 0.695)}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Label"}
				Position={UDim2.fromScale(0.108, 0.132)}
				Size={UDim2.fromScale(0.78, 0.193)}
				Text={props.subtitle}
				TextColor3={Color3.fromRGB(255, 234, 0)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
				ZIndex={10}
			>
				<uistroke key={"UIStroke"} Thickness={4} />
			</textlabel>
		</imagebutton>
	);
};

interface TopbarSelectionButtonProps {
	setSelectedShop: Dispatch<keyof typeof SHOP_MENUS>;
	selectedShop: keyof typeof SHOP_MENUS | "";
	name: keyof typeof SHOP_MENUS;
	icon: string;
	order: number;
}

const TopbarSelectionButtonComponent: React.FC<TopbarSelectionButtonProps> = (props) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [sz, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.95, 1.05];

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isPressed]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Position={UDim2.fromScale(-2.02e-7, -0.26)}
			Size={sz.map((s) => {
				return UDim2.fromScale(0.22 * s, 0.977 * s);
			})}
			LayoutOrder={props.order}
			AnchorPoint={new Vector2(0.5, 0.5)}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={
					props.selectedShop === props.name ? "rbxassetid://109250907266323" : "rbxassetid://105250247379697"
				}
				key={"Shovel Tab Btn"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Event={{
					MouseButton1Click: () => {
						props.setSelectedShop(props.name);
						setPressed(true);
						task.delay(0.1, () => setPressed(false));
					},
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => setIsHovered(false),
				}}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={props.icon}
					key={"Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.7, 0.7)}
				/>
			</imagebutton>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
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
	itemType: Exclude<Exclude<Exclude<ItemType, "Target">, "Boats">, "Potions">;
	price: number;
	order: number;
}

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemName, stats, itemType, owned } = props;
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [sz, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.95, 1.05];

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isPressed]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			LayoutOrder={props.order}
			key={"Item"}
			Position={UDim2.fromScale(0.601, 0)}
			Size={sz.map((s) => {
				return UDim2.fromScale(0.329 * s, 1.01 * s);
			})}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={
					gameConstants.RARITY_BACKGROUND_IMAGES[props.rarity] ??
					gameConstants.RARITY_BACKGROUND_IMAGES["Common"]
				}
				key={"Item Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 0.949)}
				Event={{
					MouseButton1Click: () => {
						Events.buyItem(itemType, itemName);
						setPressed(true);
						task.delay(0.1, () => setPressed(false));
					},
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => setIsHovered(false),
				}}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.748} />

				<textlabel
					Text={`$${separateWithCommas(props.price)}`}
					BackgroundTransparency={1}
					Font={Enum.Font.BuilderSansBold}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Size={UDim2.fromScale(0.5, 0.1)}
					Position={UDim2.fromScale(0.5, 0.95)}
					TextColor3={Color3.fromRGB(255, 173, 0)}
					TextScaled={true}
					ZIndex={16}
					Visible={!owned}
				>
					<uistroke Thickness={2} Color={Color3.fromRGB(255, 255, 255)} />
				</textlabel>

				<frame
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={owned ? 0.75 : 1}
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Overlay"}
					Visible={owned}
					ZIndex={15}
				>
					<textlabel
						Text={"OWNED"}
						Font={Enum.Font.BuilderSansBold}
						TextScaled={true}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						Size={UDim2.fromScale(0.9, 0.9)}
						BackgroundTransparency={1}
						Position={UDim2.fromScale(0.5, 0.5)}
						AnchorPoint={new Vector2(0.5, 0.5)}
					>
						<uistroke Thickness={2} />
					</textlabel>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0923, 0.069)}
					Size={UDim2.fromScale(0.472, 0.374)}
					ZIndex={2}
				>
					{stats.map((stat) => {
						return (
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={stat.key}
								Size={UDim2.fromScale(0.902, 0.27)}
							>
								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									Padding={new UDim(0.1, 0)}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={stat.icon}
									key={"Icon"}
									Position={UDim2.fromScale(0.287, 0.0263)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.3, 0.947)}
								/>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									FontFace={
										new Font(
											"rbxassetid://16658221428",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									key={"Amount"}
									Position={UDim2.fromScale(0.808, 0.382)}
									Size={UDim2.fromScale(1.02, 0.763)}
									Text={`x${string.format("%.1f", stat.value)}`}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
									TextXAlignment={Enum.TextXAlignment.Left}
								>
									<uistroke key={"UIStroke"} Thickness={2} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.0198, 0)}
										PaddingTop={new UDim(0.0198, 0)}
									/>
								</textlabel>
							</frame>
						);
					})}

					<uilistlayout
						key={"UIListLayout"}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Information"}
					Position={UDim2.fromScale(0.0674, 0.602)}
					Size={UDim2.fromScale(0.852, 0.318)}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Item Info"}
						Position={UDim2.fromScale(0.0292, 0.458)}
						Size={UDim2.fromScale(0.958, 0.533)}
						ZIndex={2}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Rarity"}
							Position={UDim2.fromScale(0.508, 0.26)}
							Size={UDim2.fromScale(1.02, 0.438)}
							Text={props.rarity}
							TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={2} />
						</textlabel>

						<uilistlayout
							key={"UIListLayout"}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Bottom}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							LayoutOrder={1}
							key={"Name"}
							Position={UDim2.fromScale(0.499, 0.709)}
							Size={UDim2.fromScale(1.02, 0.521)}
							Text={spaceWords(props.itemName)}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={2} />
						</textlabel>
					</frame>

					{/* <frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Rating"}
						Position={UDim2.fromScale(0.586, 0.13)}
						Size={UDim2.fromScale(0.4, 0.333)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Right}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://92942300911296"}
							key={"Star"}
							Position={UDim2.fromScale(0.768, 0)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.333, 0.8)}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://92942300911296"}
							key={"Star"}
							Position={UDim2.fromScale(0.768, 0)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.333, 0.8)}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://92942300911296"}
							key={"Star"}
							Position={UDim2.fromScale(0.768, 0)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.333, 0.8)}
						/>
					</frame> */}
				</frame>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={props.image}
					key={"ItemRender"}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				/>
			</imagebutton>
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
	const [shopContent, setShopContent] = React.useState<Array<Exclude<Item, { type: "Potions" }> & { owned: boolean }>>([]);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const menuRef = React.createRef<Frame>();

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
					content
						.filter((item) => item.type !== "Potions")
						.map((item) => {
							const foundItem = items.find((i) => i.name === item.name);
							if (foundItem) {
								return { ...item, owned: true };
							}
							return item;
						}),
				);
			});
		} else if (selectedShop === "Store") {
			props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
		}

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
			popInMotion.spring(UDim2.fromScale(0.727, 0.606), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
			setSelectedShop("");
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Shop Sub-Menu"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={popInSz}
			Visible={visible}
			ref={menuRef}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://133515423550411"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			/>

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.SHOP_UI}
				menuRefToClose={menuRef}
				onClick={() => {
					setSelectedShop("");
				}}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Select Menu Frame"}
				Position={UDim2.fromScale(0.037, 0.0705)}
				Size={UDim2.fromScale(0.933, 0.853)}
				Visible={selectedShop === ""}
			>
				<SelectionButtonComponent
					setSelectedShop={setSelectedShop}
					title={"Shovels"}
					subtitle={"NEW"}
					icon={"rbxassetid://101307691874432"}
					buttonPosition={UDim2.fromScale(0.261, 0.254)}
					backgroundImage="rbxassetid://88271653883643"
				/>
				<SelectionButtonComponent
					setSelectedShop={setSelectedShop}
					title={"MetalDetectors"}
					subtitle={"NEW"}
					icon={"rbxassetid://119544070088143"}
					buttonPosition={UDim2.fromScale(0.728, 0.254)}
					backgroundImage="rbxassetid://118545014651736"
				/>
				<SelectionButtonComponent
					setSelectedShop={setSelectedShop}
					title={"Store"}
					subtitle={"NEW"}
					icon={"rbxassetid://82530092684621"}
					buttonPosition={UDim2.fromScale(0.484, 0.758)}
					backgroundImage="rbxassetid://107941667988653"
				/>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Seller Profile"}
				Position={UDim2.fromScale(-0.0621, -0.104)}
				Size={UDim2.fromScale(0.165, 0.286)}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://101474809776872"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Profile"}
						Position={UDim2.fromScale(0.5, 0.446)}
						Size={UDim2.fromScale(0.717, 0.717)}
						Image={"rbxassetid://77754309050946"}
					/>
				</imagelabel>
			</frame>

			<textlabel
				key={"TextLabel"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Position={UDim2.fromScale(0.103, -0.0332)}
				Size={UDim2.fromScale(0.239, 0.104)}
				Text={"Magia's Shop"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={5.3} />

				<uipadding
					key={"UIPadding"}
					PaddingBottom={new UDim(0.02, 0)}
					PaddingLeft={new UDim(0.0025, 0)}
					PaddingRight={new UDim(0.0025, 0)}
					PaddingTop={new UDim(0.02, 0)}
				/>
			</textlabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />

			<scrollingframe
				key={"ScrollingFrame"}
				Active={true}
				AutomaticCanvasSize={Enum.AutomaticSize.X}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				CanvasSize={new UDim2()}
				Position={UDim2.fromScale(0.0394, 0.183)}
				ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
				ScrollBarImageTransparency={1}
				ScrollBarThickness={0}
				ScrollingDirection={Enum.ScrollingDirection.X}
				Size={UDim2.fromScale(0.925, 0.739)}
				Visible={selectedShop !== ""}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				{shopContent.map((item) => {
					const stats: ItemStat[] = [];

					if (item.type === "MetalDetectors") {
						stats.push(
							{ key: "detectionDistance", value: item.strength, icon: "rbxassetid://136640572681412" },
							{ key: "luck", value: item.luck, icon: "rbxassetid://85733831609212" },
						);
					} else if (item.type === "Shovels") {
						stats.push({
							key: "strength",
							value: item.strengthMult,
							icon: "rbxassetid://100052274681629",
						});
					} else if (item.type === "Target") {
						return;
					}

					return (
						<GenericItemComponent
							itemName={item.name}
							rarity={item.rarityType}
							stats={stats}
							image={item.itemImage}
							owned={item.owned}
							order={item.price ?? 0}
							itemType={item.type}
							price={item.price}
						/>
					);
				})}
			</scrollingframe>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Top Navigation"}
				Position={UDim2.fromScale(0.1, 0.025)}
				Size={UDim2.fromScale(0.8, 0.18)}
				Visible={selectedShop !== ""}
			>
				<TopbarSelectionButtonComponent
					selectedShop={selectedShop}
					setSelectedShop={setSelectedShop}
					name={"MetalDetectors"}
					icon={"rbxassetid://119544070088143"}
					order={1}
				/>
				<TopbarSelectionButtonComponent
					selectedShop={selectedShop}
					setSelectedShop={setSelectedShop}
					name={"Shovels"}
					icon={"rbxassetid://101307691874432"}
					order={2}
				/>
				<TopbarSelectionButtonComponent
					selectedShop={selectedShop}
					setSelectedShop={setSelectedShop}
					name={"Store"}
					icon={"rbxassetid://82530092684621"}
					order={3}
				/>

				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Right}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
			</frame>
		</frame>
	);
};
