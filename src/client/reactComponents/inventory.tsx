//!optimize 2
import React, { createRef, Dispatch, useEffect, useState } from "@rbxts/react";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { Item, type ItemType, Rarity, SkillName } from "shared/networkTypes";
import { Events, Functions } from "client/network";
import { MarketplaceService, Players, ReplicatedStorage, SoundService, UserInputService } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { shortenNumber, spaceWords } from "shared/util/nameUtil";
import { shovelConfig } from "shared/config/shovelConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { fullTargetConfig, targetConfig, trashConfig } from "shared/config/targetConfig";
import { mapConfig } from "shared/config/mapConfig";
import Object from "@rbxts/object-utils";
import { getOneInXChance } from "shared/util/targetUtil";
import { potionConfig } from "shared/config/potionConfig";
import { inventorySizeAtom, treasureCountAtom, treasureInventoryAtom } from "client/atoms/inventoryAtoms";
import { Signals } from "shared/signals";
import { GamepassController } from "client/controllers/gamepassController";
import { getOrderFromRarity } from "shared/util/rarityUtil";
import { NetworkingFunctionError } from "@flamework/networking";

export function capitalizeWords(str: string): string {
	return str
		.split(" ")
		.map((word) => {
			if (word.size() === 0) return word;
			return word.sub(0, 1).upper() + word.sub(2);
		})
		.join(" ");
}

interface AnimatedButtonProps {
	size?: { X: { Scale: number }; Y: { Scale: number } };
	position?: UDim2;
	anchorPoint?: Vector2;
	onClick?: () => void;
	onHover?: () => void;
	onLeave?: () => void;
	scales?: NumberRange;
	layoutOrder?: number;
	children?: React.ReactNode;
	zindex?: number;
	Ref?: React.Ref<Frame>;
	active?: boolean;
	selectable?: boolean;
	clickable?: boolean;
	visible?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
	size = { X: { Scale: 1 }, Y: { Scale: 1 } },
	position = new UDim2(0.5, 0, 0.5, 0),
	anchorPoint = new Vector2(0.5, 0.5),
	onClick,
	onHover,
	onLeave,
	layoutOrder,
	scales,
	children,
	zindex,
	visible,
	selectable,
	clickable = true,
	Ref: ref,
	active = true,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setPressed] = useState(false);
	const [scale, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = scales ? [scales.Min, scales.Max] : [0.95, 1.05];

	useEffect(() => {
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, { tension: 300, friction: 20 });
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, { tension: 300, friction: 20 });
	}, [isPressed]);

	return (
		<frame
			BackgroundTransparency={1}
			Size={scale.map((s) => UDim2.fromScale(size.X.Scale * s, size.Y.Scale * s))}
			Position={position}
			AnchorPoint={anchorPoint}
			LayoutOrder={layoutOrder ?? 0}
			ZIndex={zindex ?? 10}
			ref={ref}
			Visible={visible}
		>
			<imagebutton
				BackgroundTransparency={1}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={zindex ?? 10}
				Active={active}
				Selectable={selectable}
				Event={{
					MouseEnter: () => {
						if (!active) return;
						onHover?.();
						setIsHovered(true);
					},
					MouseLeave: () => {
						if (!active) return;
						onLeave?.();
						setIsHovered(false);
					},
					MouseButton1Click: () => {
						if (!active || !clickable) return;
						// Check for undefined, because we only want a pressing animation if a click event is defined
						if (onClick !== undefined) {
							setPressed(true);
							task.delay(0.1, () => setPressed(false));
							onClick();
						}
					},
				}}
			></imagebutton>
			{React.Children.map(children, (child) => {
				return child;
			})}
		</frame>
	);
};

interface ItemStat {
	key: string;
	value: string | number;
	icon: string; // Asset ID
}

interface GenericItemProps {
	itemImage: string;
	itemName: string;
	rarity: Rarity;
	itemType: Exclude<ItemType, "Target">;
	stats: ItemStat[]; // List of stats to display
	isEquipped: boolean;
}

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemImage, itemName, rarity, stats, itemType, isEquipped } = props;
	const [isHovered, setIsHovered] = React.useState(false);
	const [, setPressed] = React.useState(false);
	const [size, sizeMotion] = useMotion(1);
	const [, MAX_SCALE] = [0.95, 1.05];
	const [layoutOrder, setLayoutOrder] = React.useState(0);

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
	}, [isHovered]);

	// useEffect(() => {
	// 	sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, springs.bubbly);
	// }, [isPressed]);

	useEffect(() => {
		// Get either strength or luck stat and set the order modifier based on that
		const stat = stats.find((s) => s.key === "strength" || s.key === "luck");
		if (stat) {
			setLayoutOrder(getOrderFromRarity(rarity, tonumber(stat.value)));
		}
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			LayoutOrder={layoutOrder}
			key={"Item"}
			Position={UDim2.fromScale(0, 0.5)}
			Size={size.map((s) => {
				return UDim2.fromScale(0.33 * s, 1.01 * s);
			})}
		>
			<imagebutton
				Active={true}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={gameConstants.RARITY_BACKGROUND_IMAGE}
				ImageColor3={gameConstants.RARITY_COLORS[rarity]}
				key={"Item Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 0.949)}
				Selectable={true}
				Event={{
					MouseButton1Click: () => {
						// Equip the item
						if (itemType === "Shovels" || itemType === "MetalDetectors") {
							Events.equipItem(itemType as Exclude<ItemType, "Target" | "Boats">, itemName);
						} else if (itemType === "Potions") {
							Events.drinkPotion(itemName);
						}
						setPressed(true);
						task.delay(0.1, () => setPressed(false));
					},
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => setIsHovered(false),
				}}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.748} />

				<imagelabel BackgroundTransparency={1} Image={itemImage} key={"2"} Size={UDim2.fromScale(1, 1)} />

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0923, 0.069)}
					Size={UDim2.fromScale(0.446, 0.353)}
				>
					<uilistlayout
						key={"UIListLayout"}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{stats.map((stat) => {
						return (
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={stat.key}
								Size={UDim2.fromScale(0.902, 0.4)}
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
									key={"Icon"}
									Position={UDim2.fromScale(0.287, 0.0263)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.3, 0.947)}
								>
									<imagelabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={stat.icon ?? "rbxassetid://85733831609212"}
										key={"Icon"}
										Position={UDim2.fromScale(-0.115, -0.0498)}
										ScaleType={Enum.ScaleType.Fit}
										Size={UDim2.fromScale(1.17, 1.05)}
									/>
								</imagelabel>

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
									Text={`x${shortenNumber(tonumber(stat.value) ?? 0)}`}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
									TextXAlignment={Enum.TextXAlignment.Left}
								>
									<uistroke key={"UIStroke"} Thickness={3} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.0198, 0)}
										PaddingTop={new UDim(0.0198, 0)}
									/>
								</textlabel>
							</frame>
						);
					})}
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
							key={"Rarity"}
							Position={UDim2.fromScale(0.508, 0.26)}
							Size={UDim2.fromScale(1.02, 0.438)}
							Text={props.rarity}
							TextColor3={Color3.fromRGB(0, 0, 0)}
							TextScaled={true}
							TextWrapped={true}
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
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Rarity"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={props.rarity}
								TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={1.9} />
							</textlabel>
						</textlabel>

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
							<uistroke key={"UIStroke"} Thickness={3} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								LayoutOrder={1}
								key={"Name"}
								Position={UDim2.fromScale(0.5, 0.45)}
								Size={UDim2.fromScale(1, 1)}
								Text={spaceWords(props.itemName)}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Right}
								Visible={true}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
							</textlabel>
						</textlabel>
					</frame>
				</frame>
			</imagebutton>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.45}
				BorderSizePixel={0}
				key={"1"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 0.949)}
				ZIndex={15}
				Visible={isEquipped}
			>
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
					Position={UDim2.fromScale(0.508, 0.599)}
					Size={UDim2.fromScale(0.777, 0.777)}
					Text={"EQUIPPED"}
					TextColor3={Color3.fromRGB(23, 30, 52)}
					TextScaled={true}
					TextWrapped={true}
					ZIndex={11}
				>
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
						Position={UDim2.fromScale(0.5, 0.46)}
						Size={UDim2.fromScale(1, 1)}
						Text={"EQUIPPED"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={11}
					>
						<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"1"} Thickness={5} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(169, 255, 208)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(93, 255, 93)),
								])
							}
							Rotation={90}
						/>
					</textlabel>

					<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"1"} Thickness={5} />
				</textlabel>

				<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://114978900536475"}
					key={"Check"}
					Position={UDim2.fromScale(0.653, 0.426)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.406, 0.253)}
					SliceCenter={new Rect(100, 259, 901, 259)}
				/>
			</frame>
		</frame>
	);
};

interface TreasureItemComponentProps {
	itemImage: string;
	itemName: string;
	rarity: Rarity;
	itemType: Extract<ItemType, "Target">;
	stats: ItemStat[]; // List of stats to display
	isEquipped: boolean;
	count: number;
}

const TreasureItemComponent: React.FC<TreasureItemComponentProps> = ({
	itemImage,
	rarity,
	itemName,
	stats,
	isEquipped,
	count,
	// itemType,
}) => {
	return (
		<AnimatedButton
			layoutOrder={getOrderFromRarity(rarity)}
			position={UDim2.fromScale(-1.69e-7, -0.0175)}
			size={UDim2.fromScale(0.179, 0.39)}
			scales={new NumberRange(0.975, 1.025)}
			onClick={() => {
				Events.equipTreasure(itemName);
			}}
		>
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(17, 25, 49)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Item"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(0.9, 0.9)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

				<uistroke key={"UIStroke"} Color={gameConstants.RARITY_COLORS[rarity]} Thickness={3} />

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0923, 0.069)}
					Size={UDim2.fromScale(0.472, 0.374)}
					ZIndex={3}
					Visible={count === 1}
				>
					<uilistlayout
						key={"UIListLayout"}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					{stats.map((stat) => {
						return (
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={stat.key}
								Size={UDim2.fromScale(0.902, 0.5)}
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
									Image={stat.icon ?? "rbxassetid://100052274681629"}
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
									Text={`${string.format("%.1f", stat.value)}kg`}
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
				</frame>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Amount"}
					Position={UDim2.fromScale(0.1, 0.1)}
					Size={UDim2.fromScale(0.2, 0.2)}
					Text={`x${count}`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					Visible={count > 1}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={2} />
				</textlabel>

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Image={itemImage}
				>
					<textlabel
						Size={UDim2.fromScale(1, 0.3)}
						Position={UDim2.fromScale(0, 0.9)}
						BackgroundTransparency={1}
						Text={itemName}
						TextScaled={true}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					>
						<uistroke Thickness={2} />
					</textlabel>
				</imagelabel>
			</frame>
		</AnimatedButton>
	);
};

interface CategoryButtonProps {
	title: string;
	iconId: string;
	paddingSz?: number;
	iconSz?: UDim2;
	setCategory: Dispatch<string>;
	currentCategory: string;

	/** The position/size of the button in its container Frame */
	position: UDim2;
	size: UDim2;
	anchorPoint?: Vector2;
}

const CategoryButton = (props: CategoryButtonProps) => {
	const { currentCategory, title, iconId, position, size, anchorPoint } = props;
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [sz, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.95, 1.05];
	const [buttonColor, buttonColorMotion] = useMotion(Color3.fromRGB(22, 33, 66));
	const [foregroundColor, foregroundColorMotion] = useMotion(Color3.fromRGB(52, 70, 126));
	const [glowColor, glowColorMotion] = useMotion(Color3.fromRGB(77, 104, 188));
	const [hovered, setHovered] = React.useState(false);

	React.useEffect(() => {
		// Animate size
		sizeMotion.spring(
			isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, // Default scale
			springs.responsive,
		);

		// Animate button color
		buttonColorMotion.spring(
			isHovered ? Color3.fromRGB(22 / 2, 33 / 2, 66 / 2) : Color3.fromRGB(22, 33, 66),
			springs.responsive,
		);

		// Animate foreground color
		foregroundColorMotion.spring(
			currentCategory === title
				? Color3.fromRGB(248, 199, 50)
				: isHovered
				? Color3.fromRGB(38, 51, 89)
				: Color3.fromRGB(52, 70, 126),
			springs.responsive,
		);

		// Animate glow color
		glowColorMotion.spring(
			currentCategory === title
				? Color3.fromRGB(255, 255, 100)
				: isHovered
				? Color3.fromRGB(51, 69, 125)
				: Color3.fromRGB(77, 104, 188),
			springs.responsive,
		);
	}, [isHovered, isPressed, currentCategory]);

	return (
		<imagebutton
			key={"CategoryBtn"}
			AnchorPoint={anchorPoint ?? new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Image={"rbxassetid://95497998243578"}
			ImageColor3={buttonColor}
			Position={position}
			ScaleType={Enum.ScaleType.Slice}
			Size={sz.map((s) => {
				return UDim2.fromScale(size.X.Scale * s, size.Y.Scale * s);
			})}
			SliceCenter={new Rect(98, 73, 643, 212)}
			SliceScale={0.25}
			Selectable={false}
			ZIndex={-10}
			Event={{
				MouseButton1Click: () => {
					// Change the category
					props.setCategory(title);
					setPressed(true);
					task.delay(0.1, () => setPressed(false));
				},
				MouseEnter: () => setIsHovered(true),
				MouseLeave: () => setIsHovered(false),
			}}
		>
			{/* Foreground layer */}
			<imagelabel
				key={"Foreground"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Image={"rbxassetid://112712495005122"}
				ImageColor3={foregroundColor}
				Position={UDim2.fromScale(0.5, 0.508)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1.02)}
				SliceCenter={new Rect(98, 73, 643, 212)}
				SliceScale={0.25}
				ZIndex={-10}
			/>

			{/* Glow layer */}
			<imagelabel
				key={"Glow"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Image={"rbxassetid://94298922654109"}
				ImageColor3={glowColor}
				Position={UDim2.fromScale(0.5, 0.508)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1.02)}
				SliceCenter={new Rect(98, 73, 643, 212)}
				SliceScale={0.25}
				ZIndex={-10}
			/>

			{/* Info frame containing icon + text */}
			<frame
				key={"Info"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(props.paddingSz ?? 0.05, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.075, 0)} />
				{/* Icon */}
				<imagelabel
					key={"Icon"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					Image={iconId}
					Position={UDim2.fromScale(0.18, 0.54)}
					ScaleType={Enum.ScaleType.Fit}
					Size={props.iconSz ?? UDim2.fromScale(0.35, 0.9)}
				/>
				{/* Title Text */}
				<textlabel
					AnchorPoint={new Vector2(1, 1)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Font={Enum.Font.BuilderSansBold}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(1, 1)}
					Size={UDim2.fromScale(0.606, 0.432)}
					Text={title}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={1}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.46)}
						Size={UDim2.fromScale(1, 1)}
						Text={title}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={11}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(7, 7, 7)} Thickness={3} />
					</textlabel>

					<uipadding
						key={"UIPadding"}
						PaddingBottom={new UDim(0.0107, 0)}
						PaddingLeft={new UDim(0.0474, 0)}
						PaddingRight={new UDim(0.0474, 0)}
						PaddingTop={new UDim(0.0107, 0)}
					/>
				</textlabel>
			</frame>
		</imagebutton>
	);
};
interface SkillFrameProps {
	image: string;
	imageRotation?: number;
	title: SkillName;
	levelText: string;
	titleSize?: UDim2;
}

const SkillFrame: React.FC<SkillFrameProps> = (props) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [size, sizeMotion] = useMotion(1);
	const [, MAX_SCALE] = [, 1.025];
	const [bgColor, bgColorMotion] = useMotion(Color3.fromRGB(255, 255, 255));
	const DIM_AMT = 1.5;
	const skillUpgrade = SoundService.WaitForChild("UI").WaitForChild("Skill upgrade") as Sound;

	useEffect(() => {
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, springs.responsive);
		bgColorMotion.spring(
			isHovered ? Color3.fromRGB(255 / DIM_AMT, 255 / DIM_AMT, 255 / DIM_AMT) : Color3.fromRGB(255, 255, 255),
			springs.responsive,
		);
	}, [isHovered]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={props.title}
			Position={UDim2.fromScale(0.00269, -4.18e-7)}
			Size={UDim2.fromScale(0.995, 0.306)}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={bgColor}
				ImageColor3={bgColor}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://83760144959092"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Slice}
				Size={size.map((s) => {
					return UDim2.fromScale(1 * s, 1 * s);
				})}
				SliceCenter={new Rect(36, 60, 994, 60)}
				SliceScale={0.7}
				Active={true}
				Selectable={false}
				Event={{
					MouseEnter: () => {
						setIsHovered(true);
					},
					MouseLeave: () => {
						setIsHovered(false);
					},
				}}
			>
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Container"}
					Position={UDim2.fromScale(0.497, 0.451)}
					Size={UDim2.fromScale(0.949, 0.634)}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Title"}
						Size={UDim2.fromScale(0.607, 1)}
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
							Image={props.image}
							key={"Icon"}
							Position={UDim2.fromScale(8e-8, 0.0537)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.132, 0.893)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<textlabel
							key={"TextLabel"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							Position={UDim2.fromScale(0.512, 0.5)}
							Size={UDim2.fromScale(0.659, 0.689)}
							Text={capitalizeWords(props.title)}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
						>
							<uistroke key={"UIStroke"} Thickness={3} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.00139, 0)}
								PaddingLeft={new UDim(0.0488, 0)}
								PaddingRight={new UDim(0.0488, 0)}
								PaddingTop={new UDim(0.00139, 0)}
							/>
						</textlabel>

						<uipadding
							key={"UIPadding"}
							PaddingLeft={new UDim(0.025, 0)}
							PaddingRight={new UDim(0.025, 0)}
						/>
					</frame>

					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Info"}
						Position={UDim2.fromScale(0.757, 0.5)}
						Size={UDim2.fromScale(0.456, 0.911)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0.075, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Level"}
							Position={UDim2.fromScale(0.352, 0.5)}
							Size={UDim2.fromScale(0.492, 0.756)}
							Text={props.levelText}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
						>
							<uistroke key={"UIStroke"} Thickness={3} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.0467, 0)}
								PaddingLeft={new UDim(0.00581, 0)}
								PaddingRight={new UDim(0.00581, 0)}
								PaddingTop={new UDim(0.0467, 0)}
							/>
						</textlabel>

						<frame
							key={"Frame"}
							BackgroundColor3={Color3.fromRGB(37, 52, 99)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Position={UDim2.fromScale(0.567, 0.0854)}
							Size={UDim2.fromScale(0.0125, 1.05)}
						/>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							LayoutOrder={4}
							key={"Add Point Btn Frame"}
							Position={UDim2.fromScale(0.654, 0)}
							Size={UDim2.fromScale(0.16, 1)}
						>
							<imagebutton
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://92239062767450"}
								key={"Add Point Btn"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(1, 1)}
								SliceCenter={new Rect(40, 86, 544, 87)}
								SliceScale={0.3}
								Selectable={true}
								Event={{
									Activated: () => {
										Events.upgradeSkill.fire(string.lower(props.title) as SkillName);
										SoundService.PlayLocalSound(skillUpgrade);
									},
								}}
							>
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
									key={"Label"}
									Position={UDim2.fromScale(0.494, 0.488)}
									Size={UDim2.fromScale(1.41, 1.29)}
									Text={"+"}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={3} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.00305, 0)}
										PaddingLeft={new UDim(0.298, 0)}
										PaddingRight={new UDim(0.298, 0)}
										PaddingTop={new UDim(0.00305, 0)}
									/>
								</textlabel>
							</imagebutton>
						</frame>
					</frame>
				</frame>
			</imagebutton>
		</frame>
	);
};
interface InventorySelectorTabProps {
	inventoryType: ItemType;
	icon: string;
	order: number;
	setSelectedInventoryType: Dispatch<ItemType>;
	selectedInventoryType: ItemType;
	position: UDim2;
}

const InventorySelectorTab = (props: InventorySelectorTabProps) => {
	const [color, colorMotion] = useMotion(Color3.fromRGB(255, 255, 255));
	const [hovered, setHovered] = React.useState(false);

	useEffect(() => {
		colorMotion.spring(
			!hovered ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(200, 200, 200),
			springs.responsive,
		);
	}, [hovered]);

	return (
		<AnimatedButton
			size={UDim2.fromScale(0.103, 1.18)}
			layoutOrder={props.order}
			position={props.position}
			anchorPoint={new Vector2(0.5, 0.5)}
			scales={new NumberRange(0.95, 1.05)}
			selectable={false}
			onClick={() => {
				setHovered(false);
				props.setSelectedInventoryType(props.inventoryType);
			}}
			onHover={() => {
				setHovered(true);
			}}
			onLeave={() => {
				setHovered(false);
			}}
		>
			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				Size={UDim2.fromScale(1, 1)}
				BorderSizePixel={0}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={color}
					ImageColor3={color}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={
						props.selectedInventoryType === props.inventoryType
							? "rbxassetid://109250907266323"
							: "rbxassetid://105250247379697"
					}
					LayoutOrder={1}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					ScaleType={Enum.ScaleType.Fit}
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
				</imagelabel>
			</frame>
		</AnimatedButton>
	);
};

interface SellAllBtnProps {
	position: UDim2;
	size?: UDim2;
	anchorPoint?: Vector2;
	requiresGamepass: boolean;
	gamepassController?: GamepassController;
	visible: boolean;
}

export const SellAllBtn = (props: SellAllBtnProps) => {
	return (
		<AnimatedButton
			size={props.size ?? UDim2.fromScale(0.268, 1)}
			scales={new NumberRange(0.95, 1.05)}
			position={props.position}
			anchorPoint={props.anchorPoint ?? new Vector2(0.5, 0.5)}
			selectable={false}
			visible={props.visible}
			onClick={() => {
				if (props.requiresGamepass && !props.gamepassController?.getOwnsGamepass("SellEverywhere")) {
					// TODO: Prompt gamepass purchase.
					MarketplaceService.PromptGamePassPurchase(
						Players.LocalPlayer,
						gameConstants.GAMEPASS_IDS.SellEverywhere,
					);
					return;
				}
				Events.sellAll();
			}}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://92239062767450"}
				key={"Sell All Btn"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
				SliceCenter={new Rect(40, 86, 544, 87)}
				Selectable={false}
				SliceScale={0.3}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Label"}
					Position={UDim2.fromScale(0.5, 0.507)}
					Size={UDim2.fromScale(0.718, 0.66)}
					Text={"Sell All"}
					TextColor3={Color3.fromRGB(1, 75, 33)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={3} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Label"}
						Position={UDim2.fromScale(0.5, 0.43)}
						Size={UDim2.fromScale(1, 1)}
						Text={"Sell All"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={3} />
					</textlabel>
				</textlabel>
			</imagelabel>
		</AnimatedButton>
	);
};

interface ExitButtonProps {
	uiController: UiController;
	uiName: string;
	menuRefToClose?: React.RefObject<Frame>;
	onClick?: () => void;
	isMenuVisible: boolean;
}

export const ExitButton = (props: ExitButtonProps) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [size, sizeMotion] = useMotion(1);
	const [, closingMotion] = useMotion(0);

	const exit = () => {
		const startSz = props.menuRefToClose?.current!.Size;
		const endSz = UDim2.fromScale(0, 0);
		let cleanedStep = false;
		let cleanupStep = closingMotion.onStep((v) => {
			if (!props.menuRefToClose || !props.menuRefToClose.current || !startSz) {
				cleanupStep();
				cleanedStep = true;
				return;
			}
			props.menuRefToClose.current!.Size = startSz.Lerp(endSz, v);
			// TODO: Maybe also add fade out effect.
		});
		const cleanup = closingMotion.onComplete(() => {
			cleanup();
			props.uiController.closeUi(props.uiName);
			closingMotion.immediate(0);
			if (!cleanedStep) {
				cleanupStep();
				cleanedStep = true;
			}
		});
		if (props.menuRefToClose) {
			closingMotion.tween(1, {
				time: 0.1,
				style: Enum.EasingStyle.Linear,
				direction: Enum.EasingDirection.In,
			});
		} else {
			closingMotion.immediate(1);
		}
		props.onClick?.();
		setPressed(true);
		task.delay(0.1, () => setPressed(false));
	};

	useEffect(() => {
		// sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
		sizeMotion.spring(isHovered ? 1.2 : 1, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? 0.8 : isHovered ? 1.2 : 1, springs.responsive);
	}, [isPressed]);

	useEffect(() => {
		// Listen to Gamepad B button for our controller enjoyers
		const inputBegan = UserInputService.InputBegan.Connect((input) => {
			if (input.KeyCode === Enum.KeyCode.ButtonB && props.menuRefToClose?.current && props.isMenuVisible) {
				exit();
			}
		});

		return () => {
			inputBegan.Disconnect();
		};
	}, [props.menuRefToClose]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Exit Button"}
			Position={UDim2.fromScale(0.978, 0.0365)}
			Size={size.map((s) => {
				return UDim2.fromScale(0.123 * s, 0.194 * s);
			})}
			ZIndex={100}
			Active={!isPressed}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://105623320030835"}
				key={"ExitBtn"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Selectable={false}
				Size={UDim2.fromScale(0.824, 0.87)}
				SliceCenter={new Rect(0.5, 0.5, 0.5, 0.5)}
				SliceScale={0.4}
				ZIndex={100}
				// Setting modal allows player to move mouse if in first person, prevents them from getting stuck in menus if they were in first person.
				Modal={true}
				Active={props.isMenuVisible}
				Event={{
					MouseButton1Click: exit,
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => {
						setIsHovered(false);
						setPressed(false);
					},
				}}
			>
				<textlabel
					key={"TextLabel"}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					Size={UDim2.fromScale(0.6, 0.6)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					Text={"X"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextYAlignment={Enum.TextYAlignment.Center}
					ZIndex={105}
				/>
				{/* <uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.89} /> */}
			</imagebutton>
		</frame>
	);
};

interface IndexPageItemProps {
	itemName: keyof typeof targetConfig;
	unlocked: boolean;
	mapName: keyof typeof mapConfig;
	setSelected: Dispatch<{ targetName: keyof typeof targetConfig; mapName: keyof typeof mapConfig }>;
}

const IndexPageItem = (props: IndexPageItemProps) => {
	const itemCfg = fullTargetConfig[props.itemName];
	if (!itemCfg) {
		warn("Item config not found for item name: ", props.itemName);
		return undefined;
	}

	// Lord forgive me
	const CUSTOM_IMAGE_SIZES: Record<string, UDim2> = {
		"Bag of coins": UDim2.fromScale(0.9100381731987, 0.8529204726219177),
		Diamond: UDim2.fromScale(1, 1),
		"Gold chalice": UDim2.fromScale(0.8830496072769165, 0.8424146771430969),
		"Bejeweled pegleg": UDim2.fromScale(0.8560611605644226, 0.769302248954773),
		"Golden eyepatch": UDim2.fromScale(0.8470649123191833, 0.8739317655563354),
		"Treasure chest": UDim2.fromScale(0.7559078931808472, 0.7898862361907959),
		"Jade fish": UDim2.fromScale(0.7660993933677673, 0.8634262084960938),
		"Cool shell": UDim2.fromScale(0.8830496072769165, 0.8949432969093323),
		Necklace: UDim2.fromScale(0.8920458555221558, 0.8437936902046204),
		Ruby: UDim2.fromScale(0.8470649719238281, 0.8003919720649719),
		Ring: UDim2.fromScale(1, 1),
		"Ancient artifact": UDim2.fromScale(0.9460229277610779, 0.9154517650604248),
		"Volcano's tear": UDim2.fromScale(0.883049726486206, 0.8452515006065369),
		"Heat rock": UDim2.fromScale(0.7559078335762024, 0.7671473622322083),
		"Volcano rock": UDim2.fromScale(0.7559078335762024, 0.810268223285675),
		"Obsidian crown": UDim2.fromScale(0.9113808274269104, 0.8664734363555908),
		Skull: UDim2.fromScale(0.7119847536087036, 0.6986404657363892),
		"T-Rex skull": UDim2.fromScale(0.6676746606826782, 0.7543591260910034),
		"T-Rex tooth": UDim2.fromScale(0.7045997381210327, 0.6722814440727234),
		"Obsidian shard": UDim2.fromScale(0.883049726486206, 0.7757713794708252),
		"Lava bucket": UDim2.fromScale(0.7710647583007812, 0.7671473622322083),
		"Coal artifact": UDim2.fromScale(0.8227602243423462, 0.7757713794708252),
		Ammonoids: UDim2.fromScale(0.8744553327560425, 0.8452515006065369),
		"Jade statue": UDim2.fromScale(0.7559078335762024, 0.7543591260910034),
		Icecicle: UDim2.fromScale(1, 1),
		"Frozen teddy": UDim2.fromScale(0.7267543077468872, 0.6981539130210876),
		"Mammoth tusk": UDim2.fromScale(0.7193697094917297, 0.6809055805206299),
		"Topaz amulet": UDim2.fromScale(0.7858352065086365, 0.632728636264801),
		Gift: UDim2.fromScale(0.8892248868942261, 0.8484111428260803),
		"Small gift": UDim2.fromScale(0.7559078335762024, 0.7498990297317505),
		"Viking sword": UDim2.fromScale(0.8523002862930298, 0.8016439080238342),
		"Frozen ring": UDim2.fromScale(0.7267547249794006, 0.6981539726257324),
		"Viking helmet": UDim2.fromScale(0.7559078335762024, 0.7671473622322083),
		"Viking dagger": UDim2.fromScale(0.9421296715736389, 0.8884709477424622),
		"Sapphire gem": UDim2.fromScale(0.8375303149223328, 0.8884709477424622),
		"Diamond yeti": UDim2.fromScale(0.5812065005302429, 0.8484105467796326),
	};

	return (
		<frame Size={UDim2.fromScale(0.25, 0.343)} BackgroundTransparency={1} LayoutOrder={itemCfg.rarity}>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				scales={new NumberRange(0.95, 1.05)}
				onClick={() => props.setSelected({ targetName: props.itemName, mapName: props.mapName })}
				selectable={true}
			>
				{/* Background Color Image, used for rarity. */}
				<imagelabel
					Size={UDim2.fromScale(1, 1)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					BackgroundTransparency={1}
					ImageColor3={gameConstants.RARITY_COLORS[itemCfg.rarityType]}
					Image={"rbxassetid://118068418947215"}
				>
					<imagelabel
						Size={CUSTOM_IMAGE_SIZES[props.itemName] ?? UDim2.fromScale(0.581, 0.848)}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Position={UDim2.fromScale(0.5, 0.5)}
						BackgroundTransparency={1}
						ScaleType={Enum.ScaleType.Fit}
						Image={fullTargetConfig[props.itemName].itemImage}
						ImageTransparency={!props.unlocked ? 0.5 : 0}
					>
						<uigradient
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(0, 0, 0)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
								])
							}
							Enabled={!props.unlocked}
							key={".1"}
						/>
					</imagelabel>
				</imagelabel>
			</AnimatedButton>
		</frame>
	);
};

const RefundPointFrame = () => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [size, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = [0.95, 1.05];

	useEffect(() => {
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
			key={"Refund Points"}
			Position={UDim2.fromScale(-5.82e-8, 0.0774)}
			Size={UDim2.fromScale(0.281, 0.923)}
		>
			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Refund Point Label"}
				Size={UDim2.fromScale(0.85, 0.444)}
				Text={"Refund Points!"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Refund Points  Btn Frame"}
				Position={UDim2.fromScale(0.558, 0.722)}
				Size={UDim2.fromScale(0.981, 0.636)}
			>
				<imagebutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://92239062767450"}
					key={"Buy Btn"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={size.map((s) => {
						return UDim2.fromScale(1.03 * s, 1.07 * s);
					})}
					SliceCenter={new Rect(47, 94, 539, 94)}
					Selectable={true}
					Event={{
						MouseEnter: () => setIsHovered(true),
						MouseLeave: () => setIsHovered(false),
						MouseButton1Click: () => {
							// TODO: Prompt refund point devproduct
							MarketplaceService.PromptProductPurchase(
								Players.LocalPlayer,
								gameConstants.DEVPRODUCT_IDS.RefundPoints,
							);
							setPressed(true);
							task.delay(0.1, () => setPressed(false));
						},
					}}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Discount Number"}
						Position={UDim2.fromScale(0.5, 0.492)}
						Size={UDim2.fromScale(0.829, 0.524)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.05, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://75287275007438"}
							key={"Robux"}
							Position={UDim2.fromScale(0.262, 0.00802)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.399, 0.984)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Timer"}
							Position={UDim2.fromScale(0.569, 0.5)}
							Size={UDim2.fromScale(0.223, 1)}
							Text={"99"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 66, 34)} Thickness={4} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.00487, 0)}
								PaddingTop={new UDim(0.00487, 0)}
							/>
						</textlabel>
					</frame>
				</imagebutton>
			</frame>

			<uilistlayout
				key={"UIListLayout"}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</frame>
	);
};

export type InventoryItemProps = {
	itemImage: string;
	itemName: string;
	rarity: Rarity;
	stats: ItemStat[];
	isEquipped: boolean;
	itemType: Extract<ItemType, "Target"> | Exclude<ItemType, "Target">;
	count: number;
};

export const MENUS = {
	Inventory: "Inventory",
	Skills: "Skills",
	Shop: "Shop",
	Index: "Index",
};

const MENU_INDICIES = {
	Inventory: 0,
	Skills: 1,
	Index: 2,
};

const INVENTORY_MENU_INDICIES = {
	Shovels: 0,
	MetalDetectors: 1,
	Target: 2,
	Potions: 3,
};

interface MainUiProps {
	visible: boolean;
	menu?: keyof typeof MENUS;
	displayInventoryType?: ItemType;
	uiController: UiController;
	gamepassController: GamepassController;
}

const cachedInventories = {} as Record<ItemType, InventoryItemProps[]>;

const inventoryRequests: Array<Promise<void>> = [];

export const InventoryComponent = (props: MainUiProps) => {
	const [levelState, setLevelState] = React.useState<
		{ level: number; xp: number; xpMax: number; skillPoints: number } | undefined
	>();
	const [selectedInventoryType, setSelectedInventoryType] = React.useState<ItemType>("MetalDetectors");
	const [unlockedTreasures, setUnlockedTreasures] = useState<Set<keyof typeof targetConfig>>();
	const [skillState, setSkills] = React.useState<Record<SkillName, number>>();
	const [inventory, setInventory] = React.useState<InventoryItemProps[]>([]);
	const [targetInventoryUsedSize, setTargetInventoryUsedSize] = useState(0);
	const [enabledMenu, setEnabledMenu] = React.useState(MENUS.Inventory);
	const [menuIndex, setMenuIndex] = React.useState(0);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const [selectedIndexItem, setSelectedIndexItem] = useState<{
		targetName: keyof typeof targetConfig | "";
		mapName: keyof typeof mapConfig | "";
	}>({ targetName: "", mapName: "" });
	const [loading, setLoading] = React.useState(false);
	const [loadingSpring, setLoadingSpring] = useMotion(1);
	const [targetInventoryCapacity, setTargetInventoryCapacity] = useState(
		gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY,
	);
	const [visible, setVisible] = React.useState(false);
	const [gamepadEnabled, setGamepadEnabled] = React.useState(UserInputService.GamepadEnabled);
	const menuRef = createRef<Frame>();

	function updateInventory(
		inventoryType: ItemType,
		[equipped, inv]: [
			{
				equippedShovel: keyof typeof shovelConfig;
				equippedDetector: keyof typeof metalDetectorConfig;
				equippedTreasure: keyof typeof fullTargetConfig;
			},
			Array<Item>,
		],
		shouldSetInventory: boolean = true,
	) {
		const newInventory: InventoryItemProps[] = [];

		inv.forEach((item) => {
			if (item.type !== inventoryType) return;
			if (newInventory.find((invItem) => invItem.itemName === item.name)) return;
			const stats: InventoryItemProps["stats"] = [];

			if (item.type === "MetalDetectors") {
				// Populate stats
				stats.push(
					{ key: "detectionDistance", value: item.strength, icon: "rbxassetid://136640572681412" },
					{ key: "luck", value: item.luck, icon: "rbxassetid://85733831609212" },
				);
			} else if (item.type === "Shovels") {
				// Populate stats
				stats.push({
					key: "strength",
					value: item.strengthMult,
					icon: "rbxassetid://100052274681629",
				});
			} else if (item.type === "Target") {
				// Populate stats
				stats.push({ key: "weight", value: item.weight, icon: "" });
			}

			const cfg =
				item.type === "MetalDetectors"
					? metalDetectorConfig[item.name]
					: item.type === "Shovels"
					? shovelConfig[item.name]
					: item.type === "Potions"
					? potionConfig[item.name]
					: fullTargetConfig[item.name];

			// Push to new inventory
			newInventory.push({
				itemType: item.type,
				isEquipped: [equipped.equippedDetector, equipped.equippedShovel, equipped.equippedTreasure].includes(
					item.name,
				),
				itemImage: cfg.itemImage,
				itemName: item.name,
				rarity: cfg.rarityType,
				count: inv.filter((invItem) => invItem.name === item.name).size(),
				stats,
			});
		});

		cachedInventories[inventoryType] = newInventory;
		if (shouldSetInventory) {
			setInventory(newInventory);
		}
		if (inventoryType === "Target") {
			setTargetInventoryUsedSize(inv.size());
			treasureInventoryAtom(newInventory);
		}
	}

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (props.menu) {
			if (props.menu in MENUS) {
				setEnabledMenu(props.menu);
			} else {
				warn("Invalid menu type:", props.menu);
			}
		}
	}, [props.menu]);

	React.useEffect(() => {
		if (enabledMenu === MENUS.Inventory) {
			const cache = cachedInventories[selectedInventoryType];
			if (cache === undefined) {
				setLoading(true);
			}

			// While we wait for the updated inventory to arrive, set it to a cached version if it exists.
			setInventory(cache ?? []);

			// If any outgoing inventory requests are still pending, cancel them.
			for (const [i, request] of Object.entries(inventoryRequests)) {
				request.cancel();
				inventoryRequests.remove(i);
			}

			inventoryRequests.push(
				Functions.getInventory(selectedInventoryType)
					.then((items) => {
						updateInventory(selectedInventoryType, items, true);
					})
					.catch((e: NetworkingFunctionError) => {
						if (e === NetworkingFunctionError.Cancelled) {
							return;
						}
						warn("Error getting inventory", e);
					})
					.finally(() => {
						setLoading(false);
					}),
			);
		}
	}, [visible, enabledMenu, selectedInventoryType]);

	React.useEffect(() => {
		treasureCountAtom(targetInventoryUsedSize);
	}, [targetInventoryUsedSize]);

	React.useEffect(() => {
		const connection = Events.updateInventory.connect((inventoryType, inv) => {
			updateInventory(inventoryType, inv, inventoryType === selectedInventoryType);
		});

		return () => {
			connection.Disconnect();
		};
	}, [selectedInventoryType]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.8, 0.792), springs.responsive);
		} else {
			const connection = Signals.inventoryFull.Connect(() => {
				if (visible) {
					connection?.Disconnect();
					return;
				}
				props.uiController.toggleUi(gameConstants.MAIN_UI, {
					menu: MENUS.Inventory,
					displayInventoryType: "Target",
				});
			});
			popInMotion.immediate(UDim2.fromScale(0, 0));
			return () => {
				connection?.Disconnect();
			};
		}
	}, [visible]);

	React.useEffect(() => {
		if (visible && props.displayInventoryType) {
			setSelectedInventoryType(props.displayInventoryType);
		}
	}, [visible, props.displayInventoryType]);

	React.useEffect(() => {
		if (loading) {
			setLoadingSpring.spring(0, springs.crawl);
		} else {
			setLoadingSpring.immediate(1);
		}
	}, [loading]);

	React.useEffect(() => {
		// Signals.inventoryFull.Connect(() => {
		// 	setEnabledMenu(MENUS.Inventory);
		// 	setSelectedInventoryType("Target");
		// });

		const preloadInventories = () => {
			for (const inventory of ["MetalDetectors", "Shovels", "Potions", "Target"] as const) {
				Functions.getInventory(inventory)
					.then((items) => {
						if (!items) {
							// Profile probably not ready yet.
							return;
						}
						updateInventory(inventory, items, false);

						if (selectedInventoryType === "Target") {
							const [, inv] = items;
							setTargetInventoryUsedSize(inv.size());
						}
					})
					.catch((e) => {
						warn(e);
					});
			}
		};

		// Retroload inventories incase the profile is ready before the component is mounted.
		preloadInventories();

		Functions.getSkills()
			.then((skills) => {
				setSkills(skills);
			})
			.catch(warn);
		Functions.getLevelData()
			.then((levelData) => {
				setLevelState(levelData);
			})
			.catch(warn);

		Events.updateSkills.connect((skills) => {
			setSkills(skills);
		});
		Events.updateLevelUi.connect((level, xp, xpMax, skillPoints) => {
			setLevelState({ level, xp, xpMax, skillPoints });
		});

		Functions.getUnlockedTargets().then(setUnlockedTreasures).catch(warn);
		Events.updateUnlockedTargets.connect(setUnlockedTreasures);

		Functions.getInventorySize()
			.then((size) => {
				setTargetInventoryCapacity(size);
				inventorySizeAtom(size);
			})
			.catch(warn);

		// Events.updateInventorySize: (size: number) => void;
		Events.updateInventorySize.connect((size) => {
			setTargetInventoryCapacity(size);
			inventorySizeAtom(size);
		});

		Events.updateTreasureCount.connect((count) => {
			setTargetInventoryUsedSize(count);
			treasureCountAtom(count);
		});

		UserInputService.GamepadConnected.Connect(() => {
			setGamepadEnabled(true);
		});

		UserInputService.GamepadDisconnected.Connect(() => {
			setGamepadEnabled(false);
		});

		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return;
			if (input.KeyCode === Enum.KeyCode.DPadDown) {
				setMenuIndex((prev) => {
					const newIndex = (prev + 1) % 3;
					setEnabledMenu(
						Object.keys(MENU_INDICIES).find((key) => MENU_INDICIES[key] === newIndex) as keyof typeof MENUS,
					);
					return newIndex;
				});
			} else if (input.KeyCode === Enum.KeyCode.DPadUp) {
				setMenuIndex((prev) => {
					const newIndex = (prev - 1 + 3) % 3;
					setEnabledMenu(
						Object.keys(MENU_INDICIES).find((key) => MENU_INDICIES[key] === newIndex) as keyof typeof MENUS,
					);
					return newIndex;
				});
			} else if (input.KeyCode === Enum.KeyCode.DPadLeft) {
				setSelectedInventoryType((prev) => {
					prev = prev as Exclude<ItemType, "Boats">;
					const keys = Object.keys(INVENTORY_MENU_INDICIES);
					const newIndex = (INVENTORY_MENU_INDICIES[prev] - 1 + keys.size()) % keys.size();
					return keys.find((key) => INVENTORY_MENU_INDICIES[key] === newIndex) as ItemType;
				});
			} else if (input.KeyCode === Enum.KeyCode.DPadRight) {
				setSelectedInventoryType((prev) => {
					prev = prev as Exclude<ItemType, "Boats">;
					const keys = Object.keys(INVENTORY_MENU_INDICIES);
					const newIndex = (INVENTORY_MENU_INDICIES[prev] + 1) % keys.size();
					return keys.find((key) => INVENTORY_MENU_INDICIES[key] === newIndex) as ItemType;
				});
			}
		});

		// This is part of my `renameRemotes` "security" measure. It will deter script kiddies, but not a fully determined exploiter.
		// Read `renameRemotes` in server/services/security for more information on how they might get around it and why it's not foolproof (or literally foolproof).
		// It hides the "id" attribute which would help the exploiter identify the remote in the Events/Functions table.
		// It's attempting to hide in plain sight here.
		for (const remote of ReplicatedStorage.GetDescendants()) {
			if (remote.GetAttribute("id") !== undefined) {
				remote.SetAttribute("id", undefined);
			}
		}
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Container"}
			Position={UDim2.fromScale(0.48, 0.45)}
			Size={popInSz}
			Visible={visible}
			ref={menuRef}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Inventory Container"}
				Position={UDim2.fromScale(0.601, 0.53)}
				Size={UDim2.fromScale(0.695, 0.857)}
				ZIndex={10}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.64} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://133515423550411"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(0.100000001, 0.100000001, 0.100000001, 0.100000001)}
				>
					{/* <uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.66} /> */}
				</imagelabel>

				<ExitButton
					uiController={props.uiController}
					uiName={gameConstants.MAIN_UI}
					menuRefToClose={menuRef}
					isMenuVisible={visible}
				/>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Inventory Page"}
					Position={UDim2.fromScale(0.0351, 0.0528)}
					Size={UDim2.fromScale(0.927, 0.887)}
					Visible={enabledMenu === MENUS.Inventory}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(30, 42, 79)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Item Container"}
						Position={UDim2.fromScale(2.2e-7, 0.195)}
						Size={UDim2.fromScale(1, 0.798)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.0289, 0)} />

						<frame
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"EmptyMessage"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(0.719, 0.389)}
							Visible={selectedInventoryType === "Target" && targetInventoryUsedSize === 0}
						>
							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.491, 0.343)}
								Size={UDim2.fromScale(0.931, 0.411)}
								Text={"You have no treasure!"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 24, 46)} Thickness={4} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0822, 0)}
									PaddingLeft={new UDim(0.136, 0)}
									PaddingRight={new UDim(0.136, 0)}
									PaddingTop={new UDim(0.0822, 0)}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Label"}
								Position={UDim2.fromScale(0.5, 0.728)}
								Size={UDim2.fromScale(0.791, 0.242)}
								Text={"Dig and find a treasure!"}
								TextColor3={Color3.fromRGB(191, 201, 231)}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 24, 46)} Thickness={4} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0825, 0)}
									PaddingLeft={new UDim(0.218, 0)}
									PaddingRight={new UDim(0.218, 0)}
									PaddingTop={new UDim(0.0825, 0)}
								/>
							</textlabel>

							<uilistlayout
								key={"UIListLayout"}
								HorizontalAlignment={Enum.HorizontalAlignment.Center}
								SortOrder={Enum.SortOrder.LayoutOrder}
								VerticalAlignment={Enum.VerticalAlignment.Center}
							/>
						</frame>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://101723443450777"}
							key={"Bubbles"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.0289, 0)} />
						</imagelabel>

						<scrollingframe
							AutomaticCanvasSize={
								selectedInventoryType === "Target" ? Enum.AutomaticSize.Y : Enum.AutomaticSize.X
							}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Treasures Container"}
							ScrollBarImageTransparency={1}
							ScrollBarThickness={0}
							CanvasSize={UDim2.fromScale(0, 0)}
							ScrollingDirection={
								selectedInventoryType === "Target"
									? Enum.ScrollingDirection.Y
									: Enum.ScrollingDirection.X
							}
							Selectable={false}
							Size={UDim2.fromScale(0.978, 0.978)}
							Visible={enabledMenu === MENUS.Inventory}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(selectedInventoryType === "Target" ? 0.02 : 0.01, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
								Wraps={selectedInventoryType === "Target" ? true : false}
								VerticalAlignment={
									selectedInventoryType === "Target"
										? Enum.VerticalAlignment.Top
										: Enum.VerticalAlignment.Center
								}
							/>

							<textlabel
								Size={UDim2.fromScale(1, 1)}
								TextScaled={true}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								TextTransparency={loadingSpring}
								Text={`Loading ${spaceWords(selectedInventoryType)}s...`}
								Visible={loading}
							/>

							{inventory.map((itemProps) => {
								if (itemProps.itemType === "Target") {
									// Pass items with type "Target" to TreasureItemComponent

									return (
										<TreasureItemComponent
											key={itemProps.itemName}
											{...(itemProps as TreasureItemComponentProps)}
										/>
									);
								} else if (
									itemProps.itemType === "MetalDetectors" ||
									itemProps.itemType === "Shovels" ||
									itemProps.itemType === "Potions"
								) {
									// Pass only compatible types to GenericItemComponent
									return (
										<GenericItemComponent
											key={itemProps.itemName}
											{...(itemProps as Omit<GenericItemProps, "itemType"> & {
												itemType: Exclude<ItemType, "Target">;
											})}
										/>
									);
								}
							})}
						</scrollingframe>
					</frame>

					{/* Inventory Nav */}
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Top Navigation"}
						Position={UDim2.fromScale(0, 0.025)}
						Size={UDim2.fromScale(0.931, 0.14)}
					>
						{/* Search Bar */}
						{/* <imagelabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://104980497933554"}
							LayoutOrder={5}
							key={"Search Bar"}
							Position={UDim2.fromScale(0.625, 0.5)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.394, 0.79)}
							SliceCenter={new Rect(45, 28, 918, 125)}
							SliceScale={0.3}
							Visible={false}
						>
							<textbox
								key={"TextBox"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								PlaceholderText={"Search..."}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(0.834, 0.358)}
								Text={""}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								Selectable={false}
							/>
						</imagelabel> */}

						<InventorySelectorTab
							inventoryType="Shovels"
							order={1}
							selectedInventoryType={selectedInventoryType}
							setSelectedInventoryType={setSelectedInventoryType}
							icon={"rbxassetid://101307691874432"}
							position={UDim2.fromScale(0.05, 0.5)}
						/>
						<InventorySelectorTab
							inventoryType="MetalDetectors"
							order={2}
							selectedInventoryType={selectedInventoryType}
							setSelectedInventoryType={setSelectedInventoryType}
							icon={"rbxassetid://139989446078706"}
							position={UDim2.fromScale(0.165, 0.5)}
						/>
						<InventorySelectorTab
							inventoryType="Target"
							order={3}
							selectedInventoryType={selectedInventoryType}
							setSelectedInventoryType={setSelectedInventoryType}
							icon={"rbxassetid://90146219889959"}
							position={UDim2.fromScale(0.28, 0.5)}
						/>
						<InventorySelectorTab
							inventoryType="Potions"
							order={4}
							selectedInventoryType={selectedInventoryType}
							setSelectedInventoryType={setSelectedInventoryType}
							icon={"rbxassetid://93760012973987"}
							position={UDim2.fromScale(0.395, 0.5)}
						/>

						{/* Sell All Btn */}
						<SellAllBtn
							position={UDim2.fromScale(0.68, 0.5)}
							requiresGamepass={true}
							gamepassController={props.gamepassController}
							visible={selectedInventoryType === "Target"}
						/>
					</frame>
				</frame>

				{/* Skills Page */}
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Skills Page"}
					Position={UDim2.fromScale(0.035, 0.053)}
					Size={UDim2.fromScale(0.928, 0.887)}
					Visible={enabledMenu === MENUS.Skills}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Skill Points"}
						Position={UDim2.fromScale(0.5, 0.368)}
						Size={UDim2.fromScale(1, 0.723)}
					>
						<uilistlayout
							key={"UIListLayout"}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.03, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>

						<SkillFrame
							image="rbxassetid://115275171647711"
							title="strength"
							levelText={`LV. ${skillState?.strength ?? 1}`}
						/>
						<SkillFrame
							image="rbxassetid://83833460426334"
							title="luck"
							levelText={`LV. ${skillState?.luck ?? 1}`}
						/>
						<SkillFrame
							image="rbxassetid://121224666125765"
							imageRotation={90}
							title="detection"
							titleSize={new UDim2(0.402, 0, 0.659, 0)}
							levelText={`LV. ${skillState?.detection ?? 1}`}
						/>
					</frame>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Points Info"}
						Position={UDim2.fromScale(0.000901, 0.736)}
						Size={UDim2.fromScale(0.988, 0.25)}
					>
						<RefundPointFrame />

						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Bottom}
						/>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Available Points"}
							Position={UDim2.fromScale(0.281, 0.19)}
							Size={UDim2.fromScale(0.73, 0.81)}
						>
							<uilistlayout
								key={"UIListLayout"}
								HorizontalAlignment={Enum.HorizontalAlignment.Center}
								SortOrder={Enum.SortOrder.LayoutOrder}
								VerticalAlignment={Enum.VerticalAlignment.Center}
							/>

							<textlabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Refund Point Label"}
								Position={UDim2.fromScale(0.0748, 0.0538)}
								Size={UDim2.fromScale(0.85, 0.413)}
								Text={`Available Points: ${levelState?.skillPoints ?? 0}`}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
							</textlabel>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Progress"}
								Position={UDim2.fromScale(0.0149, 0.509)}
								Size={UDim2.fromScale(0.97, 0.43)}
							>
								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									HorizontalAlignment={Enum.HorizontalAlignment.Center}
									Padding={new UDim(0.03, 0)}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>

								<textlabel
									AutomaticSize={Enum.AutomaticSize.X}
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
									key={"Refund Point Label"}
									Position={UDim2.fromScale(0.106, -0.101)}
									Size={UDim2.fromScale(0.0814, 1.2)}
									Text={tostring(levelState?.level ?? 1)}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
								>
									<uistroke key={"UIStroke"} Thickness={3} />
								</textlabel>

								<frame
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									LayoutOrder={1}
									key={"Progress Bar"}
									Position={UDim2.fromScale(0.226, 0.311)}
									Size={UDim2.fromScale(0.559, 0.586)}
								>
									<imagelabel
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"rbxassetid://99298443198180"}
										key={"Unfilled Progress Bar"}
										ScaleType={Enum.ScaleType.Fit}
										Size={UDim2.fromScale(1, 1)}
									/>

									<frame
										AnchorPoint={new Vector2(0, 0.5)}
										BackgroundColor3={Color3.fromRGB(91, 110, 167)}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										ClipsDescendants={true}
										key={"Scriptable  Progress Bar"}
										Position={UDim2.fromScale(0.03, 0.4)}
										Size={UDim2.fromScale(0.94, 0.45)}
									>
										<uicorner key={"UICorner"} />

										<frame
											AnchorPoint={new Vector2(0, 0.5)}
											BackgroundColor3={Color3.fromRGB(48, 242, 103)}
											BorderColor3={Color3.fromRGB(0, 0, 0)}
											BorderSizePixel={0}
											key={"Scriptable  Progress Bar"}
											Position={UDim2.fromScale(0, 0.5)}
											Size={UDim2.fromScale(
												(levelState?.xp ?? 0.5) / (levelState?.xpMax ?? 1),
												1,
											)}
										>
											<uicorner key={"UICorner"} />
										</frame>
									</frame>
								</frame>

								<textlabel
									AutomaticSize={Enum.AutomaticSize.X}
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
									LayoutOrder={2}
									key={"Refund Point Label"}
									Position={UDim2.fromScale(0.744, -0.101)}
									Size={UDim2.fromScale(0.0822, 1.2)}
									Text={tostring((levelState?.level ?? 2) + 1)}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
								>
									<uistroke key={"UIStroke"} Thickness={3} />
								</textlabel>
							</frame>
						</frame>
					</frame>
				</frame>

				{/* Index Page */}
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Index Page"}
					Position={UDim2.fromScale(0.0335, 0.0724)}
					Size={UDim2.fromScale(0.938, 0.855)}
					Visible={enabledMenu === MENUS.Index}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(20, 33, 79)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Index Container"}
						Position={UDim2.fromScale(0, 0.05)}
						Size={UDim2.fromScale(0.671, 0.96)}
						ClipsDescendants={true}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.0314, 0)} />

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://92233762650741"}
							ImageTransparency={0.77}
							key={"Background"}
							Size={UDim2.fromScale(1, 1)}
						/>

						<uistroke key={"UIStroke"} Thickness={3.6} />

						<scrollingframe
							Active={true}
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticCanvasSize={Enum.AutomaticSize.Y}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							CanvasSize={new UDim2()}
							key={"Index Items Scrolling"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Selectable={false}
							ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
							ScrollBarThickness={0}
							ScrollingDirection={Enum.ScrollingDirection.Y}
							Size={UDim2.fromScale(1, 1)}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
								Wraps={true}
							/>

							{Object.entries(mapConfig).map(([isleName, isleCfg]) => {
								return (
									<frame
										Size={UDim2.fromScale(1, 0.2)}
										BackgroundTransparency={1}
										LayoutOrder={isleCfg.order}
									>
										<textlabel
											Text={` - ${isleName}`}
											BackgroundTransparency={1}
											Font={Enum.Font.BuilderSansBold}
											TextColor3={new Color3(1, 1, 1)}
											TextXAlignment={Enum.TextXAlignment.Left}
											AnchorPoint={new Vector2(0.5, 0.5)}
											Size={UDim2.fromScale(1, 0.5)}
											Position={UDim2.fromScale(0.5, 0.5)}
											TextYAlignment={Enum.TextYAlignment.Bottom}
											TextScaled={true}
										>
											<uistroke key={"UIStroke"} Thickness={4.5} />
										</textlabel>
									</frame>
								);
							})}

							{Object.entries(mapConfig).map(([isleName, isleCfg]) => {
								return (
									<frame
										BackgroundTransparency={1}
										Size={UDim2.fromScale(1, 0.75)}
										key={isleName}
										LayoutOrder={isleCfg.order}
									>
										<uilistlayout
											Wraps={true}
											FillDirection={Enum.FillDirection.Horizontal}
											SortOrder={Enum.SortOrder.LayoutOrder}
										/>
										{isleCfg.targetList.map((itemName) => {
											if (trashConfig[itemName]) return undefined; // Ignore trash items
											return (
												<IndexPageItem
													key={itemName}
													itemName={itemName}
													unlocked={unlockedTreasures?.has(itemName) ?? false}
													mapName={isleName}
													setSelected={(selection) =>
														setSelectedIndexItem({
															targetName: selection.targetName,
															mapName: selection.mapName,
														})
													}
												/>
											);
										})}
									</frame>
								);
							})}
						</scrollingframe>
					</frame>

					{/* <imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://104980497933554"}
						LayoutOrder={5}
						key={"Search Bar"}
						Position={UDim2.fromScale(0.189, 0.0812)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.394, 0.115)}
						SliceCenter={new Rect(45, 28, 918, 125)}
						SliceScale={0.3}
					>
						<textbox
							key={"TextBox"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							PlaceholderText={"Search..."}
							Position={UDim2.fromScale(0.518, 0.5)}
							Size={UDim2.fromScale(0.798, 0.358)}
							Text={""}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					</imagelabel> */}

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Display Info"}
						Position={UDim2.fromScale(0.695, -0.0168)}
						Size={UDim2.fromScale(0.305, 1.01)}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://90863388701506"}
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
								key={"TreasureIcon"}
								Position={UDim2.fromScale(0.5, 0.25)}
								Size={UDim2.fromScale(0.8, 0.4)}
								Image={
									selectedIndexItem.targetName !== ""
										? targetConfig[selectedIndexItem.targetName]?.itemImage ??
										  "rbxassetid://113782765462239"
										: "rbxassetid://113782765462239"
								}
								ImageTransparency={
									unlockedTreasures?.has(selectedIndexItem.targetName) === false ? 0.4 : 0
								}
							>
								<uicorner key={"UICorner"} />
								<uigradient
									Color={new ColorSequence(new Color3(0, 0, 0))}
									Enabled={unlockedTreasures?.has(selectedIndexItem.targetName) === false}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</imagelabel>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Index Info"}
							Position={UDim2.fromScale(0.12, 0.457)}
							Size={UDim2.fromScale(0.791, 0.188)}
						>
							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Display Name"}
								Position={UDim2.fromScale(0.5, 0.24)}
								Size={UDim2.fromScale(1, 0.481)}
								Text={selectedIndexItem.targetName}
								TextColor3={
									selectedIndexItem.targetName !== ""
										? gameConstants.RARITY_COLORS[
												targetConfig[selectedIndexItem.targetName].rarityType
										  ]
										: Color3.fromRGB(255, 255, 255)
								}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0146, 0)}
									PaddingLeft={new UDim(0.0612, 0)}
									PaddingRight={new UDim(0.0612, 0)}
									PaddingTop={new UDim(0.0146, 0)}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Chance"}
								Position={UDim2.fromScale(0.5, 0.689)}
								Size={UDim2.fromScale(1, 0.316)}
								Text={
									selectedIndexItem.targetName !== "" && selectedIndexItem.mapName !== ""
										? `1 in ${shortenNumber(
												getOneInXChance(
													selectedIndexItem.targetName,
													selectedIndexItem.mapName,
												),
												false,
										  )}`
										: ""
								}
								TextColor3={Color3.fromRGB(255, 213, 0)}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
							</textlabel>

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
							key={"Description"}
							Position={UDim2.fromScale(0.12, 0.635)}
							Size={UDim2.fromScale(0.791, 0.288)}
						>
							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								AutomaticSize={Enum.AutomaticSize.Y}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Description Label"}
								Position={UDim2.fromScale(0.5, 0.33)}
								Size={UDim2.fromScale(1, 0.659)}
								Text={
									targetConfig[selectedIndexItem.targetName] !== undefined &&
									targetConfig[selectedIndexItem.targetName].description !== undefined
										? targetConfig[selectedIndexItem.targetName].description
										: ""
								}
								TextColor3={Color3.fromRGB(187, 199, 234)}
								TextScaled={true}
								TextWrapped={true}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0109, 0)}
									PaddingLeft={new UDim(0.0144, 0)}
									PaddingRight={new UDim(0.0144, 0)}
									PaddingTop={new UDim(0.0109, 0)}
								/>
							</textlabel>
						</frame>

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.55} />
					</frame>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.82} />
				</frame>
			</frame>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Categories"}
				Position={UDim2.fromScale(0.16, 0.58)}
				Size={UDim2.fromScale(0.295, 0.842)}
			>
				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Right}
					Padding={new UDim(0.005, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				{/* INVENTORY BUTTON */}
				<CategoryButton
					title="Inventory"
					iconId="rbxassetid://90146219889959"
					position={UDim2.fromScale(1, 0.78)}
					size={UDim2.fromScale(0.91, 0.212)}
					setCategory={setEnabledMenu}
					currentCategory={enabledMenu}
					iconSz={UDim2.fromScale(0.161, 0.469)}
				/>

				{/* SKILLS BUTTON */}
				<CategoryButton
					title="Skills"
					iconId="rbxassetid://107635803594907"
					position={UDim2.fromScale(0.597, 0.323)}
					size={UDim2.fromScale(0.807, 0.212)}
					currentCategory={enabledMenu}
					setCategory={setEnabledMenu}
					paddingSz={0}
				/>

				{/* INDEX BUTTON */}
				<CategoryButton
					title="Index"
					iconId="rbxassetid://107635803594907"
					position={UDim2.fromScale(0.617, 0.54)}
					size={UDim2.fromScale(0.766, 0.212)}
					paddingSz={0}
					currentCategory={enabledMenu}
					setCategory={setEnabledMenu}
				/>

				<frame
					Visible={gamepadEnabled}
					BackgroundTransparency={1}
					Size={UDim2.fromScale(1, 0.2)}
					LayoutOrder={100}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 5)}
					/>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxasset://textures/ui/Controls/DefaultController/DPadUp@2x.png"}
						Size={UDim2.fromScale(0.5, 0.5)}
						LayoutOrder={1}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
					</imagelabel>

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxasset://textures/ui/Controls/DefaultController/DPadDown@2x.png"}
						Size={UDim2.fromScale(0.5, 0.5)}
						LayoutOrder={2}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
					</imagelabel>
				</frame>
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.05} />

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Treasure Count"}
				Position={UDim2.fromScale(0.58, 0.95)}
				Size={UDim2.fromScale(0.367, 0.05)}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Count"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(0.903, 1)}
					Text={`Treasures: ${targetInventoryUsedSize}/${targetInventoryCapacity}`}
					TextColor3={
						targetInventoryUsedSize >= targetInventoryCapacity
							? Color3.fromRGB(255, 0, 0)
							: Color3.fromRGB(255, 255, 255)
					}
					TextScaled={true}
					TextWrapped={true}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextXAlignment={Enum.TextXAlignment.Right}
					Visible={enabledMenu === MENUS.Inventory && selectedInventoryType === "Target"}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(20, 38, 80)} Thickness={4} />

					<uipadding
						key={"UIPadding"}
						PaddingBottom={new UDim(0.0292, 0)}
						PaddingLeft={new UDim(0.00664, 0)}
						PaddingRight={new UDim(0.00664, 0)}
						PaddingTop={new UDim(0.0292, 0)}
					/>
				</textlabel>
			</frame>
		</frame>
	);
};
