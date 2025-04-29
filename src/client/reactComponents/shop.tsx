//!optimize 2
import React, { Dispatch, useEffect, useState } from "@rbxts/react";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { Item, ItemType, Rarity } from "shared/networkTypes";
import { separateWithCommas, shortenNumber, spaceWords } from "shared/util/nameUtil";
import { ExitButton } from "./inventory";
import Object from "@rbxts/object-utils";
import { NetworkingFunctionError } from "@flamework/networking";
import { usePx } from "client/hooks/usePx";
import { RunService } from "@rbxts/services";
import { AnimatedButton } from "./buttons";
import { Signals } from "shared/signals";

const SHOP_MENUS = {
	MetalDetectors: "Detectors",
	Store: "Store",
	Shovels: "Shovels",
};

const outgoingShopRequests = new Array<Promise<void>>();

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
	const [bgColor, bgColorMotion] = useMotion(Color3.fromRGB(255, 255, 255));

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
		if (isHovered) {
			bgColorMotion.spring(Color3.fromRGB(255, 255, 255).Lerp(new Color3(), 0.3));
			sizeMotion.spring(1.05, springs.responsive);
		} else {
			bgColorMotion.spring(Color3.fromRGB(255, 255, 255).Lerp(new Color3(), 0));
			sizeMotion.spring(1, springs.responsive);
		}
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
			Size={UDim2.fromScale(0.126, 0.977)}
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
				ImageColor3={bgColor}
				key={"Shovel Tab Btn"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={sz.map((s) => {
					return UDim2.fromScale(1 * s, 1 * s);
				})}
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
	itemType: Exclude<ItemType, "Target" | "Boats" | "Potions">;
	price: number;
	order: number;
	obtainLocation?: string;
}

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemName, stats, itemType, owned } = props;

	const px = usePx();

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			LayoutOrder={props.order}
			key={"Item"}
			Position={UDim2.fromScale(0.601, 0)}
			Size={UDim2.fromScale(0.329, 1.01)}
		>
			<AnimatedButton
				key={"Item Container"}
				position={UDim2.fromScale(0.5, 0.5)}
				size={UDim2.fromScale(1, 0.95)}
				scales={new NumberRange(0.98, 1.02)}
				onClick={() => {
					if (owned) {
						Signals.invalidAction.Fire("You already own this!");
						return;
					}
					Events.buyItem(itemType, itemName);
				}}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.748} />
				<imagelabel
					Image={gameConstants.RARITY_BACKGROUND_IMAGE}
					ImageColor3={gameConstants.RARITY_COLORS[props.rarity]}
					BackgroundTransparency={1}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				/>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0922, 0.0714)}
					Size={UDim2.fromScale(0.446, 0.5)}
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
											"rbxassetid://11702779409",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									key={"Amount"}
									Position={UDim2.fromScale(0.808, 0.382)}
									Size={UDim2.fromScale(1.02, 0.763)}
									Text={`x${shortenNumber(tonumber(stat.value) ?? 0)}`}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									// TextScaled={true}
									// TextWrapped={true}
									TextSize={px(30)}
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
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Rarity"}
							Position={UDim2.fromScale(0.508, 0.26)}
							Size={UDim2.fromScale(1.02, 0.438)}
							Text={props.rarity}
							TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
							// TextScaled={true}
							// TextWrapped={true}
							TextSize={px(25)}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={1.9} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Rarity"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={props.rarity}
								TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
								// TextScaled={true}
								// TextWrapped={true}
								TextSize={px(25)}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={1.9} />
							</textlabel>
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
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							LayoutOrder={1}
							key={"Name"}
							Position={UDim2.fromScale(0.499, 0.709)}
							Size={UDim2.fromScale(1.02, 0.521)}
							Text={`${spaceWords(props.itemName)}`}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							// TextScaled={true}
							// TextWrapped={true}
							TextSize={px(25)}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								LayoutOrder={1}
								key={"Name"}
								Position={UDim2.fromScale(0.5, 0.45)}
								Size={UDim2.fromScale(1, 1)}
								Text={`${spaceWords(props.itemName)}`}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								// TextScaled={true}
								// TextWrapped={true}
								TextSize={px(25)}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>
						</textlabel>
					</frame>
				</frame>

				<frame
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.45}
					key={".$Owned Overlay"}
					Size={UDim2.fromScale(1, 1)}
					Visible={owned}
					ZIndex={15}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://114978900536475"}
						key={"Check"}
						Position={UDim2.fromScale(0.53, 0.376)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.335, 0.208)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
						key={"1"}
						Position={UDim2.fromScale(0.53, 0.538)}
						Size={UDim2.fromScale(0.9, 0.9)}
						Text={"OWNED"}
						TextColor3={new Color3()}
						// TextScaled={true}
						TextSize={px(55)}
					>
						<uistroke key={"1"} Thickness={px(5)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
							key={"1"}
							Position={UDim2.fromScale(0.5, 0.48)}
							Size={UDim2.fromScale(1, 1)}
							Text={"OWNED"}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(55)}
						>
							<uistroke key={"1"} Thickness={px(5)} />
						</textlabel>
					</textlabel>
				</frame>

				<imagelabel
					BackgroundTransparency={1}
					Image={props.image}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
					ScaleType={"Fit"}
				/>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={
						new Font(
							"rbxasset://fonts/families/BuilderSans.json",
							Enum.FontWeight.Bold,
							Enum.FontStyle.Normal,
						)
					}
					key={"1"}
					Position={UDim2.fromScale(0.5, 0.971)}
					Size={UDim2.fromScale(0.9, 0.11)}
					Text={props.obtainLocation ?? `$${separateWithCommas(props.price)}`}
					TextColor3={Color3.fromRGB(92, 255, 133)}
					// TextScaled={true}
					// TextWrapped={true}
					TextSize={px(28)}
					ZIndex={16}
					Visible={!owned}
				>
					<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"1"} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={
							new Font(
								"rbxasset://fonts/families/BuilderSans.json",
								Enum.FontWeight.Bold,
								Enum.FontStyle.Normal,
							)
						}
						key={"1"}
						Position={UDim2.fromScale(0.5, 0.45)}
						Size={UDim2.fromScale(0.9, 0.11)}
						Text={props.obtainLocation ?? `$${separateWithCommas(props.price)}`}
						TextColor3={Color3.fromRGB(92, 255, 133)}
						// TextScaled={true}
						// TextWrapped={true}
						TextSize={px(28)}
						ZIndex={16}
						Visible={!owned}
					>
						<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"1"} Thickness={px(3)} />
					</textlabel>
				</textlabel>
			</AnimatedButton>
		</frame>
	);
};

interface ShopProps {
	visible: boolean;
	uiController: UiController;
}

const cachedShops = new Map<
	keyof typeof SHOP_MENUS | "",
	Array<Exclude<Item, { type: "Potions" }> & { owned: boolean }>
>();

export const ShopComponent: React.FC<ShopProps> = (props) => {
	const [visible, setVisible] = React.useState(props.visible);
	const [selectedShop, setSelectedShop] = React.useState<keyof typeof SHOP_MENUS | "">("");
	const [shopContent, setShopContent] = React.useState<
		Array<Exclude<Item, { type: "Potions" }> & { owned: boolean }>
	>([]);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [radialRotation, setRadialRotation] = useState(0);
	const menuRef = React.createRef<Frame>();

	const px = usePx();

	const updateShopContent = (shopName: typeof selectedShop, items: Array<Item>, setSelected: boolean = false) => {
		if (shopName === "" || shopName === "Store") return;

		const shopConfig = gameConstants.SHOP_CONFIGS[shopName];
		const content: Array<Item & { owned: boolean }> = [];

		for (const [itemName, itemConfig] of pairs(shopConfig)) {
			content.push({
				...itemConfig,
				owned: false,
				type: selectedShop,
				name: itemName,
			} as Item & { owned: boolean });
		}

		const newContent = content
			.filter((item) => item.type !== "Potions")
			.map((item) => {
				const foundItem = items.find((i) => i.name === item.name);
				if (foundItem) {
					return { ...item, owned: true };
				}
				return item;
			});

		cachedShops.set(shopName, newContent);
		setShopContent(newContent);
	};

	React.useEffect(() => {
		if (selectedShop === "") {
			setShopContent([]);
		} else if (selectedShop === "MetalDetectors" || selectedShop === "Shovels") {
			setShopContent(cachedShops.get(selectedShop) ?? []);

			for (const [i, request] of Object.entries(outgoingShopRequests)) {
				request.cancel();
				outgoingShopRequests.remove(i);
			}

			outgoingShopRequests.push(
				Functions.getInventory(selectedShop)
					.then(([_, items]) => {
						updateShopContent(selectedShop, items, true);
					})
					.catch((e: NetworkingFunctionError) => {
						if (e === NetworkingFunctionError.Cancelled) return;
						warn(e);
					}),
			);
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
			popInMotion.spring(UDim2.fromScale(0.5, 0.5), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));

			const unsub = popInMotion.onComplete(() => {
				setSelectedShop("");
			});

			return () => {
				unsub();
			};
		}
	}, [visible]);

	React.useEffect(() => {
		for (const shopType of Object.keys(SHOP_MENUS)) {
			if (shopType === "Store") continue;
			Functions.getInventory(shopType)
				.then(([_, items]) => {
					// Profile already ready (high latency)
					updateShopContent(shopType, items);
				})
				.catch((e) => {
					warn(e);
				});
		}

		RunService.RenderStepped.Connect(() => {
			const SPEED = 0.2;
			setRadialRotation((prev) => (prev + SPEED) % 360);
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Shop Sub-Menu"}
			Position={popInPos}
			Size={UDim2.fromScale(0.631, 0.704)}
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
				isMenuVisible={visible}
			/>
			<frame
				BackgroundTransparency={1}
				key={"Select Menu Frame"}
				Position={UDim2.fromScale(0.037, 0.0705)}
				Size={UDim2.fromScale(0.933, 0.853)}
				Visible={selectedShop === ""}
			>
				<AnimatedButton
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.261, 0.254)}
					size={UDim2.fromScale(0.505, 0.487)}
					onClick={() => {
						setSelectedShop("Shovels");
					}}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://88271653883643"}
						key={"Background"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1)}
					/>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Icon"}
						Position={UDim2.fromScale(0.307, 0.133)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.362, 0.695)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.701)}
						Size={UDim2.fromScale(0.763131, 0.162)}
						Text={"Shovels"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />

						<uipadding key={"UIPadding"} />
					</textlabel>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Label"}
						Position={UDim2.fromScale(0.108, 0.132)}
						Size={UDim2.fromScale(0.75, 0.225)}
						Text={"NEW"}
						TextColor3={Color3.fromRGB(255, 234, 0)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Right}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px.ceil(4)} />
					</textlabel>
				</AnimatedButton>

				<AnimatedButton
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.728, 0.254)}
					size={UDim2.fromScale(0.505, 0.487)}
					onClick={() => {
						setSelectedShop("MetalDetectors");
					}}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://118545014651736"}
						key={"Background"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.701)}
						Size={UDim2.fromScale(0.763131, 0.162)}
						Text={"Metal Detectors"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />

						<uipadding key={"UIPadding"} />
					</textlabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://119544070088143"}
						key={"Icon"}
						Position={UDim2.fromScale(0.307, 0.133)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.362, 0.695)}
					/>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Label"}
						Position={UDim2.fromScale(0.108, 0.132)}
						Size={UDim2.fromScale(0.75, 0.225)}
						Text={"NEW"}
						TextColor3={Color3.fromRGB(255, 234, 0)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Right}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px.ceil(4)} />
					</textlabel>
				</AnimatedButton>

				<AnimatedButton
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.495198, 0.758)}
					selectable={false}
					size={UDim2.fromScale(0.918124, 0.487)}
					onClick={() => {
						setSelectedShop("Store");
					}}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://107941667988653"}
						key={"Background"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Slice}
						Size={UDim2.fromScale(1, 1)}
						SliceCenter={new Rect(625, 208, 625, 208)}
					>
						<canvasgroup
							key={"CanvasGroup"}
							BackgroundTransparency={1}
							Position={UDim2.fromScale(0.022, 0.069)}
							Size={UDim2.fromScale(0.96, 0.836)}
						>
							<imagelabel
								key={"ImageLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://96020275381733"}
								ImageColor3={Color3.fromRGB(255, 61, 2)}
								ImageTransparency={0.86}
								Position={UDim2.fromScale(0.5, 0.5)}
								Rotation={-180}
								ScaleType={Enum.ScaleType.Crop}
								Size={UDim2.fromScale(1.06184, 2.46095)}
								ZIndex={2}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.77778} />
							</imagelabel>

							<imagelabel
								key={"ImageLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://86149883416206"}
								ImageColor3={Color3.fromRGB(207, 0, 0)}
								ImageTransparency={0.94}
								Position={UDim2.fromScale(0.5, 0.5)}
								Rotation={radialRotation}
								ScaleType={Enum.ScaleType.Crop}
								Size={UDim2.fromScale(1.03294, 4.25594)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

							<imagelabel
								key={"ImageLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://95141846932408"}
								ImageColor3={Color3.fromRGB(207, 0, 0)}
								ImageTransparency={0.94}
								Position={UDim2.fromScale(0.5, 0.5)}
								Rotation={-180}
								ScaleType={Enum.ScaleType.Crop}
								Size={UDim2.fromScale(1.03294, 4.25594)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</canvasgroup>
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://82530092684621"}
						key={"Icon"}
						Position={UDim2.fromScale(0.307, 0.133)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.362, 0.695)}
					/>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Label"}
						Position={UDim2.fromScale(0.108, 0.132)}
						Size={UDim2.fromScale(0.75, 0.225)}
						Text={"NEW"}
						TextColor3={Color3.fromRGB(255, 234, 0)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Right}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px.ceil(4)} />
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.460732, 0.701)}
						Size={UDim2.fromScale(0.841666, 0.162)}
						Text={"Store"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />

						<uipadding key={"UIPadding"} />
					</textlabel>
				</AnimatedButton>
			</frame>

			<frame
				BackgroundTransparency={1}
				key={"Seller Profile"}
				Position={UDim2.fromScale(-0.0621, -0.104)}
				Size={UDim2.fromScale(0.165, 0.286)}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://101474809776872"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://77754309050946"}
						key={"Profile"}
						Position={UDim2.fromScale(0.5, 0.446)}
						Size={UDim2.fromScale(0.717, 0.717)}
					/>
				</imagelabel>
			</frame>

			<textlabel
				key={"TextLabel"}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Position={UDim2.fromScale(0.117964, -0.0509579)}
				Size={UDim2.fromScale(0.341737, 0.148706)}
				Text={"Magia's Shop"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(5)} />

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
				Selectable={selectedShop !== ""}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0.008, 0)}
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

					if ("notForSale" in item && item["notForSale"] === true && item.obtainLocation === undefined) {
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
							obtainLocation={item.obtainLocation}
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
				Position={UDim2.fromScale(0.218, 0.035)}
				Size={UDim2.fromScale(0.682, 0.154)}
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
					Padding={new UDim(0.005)}
				/>
			</frame>
		</frame>
	);
};
