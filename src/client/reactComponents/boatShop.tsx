//!optimize 2
import React, { Dispatch, useEffect } from "@rbxts/react";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { Rarity } from "shared/networkTypes";
import { separateWithCommas, shortenNumber } from "shared/util/nameUtil";
import { ExitButton } from "./inventory";
import { boatConfig } from "shared/config/boatConfig";
import Object from "@rbxts/object-utils";
import { SoundService } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";
import { Signals } from "shared/signals";

const BOATSHOP_MENUS = {
	Boats: "Boats",
};

interface GenericItemProps {
	itemName: string;
	rarity: Rarity;
	speed: number; // List of stats to display
	image: string;
	owned: boolean;
	price: number;
	obtainLocation?: string; // The location where the boat can be obtained displayed to user.
}

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemName: boatName, owned } = props;
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [sz, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.975, 1.025];

	const px = usePx();

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isPressed]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			LayoutOrder={props.price}
			key={"Item"}
			Position={UDim2.fromScale(0.5, 0.5)}
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
				Image={gameConstants.RARITY_BACKGROUND_IMAGE}
				ImageColor3={gameConstants.RARITY_COLORS[props.rarity]}
				key={"Item Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 0.949)}
				Event={{
					MouseButton1Click: () => {
						if (owned) {
							Events.spawnBoat(boatName);
							SoundService.PlayLocalSound(
								SoundService.WaitForChild("UI").WaitForChild("BoatSpawn") as Sound,
							);
						} else {
							Events.buyBoat(boatName);
						}
						setPressed(true);
						task.delay(0.1, () => setPressed(false));
					},
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => setIsHovered(false),
				}}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.748} />
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0923, 0.069)}
					Size={UDim2.fromScale(0.472, 0.374)}
					ZIndex={3}
				>
					<uilistlayout
						key={"UIListLayout"}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Speed"}
						Size={UDim2.fromScale(1.14, 0.393)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0.05, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"SpeedIcon"}
							Position={UDim2.fromScale(0.287, 0.0263)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.3, 0.947)}
						>
							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://92562003032678"}
								key={"Icon"}
								Position={UDim2.fromScale(0.471, 0.424)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1.21, 0.958)}
							/>
						</imagelabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Amount"}
							Position={UDim2.fromScale(0.808, 0.382)}
							Size={UDim2.fromScale(1.02, 0.763)}
							Text={`x${shortenNumber(props.speed)}`}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							// TextScaled={true}
							// TextWrapped={true}
							TextSize={px(30)}
							TextXAlignment={Enum.TextXAlignment.Left}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.0198, 0)}
								PaddingTop={new UDim(0.0198, 0)}
							/>
						</textlabel>
					</frame>
				</frame>

				<frame
					BackgroundTransparency={1}
					key={"Information"}
					Position={UDim2.fromScale(0.0674, 0.602)}
					Size={UDim2.fromScale(0.852, 0.318)}
					ZIndex={3}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0)}
						BackgroundTransparency={1}
						key={"Item Info"}
						Position={UDim2.fromScale(0.5, 0.458)}
						Size={UDim2.fromScale(0.9, 0.533)}
						ZIndex={2}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Rarity"}
							Position={UDim2.fromScale(0.508, 0.26)}
							Size={UDim2.fromScale(1.02, 0.438)}
							Text={props.rarity}
							TextColor3={new Color3()}
							// TextScaled={true}
							TextSize={px(25)}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={px(1.9)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Rarity"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={props.rarity}
								TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
								// TextScaled={true}
								TextSize={px(25)}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={px(1.9)} />
							</textlabel>
						</textlabel>

						<uilistlayout
							key={"UIListLayout"}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Bottom}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							LayoutOrder={1}
							key={"Name"}
							Position={UDim2.fromScale(0.499, 0.709)}
							Size={UDim2.fromScale(1.02, 0.521)}
							Text={props.itemName}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(25)}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								LayoutOrder={1}
								key={"Name"}
								Position={UDim2.fromScale(0.5, 0.45)}
								Size={UDim2.fromScale(1, 1)}
								Text={props.itemName}
								TextColor3={new Color3(1, 1, 1)}
								// TextScaled={true}
								TextSize={px(25)}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>
						</textlabel>
					</frame>
				</frame>

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={props.image}
					key={"ItemRender"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(0.9, 1)}
					ZIndex={2}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />
				</imagelabel>
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
					key={"2"}
					Position={UDim2.fromScale(0.5, 0.971)}
					Size={UDim2.fromScale(0.551, 0.11)}
					Text={props.obtainLocation ?? `$${separateWithCommas(props.price)}`}
					TextColor3={Color3.fromRGB(92, 255, 133)}
					// TextScaled={true}
					TextSize={px(28)}
					// TextWrapped={true}
					Visible={!owned}
					ZIndex={16}
				>
					<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"2"} Thickness={px(4.6)} />
				</textlabel>
				<frame
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.45}
					key={"Overlay"}
					Size={UDim2.fromScale(1, 1)}
					Visible={props.owned}
					ZIndex={15}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://86601969325749"}
						key={"Check"}
						Position={UDim2.fromScale(0.493, 0.443)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.623, 0.388)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
						key={"1"}
						Position={UDim2.fromScale(0.508, 0.538)}
						Size={UDim2.fromScale(0.9, 0.9)}
						Text={"SPAWN"}
						TextColor3={new Color3()}
						TextScaled={true}
					>
						<uistroke key={"1"} Thickness={px(5)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
							key={"1"}
							Position={UDim2.fromScale(0.5, 0.49)}
							Size={UDim2.fromScale(1, 1)}
							Text={"SPAWN"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
						>
							<uistroke key={"1"} Thickness={px(5)} />
						</textlabel>
					</textlabel>
				</frame>
			</imagebutton>
		</frame>
	);
};

interface ShopProps {
	visible: boolean;
	uiController: UiController;
}

export const BoatShopComponent: React.FC<ShopProps> = (props) => {
	const [visible, setVisible] = React.useState(props.visible);
	const [selectedShop, setSelectedShop] = React.useState<keyof typeof BOATSHOP_MENUS | "">("Boats");
	const [ownedBoats, setOwnedBoats] = React.useState<Map<keyof typeof boatConfig, boolean>>(new Map());
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const menuRef = React.createRef<Frame>();

	const px = usePx();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.5), springs.responsive);
			Functions.getOwnedBoats()
				.then((ownedBoats) => {
					setOwnedBoats(ownedBoats);
				})
				.catch(warn);

			const connection = Events.updateBoatInventory.connect((ownedBoats) => {
				setOwnedBoats(ownedBoats);
			});

			return () => {
				connection.Disconnect();
			};
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	React.useEffect(() => {
		// Events.profileReady.connect(() => {
		// 	Functions.getOwnedBoats().then((ownedBoats) => {
		// 		if (ownedBoats) {
		// Profile ready after render (low latency).
		// 			setOwnedBoats(ownedBoats);
		// 		}
		// 	});
		// });
		Functions.getOwnedBoats()
			.then((ownedBoats) => {
				setOwnedBoats(ownedBoats);
			})
			.catch(warn);

		Events.boatSpawnResponse.connect((success, response) => {
			if (success) {
				Signals.actionPopup.Fire(`Spawned ${response}`);
			} else {
				Signals.invalidAction.Fire(response);
			}
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
				onClick={() => {
					props.uiController.closeUi(gameConstants.BOAT_SHOP_UI);
				}}
				isMenuVisible={visible}
			/>
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
						Image={"rbxassetid://101967293535411"}
						key={"Profile"}
						Position={UDim2.fromScale(0.5, 0.446)}
						Size={UDim2.fromScale(0.717, 0.717)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
					</imagelabel>
				</imagelabel>
			</frame>

			<textlabel
				key={"TextLabel"}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Position={UDim2.fromScale(0.108115, -0.0490378)}
				Size={UDim2.fromScale(0.313718, 0.138739)}
				Text={"Boat Shop"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />

				<uipadding
					key={"UIPadding"}
					PaddingBottom={new UDim(0.02, 0)}
					PaddingLeft={new UDim(0.0025, 0)}
					PaddingRight={new UDim(0.0025, 0)}
					PaddingTop={new UDim(0.02, 0)}
				/>
			</textlabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />
			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
				key={"Description Label"}
				Position={UDim2.fromScale(0.307225, 0.122861)}
				Size={UDim2.fromScale(0.39822, 0.0478707)}
				Text={"Buy new boats or spawn owned ones"}
				TextColor3={Color3.fromRGB(187, 199, 234)}
				TextScaled={true}
				TextTransparency={0.5}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>
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
					Padding={new UDim(0.015, 0)}
				/>

				{Object.entries(boatConfig).map(([boatName, boatCfg]) => {
					const owned = ownedBoats.get(boatName) ?? false;

					if (boatCfg.notForSale && !owned && boatCfg.obtainLocation === undefined) {
						return;
					}

					return (
						<GenericItemComponent
							itemName={boatName}
							rarity={boatCfg.rarityType}
							image={boatCfg.itemImage}
							speed={boatCfg.speed}
							owned={owned}
							price={boatCfg.price}
							obtainLocation={boatCfg.obtainLocation}
						/>
					);
				})}
			</scrollingframe>
		</frame>
	);
};
