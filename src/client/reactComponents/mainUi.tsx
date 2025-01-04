import React, { Dispatch, SetStateAction } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { gameConstants } from "shared/constants";
import ViewportModel from "./itemViewport";
import { Item, type ItemType, Rarity, SkillName } from "shared/networkTypes";
import { Events, Functions } from "client/network";
import { MarketplaceService, Players, ReplicatedStorage } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { ProductType, shopConfig, ShopItem } from "shared/config/shopConfig";
import { spaceWords } from "shared/util/nameUtil";
import { shovelConfig } from "shared/config/shovelConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { targetConfig } from "shared/config/targetConfig";

export function capitalizeWords(str: string): string {
	return str
		.split(" ")
		.map((word) => {
			if (word.size() === 0) return word;
			return word.sub(0, 1).upper() + word.sub(2);
		})
		.join(" ");
}

interface ItemStat {
	key: string;
	value: string | number;
	icon: string; // Icon emoji or asset ID
}

interface GenericItemProps {
	itemImage: string;
	itemName: string;
	rarity: Rarity;
	itemType: ItemType;
	stats: ItemStat[]; // List of stats to display
	isEquipped: boolean;
}

const GenericItemComponent: React.FC<GenericItemProps> = ({
	itemImage,
	itemName,
	rarity,
	stats,
	itemType,
	isEquipped,
}) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(203, 138, 58)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"InventoryItem"}
			Size={UDim2.fromScale(0.15, 0.932)}
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
				{/* <ViewportModel
					size={UDim2.fromScale(1, 1)}
					backgroundColor={gameConstants.RARITY_COLORS[rarity]}
					model={itemModel}
					spin={true}
					position={UDim2.fromScale(0.5, 0.5)}
				/> */}
				<imagelabel Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Image={itemImage} />

				<textbutton
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={isEquipped ? 0.65 : 1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://12187373592")}
					Size={UDim2.fromScale(1, 1)}
					Text={"EQUIPPED"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextTransparency={isEquipped ? 0 : 1}
					Event={{
						MouseButton1Click: () => {
							if (!isEquipped) {
								if (itemType !== "Target") {
									Events.equipItem(itemType, itemName);
								} else {
									Events.equipTreasure(itemName);
								}
							}
						},
					}}
				/>
			</frame>
		</frame>
	);
};

interface LargeShopItemProps {
	item: ShopItem;
}

const LargeShopItemComponent: React.FC<LargeShopItemProps> = ({ item }) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Segment"}
			Position={UDim2.fromScale(0.0411, 0.0188)}
			Size={UDim2.fromScale(0.906, 0.0112)}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />

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
				Position={UDim2.fromScale(0, -0.225)}
				Size={UDim2.fromScale(0.423, 0.192)}
				Text={item.title}
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
				Position={UDim2.fromScale(0.43, -0.18)}
				Size={UDim2.fromScale(0.289, 0.137)}
				Text={item.subtitle}
				TextColor3={item.backgroundColor?.Keypoints[0].Value ?? Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
			</textlabel>

			<frame
				BackgroundColor3={Color3.fromRGB(68, 236, 33)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ClaimButton"}
				Position={UDim2.fromScale(0.612, 0.653)}
				Size={UDim2.fromScale(0.36, 0.267)}
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
						new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
					}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Text={"BUY"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					Event={{
						MouseButton1Click: () => {
							if (item.productId) {
								if (item.productType === ProductType.GamePass) {
									MarketplaceService.PromptGamePassPurchase(Players.LocalPlayer, item.productId);
								} else if (item.productType === ProductType.DevProduct) {
									MarketplaceService.PromptProductPurchase(Players.LocalPlayer, item.productId);
								}
							}
						},
					}}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.06, 0)} PaddingTop={new UDim(0.06, 0)} />
				</textbutton>
			</frame>

			<imagelabel
				key={"ImageLabel"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={item.image}
				Position={UDim2.fromScale(0.0181, 0.055)}
				ScaleType={Enum.ScaleType.Crop}
				Size={UDim2.fromScale(0.268, 0.89)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

				<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />
			</imagelabel>

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
				Position={UDim2.fromScale(0.32, 0.085)}
				Size={UDim2.fromScale(0.644, 0.177)}
				Text={item.description}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
			</textlabel>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"http://www.roblox.com/asset/?id=16228703358"}
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageTransparency={0.9}
				key={"BackDrop"}
				ScaleType={Enum.ScaleType.Crop}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={0}
			/>
		</frame>
	);
};

interface LargeShopClaimProps {
	item: ShopItem;
}

const LargeShopClaimComponent: React.FC<LargeShopClaimProps> = ({ item }) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Segment"}
			Position={UDim2.fromScale(0.0466, 0.00369)}
			Size={UDim2.fromScale(0.906, 0.0112)}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={4} />

			<uigradient key={"UIGradient"} Color={item.backgroundColor} Rotation={-45} />

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
				Position={UDim2.fromScale(0, -0.225)}
				Size={UDim2.fromScale(0.423, 0.192)}
				Text={item.title}
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
				Position={UDim2.fromScale(0.43, -0.18)}
				Size={UDim2.fromScale(0.128, 0.137)}
				Text={item.subtitle}
				TextColor3={item.subtitleColor ?? Color3.fromRGB(235, 68, 246)}
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
				key={"SegmentTitle"}
				Position={UDim2.fromScale(0.0408, 0.06)}
				Size={UDim2.fromScale(0.917, 0.207)}
				Text={item.description}
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
				key={"Reward"}
				Position={UDim2.fromScale(0.0408, 0.745)}
				Size={UDim2.fromScale(0.284, 0.207)}
				Text={item.reward}
				TextColor3={Color3.fromRGB(253, 223, 0)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(53, 52, 50)} Thickness={2} />
			</textlabel>

			<frame
				BackgroundColor3={Color3.fromRGB(68, 236, 33)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ClaimButton"}
				Position={UDim2.fromScale(0.612, 0.653)}
				Size={UDim2.fromScale(0.36, 0.267)}
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
						new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
					}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Text={"CLAIM"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					Event={{
						MouseButton1Click: item.claimed,
					}}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.06, 0)} PaddingTop={new UDim(0.06, 0)} />
				</textbutton>
			</frame>

			<imagelabel
				key={"ImageLabel"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={item.image}
				Position={UDim2.fromScale(0.352, 0.33)}
				ScaleType={Enum.ScaleType.Crop}
				Size={UDim2.fromScale(0.233, 0.666)}
			/>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"http://www.roblox.com/asset/?id=17497141137"}
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageTransparency={0.98}
				key={"BackDrop"}
				ScaleType={Enum.ScaleType.Tile}
				Size={UDim2.fromScale(1, 1)}
				TileSize={UDim2.fromOffset(45, 45)}
				ZIndex={0}
			/>
		</frame>
	);
};

interface SidebarSwitcherProps {
	setEnabledMenu: Dispatch<string>;
	isEnabled: boolean;
	position: UDim2;
	size: UDim2;
	text: string;
	icon: string;
	order: number;
	iconPosition: UDim2;
}

const SidebarSwitcherComponent: React.FC<SidebarSwitcherProps> = (props) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(95, 103, 107)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			LayoutOrder={props.order}
			Position={props.position}
			Size={props.size}
			ZIndex={0}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.16, 0)} />

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 44)} Thickness={4} />

			<textbutton
				key={"TextButton"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/Arial.json")}
				Size={UDim2.fromScale(0.7, 1)}
				Text={string.upper(props.text)}
				TextColor3={props.isEnabled ? Color3.fromRGB(255, 255, 0) : Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				Event={{
					MouseButton1Click: () => {
						props.setEnabledMenu(props.text);
					},
				}}
			>
				<uipadding
					key={"UIPadding"}
					PaddingBottom={new UDim(0.16, 0)}
					PaddingLeft={new UDim(0.06, 0)}
					PaddingTop={new UDim(0.16, 0)}
				/>
			</textbutton>

			<imagelabel
				key={"ImageLabel"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.icon}
				AnchorPoint={new Vector2(1, 0)}
				Position={props.iconPosition}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.3, 1)}
				ZIndex={0}
			/>
		</frame>
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
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(83, 89, 98)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Size={new UDim2(1, 0, 0.308, 0)}
			key={string.upper(props.title)}
		>
			<uicorner CornerRadius={new UDim(0.12, 0)} />

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.image}
				Position={new UDim2(0.0147, 0, 0.15, 0)}
				Size={new UDim2(0.0661, 0, 0.674, 0)}
				Rotation={props.imageRotation ?? 0}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Medium, Enum.FontStyle.Normal)
				}
				Position={new UDim2(0.104, 0, 0.165, 0)}
				Size={props.titleSize ?? new UDim2(0.292, 0, 0.659, 0)}
				Text={capitalizeWords(props.title)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Color={Color3.fromRGB(63, 68, 74)} Thickness={2} />
			</textlabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Position={new UDim2(0.554, 0, 0.225, 0)}
				Size={new UDim2(0.332, 0, 0.539, 0)}
				Text={props.levelText}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke Color={Color3.fromRGB(63, 68, 74)} Thickness={2} />
			</textlabel>

			<textbutton
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Position={new UDim2(0.91, 0, 0.06, 0)}
				Size={new UDim2(0.0734, 0, 0.868, 0)}
				Text={"+"}
				TextColor3={Color3.fromRGB(148, 255, 60)}
				TextScaled={true}
				TextWrapped={true}
				Event={{
					Activated: () => {
						Events.upgradeSkill.fire(props.title);
					},
				}}
			>
				<uistroke Color={Color3.fromRGB(71, 82, 75)} Thickness={4} />
			</textbutton>
		</frame>
	);
};

type InventoryItemProps = {
	itemImage: string;
	itemName: string;
	rarity: Rarity;
	stats: ItemStat[];
	isEquipped: boolean;
	itemType: ItemType;
};

export const MENUS = {
	Inventory: "Inventory",
	Skills: "Skills",
	Shop: "Shop",
	Index: "Index",
};

interface MainUiProps {
	visible: boolean;
	menu?: string;
	uiController: UiController;
}

export const MainUi = (props: MainUiProps) => {
	const [visible, setVisible] = React.useState(false);
	const [enabledMenu, setEnabledMenu] = React.useState(MENUS.Inventory);
	const [inventory, setInventory] = React.useState<InventoryItemProps[]>([]);
	const [skillState, setSkills] = React.useState<Record<SkillName, number>>();
	const [levelState, setLevelState] = React.useState<{ level: number; xp: number; xpMax: number } | undefined>();
	const [selectedInventoryType, setSelectedInventoryType] = React.useState<ItemType>("MetalDetectors");
	const [pos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const DetectorFolder = ReplicatedStorage.WaitForChild("MetalDetectors") as Folder;
	const TargetModelFolder = ReplicatedStorage.WaitForChild("TargetModels") as Folder;
	const ShovelFolder = ReplicatedStorage.WaitForChild("Shovels") as Folder;
new CFrame()
	function updateInventory([equipped, inv]: [
		{
			equippedShovel: keyof typeof shovelConfig;
			equippedDetector: keyof typeof metalDetectorConfig;
			equippedTreasure: keyof typeof targetConfig;
		},
		Array<Item>,
	]) {
		const newInventory: InventoryItemProps[] = [];

		inv.forEach((item) => {
			const stats: InventoryItemProps["stats"] = [];

			if (item.type === "MetalDetectors") {
				const detector = DetectorFolder.FindFirstChild(item.name) as Model;
				if (!detector) {
					warn("Detector not found in folder:", item.name);
					return;
				}

				// Populate stats
				stats.push(
					{ key: "detectionDistance", value: item.strength, icon: "🧲" },
					{ key: "luck", value: item.luck, icon: "🍀" },
				);
			} else if (item.type === "Shovels") {
				const shovel = ShovelFolder.FindFirstChild(item.name) as Model;
				if (!shovel) {
					warn("Shovel not found in folder:", item.name);
					return;
				}

				// Populate stats
				stats.push({
					key: "strength",
					value: item.strengthMult,
					icon: "💪",
				});
			} else if (item.type === "Target") {
				const target = TargetModelFolder.FindFirstChild(item.name) as Model;
				if (!target) {
					warn("Target not found in folder:", item.name);
					return;
				}

				// Populate stats
				stats.push({ key: "weight", value: item.weight, icon: "⚖️" });
			}

			// Push to new inventory
			newInventory.push({
				itemType: item.type,
				isEquipped:
					item.name === equipped.equippedDetector ||
					item.name === equipped.equippedShovel ||
					item.name === equipped.equippedTreasure,
				itemImage: item.itemImage,
				itemName: item.name,
				rarity: item.rarityType,
				stats,
			});
		});

		setInventory(newInventory);
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
			Functions.getInventory(selectedInventoryType).then((items) => {
				updateInventory(items);
			});
		} else if (enabledMenu === MENUS.Skills) {
			Functions.getSkills().then((skills) => {
				setSkills(skills);
			});
			Functions.getLevelData().then((levelData) => {
				setLevelState(levelData);
			});
			const skillCon = Events.updateSkills.connect((skills) => {
				setSkills(skills);
			});
			const levelCon = Events.updateLevelUi.connect((level, xp, xpMax) => {
				setLevelState({ level, xp, xpMax });
			});

			return () => {
				skillCon.Disconnect();
				levelCon.Disconnect();
			};
		}
	}, [visible, enabledMenu, selectedInventoryType]);

	React.useEffect(() => {
		if (visible) {
			posMotion.spring(UDim2.fromScale(0.5, 0.5), springs.bubbly);
		} else {
			posMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	React.useEffect(() => {
		const connection = Events.updateInventory.connect((inventoryType, inv) => {
			if (inventoryType === selectedInventoryType) {
				updateInventory(inv);
			}
		});

		return () => {
			connection.Disconnect();
		};
	}, [selectedInventoryType]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BorderSizePixel={0}
			key={"MainUi"}
			Size={UDim2.fromScale(1, 1)}
			Visible={visible}
			Position={pos}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Main"}
				Position={UDim2.fromScale(0.593, 0.5)}
				Size={UDim2.fromScale(0.55, 0.7)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

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

				<frame
					BackgroundColor3={Color3.fromRGB(240, 18, 25)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"ExitButton"}
					Position={UDim2.fromScale(0.94, -0.0425)}
					Size={UDim2.fromScale(0.0876, 0.143)}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />

					<uicorner key={"UICorner"} CornerRadius={new UDim(0.22, 0)} />

					<uiaspectratioconstraint AspectRatio={1} />

					<textbutton
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
						key={"ButtonActual"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						Text={"X"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={4}
						Event={{
							MouseButton1Click: () => {
								props.uiController.closeUi(gameConstants.MAIN_UI);
							},
						}}
					>
						<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.16, 0)} PaddingTop={new UDim(0.16, 0)} />
					</textbutton>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(74, 79, 86)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Upgrades"}
					Position={UDim2.fromScale(0.0178, 0.0291)}
					Size={UDim2.fromScale(0.964, 0.539)}
					Visible={enabledMenu === MENUS.Skills}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Organizer"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.966, 0.9)}
					>
						<uilistlayout
							key={"UIListLayout"}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.035, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>

						<SkillFrame
							image="http://www.roblox.com/asset/?id=126884717839589"
							title="strength"
							levelText={`LV. ${skillState?.strength ?? 1}`}
						/>
						<SkillFrame
							image="http://www.roblox.com/asset/?id=102712052261818"
							title="luck"
							levelText={`LV. ${skillState?.luck ?? 1}`}
						/>
						<SkillFrame
							image="rbxassetid://137650843402705"
							imageRotation={90}
							title="detection"
							titleSize={new UDim2(0.402, 0, 0.659, 0)}
							levelText={`LV. ${skillState?.detection ?? 1}`}
						/>
					</frame>

					<frame
						BackgroundColor3={Color3.fromRGB(34, 34, 34)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"ProgressBar"}
						Position={UDim2.fromScale(0.177, 1.5)}
						Size={UDim2.fromScale(0.645, 0.0498)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

						<frame
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundColor3={Color3.fromRGB(146, 255, 15)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"BarActual"}
							Position={UDim2.fromScale(0, 0.5)}
							Size={UDim2.fromScale(
								math.max((levelState?.xp ?? 0.5) / (levelState?.xpMax ?? 1), 0.05),
								1.17,
							)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

							<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={4} />
						</frame>

						<textlabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={
								new Font(
									"rbxasset://fonts/families/Arial.json",
									Enum.FontWeight.Bold,
									Enum.FontStyle.Italic,
								)
							}
							key={"Current"}
							Position={UDim2.fromScale(-0.189, -0.583)}
							Size={UDim2.fromScale(0.158, 2.08)}
							Text={tostring(levelState?.level ?? 1)}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={4} />
						</textlabel>

						<textlabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={
								new Font(
									"rbxasset://fonts/families/Arial.json",
									Enum.FontWeight.Bold,
									Enum.FontStyle.Italic,
								)
							}
							key={"After"}
							Position={UDim2.fromScale(1.03, -0.583)}
							Size={UDim2.fromScale(0.158, 2.08)}
							Text={tostring(levelState?.level ? 1 + levelState!.level : 2)}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={4} />
						</textlabel>

						<textlabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={
								new Font(
									"rbxasset://fonts/families/Arial.json",
									Enum.FontWeight.Bold,
									Enum.FontStyle.Italic,
								)
							}
							key={"Disclaimer"}
							Position={UDim2.fromScale(0.268, 2.42)}
							Size={UDim2.fromScale(0.464, 1.42)}
							Text={"+1 Point EVERY Level"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextTransparency={0.2}
							TextWrapped={true}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(67, 72, 77)} Thickness={2} />
						</textlabel>

						<textlabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={
								new Font(
									"rbxasset://fonts/families/Arial.json",
									Enum.FontWeight.SemiBold,
									Enum.FontStyle.Normal,
								)
							}
							key={"Available"}
							Position={UDim2.fromScale(0.0286, -4.5)}
							Size={UDim2.fromScale(0.943, 3.5)}
							Text={"Avaible Points: 1"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={2} />
						</textlabel>
					</frame>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"http://www.roblox.com/asset/?id=137650843402705"}
						ImageTransparency={0.95}
						key={"BackDrop"}
						Position={UDim2.fromScale(-0.0184, -0.0539)}
						ScaleType={Enum.ScaleType.Tile}
						Size={UDim2.fromScale(1.04, 1.85)}
						TileSize={UDim2.fromScale(0.06, 0.1)}
						ZIndex={0}
					>
						<uigradient
							key={"UIGradient"}
							Rotation={-90}
							Transparency={
								new NumberSequence([
									new NumberSequenceKeypoint(0, 0),
									new NumberSequenceKeypoint(0.715, 1),
									new NumberSequenceKeypoint(1, 1),
								])
							}
						/>
					</imagelabel>
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Shop"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Visible={enabledMenu === MENUS.Shop}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(223, 185, 0)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(255, 129, 0)),
							])
						}
						Rotation={-90}
					/>

					<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />

					<scrollingframe
						key={"ScrollingFrame"}
						Active={true}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(27, 42, 53)}
						BorderSizePixel={0}
						BottomImage={""}
						CanvasSize={UDim2.fromScale(0, 5)}
						Position={UDim2.fromScale(4.76e-8, 0)}
						ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
						ScrollBarThickness={10}
						Size={UDim2.fromScale(0.999, 1)}
						TopImage={""}
					>
						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(27, 42, 53)}
							BorderSizePixel={0}
							key={"Content"}
							Size={UDim2.fromScale(1, 8.01)}
						>
							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"http://www.roblox.com/asset/?id=17497141137"}
								ImageColor3={Color3.fromRGB(0, 0, 0)}
								ImageTransparency={0.98}
								key={"BackDrop"}
								ScaleType={Enum.ScaleType.Tile}
								Size={UDim2.fromScale(1, 1)}
								TileSize={UDim2.fromOffset(45, 45)}
								ZIndex={0}
							/>

							{shopConfig.map((item) => {
								if (item.itemType === "Buy") {
									return <LargeShopItemComponent item={item} />;
								} else if (item.itemType === "Claim") {
									return <LargeShopClaimComponent item={item} />;
								}
							})}
						</frame>
					</scrollingframe>
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Inventory"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Visible={enabledMenu === MENUS.Inventory}
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

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"http://www.roblox.com/asset/?id=17497141137"}
						ImageColor3={Color3.fromRGB(0, 0, 0)}
						ImageTransparency={0.98}
						key={"BackDrop"}
						ScaleType={Enum.ScaleType.Tile}
						Size={UDim2.fromScale(1, 1)}
						TileSize={UDim2.fromOffset(45, 45)}
						ZIndex={0}
					/>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"TopbarList"}
						Position={UDim2.fromScale(0.016, 0.028)}
						Size={UDim2.fromScale(0.395, 0.178)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0.06, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>

						<frame
							BackgroundColor3={Color3.fromRGB(114, 121, 133)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Size={UDim2.fromScale(0.253, 1)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.14, 0)} />

							<imagebutton
								key={"ImageButton"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://90031590147315"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(0.82, 0.82)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("MetalDetectors");
									},
								}}
							/>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(114, 121, 133)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Size={UDim2.fromScale(0.253, 1)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.14, 0)} />

							<imagebutton
								key={"ImageButton"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://114046423433336"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(0.82, 0.82)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("Shovels");
									},
								}}
							/>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(114, 121, 133)}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Size={UDim2.fromScale(0.253, 1)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.14, 0)} />

							<imagebutton
								key={"ImageButton"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(0.82, 0.82)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("Target");
									},
								}}
							/>
						</frame>
					</frame>

					<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

					<scrollingframe
						key={"ScrollingFrame"}
						Active={true}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(27, 42, 53)}
						BorderSizePixel={0}
						BottomImage={""}
						CanvasSize={UDim2.fromScale(1, 0)}
						AutomaticCanvasSize={Enum.AutomaticSize.X}
						Position={UDim2.fromScale(0.0177, 0.234)}
						ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
						ScrollBarImageTransparency={0.2}
						ScrollBarThickness={10}
						Size={UDim2.fromScale(0.982, 0.766)}
						TopImage={""}
					>
						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(27, 42, 53)}
							BorderSizePixel={0}
							key={"Content"}
							Size={UDim2.fromScale(2, 1)}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0.002, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>

							{inventory.map((itemProps) => {
								return <GenericItemComponent {...itemProps}></GenericItemComponent>;
							})}
						</frame>
					</scrollingframe>
				</frame>
			</frame>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"SideBar"}
				Position={UDim2.fromScale(0.51, 0.45)}
				Size={UDim2.fromScale(0.4, 0.6)}
				ZIndex={0}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"SideBar"}
					Position={UDim2.fromScale(-0.462, 0.0808)}
					Size={UDim2.fromScale(0.48, 0.919)}
					ZIndex={0}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Holder"}
						Size={UDim2.fromScale(1, 1)}
					>
						<uilistlayout
							key={"UIListLayout"}
							HorizontalAlignment={Enum.HorizontalAlignment.Right}
							Padding={new UDim(0.03, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>

						<SidebarSwitcherComponent
							text={MENUS.Inventory}
							setEnabledMenu={setEnabledMenu}
							isEnabled={enabledMenu === MENUS.Inventory}
							position={UDim2.fromScale(4.35e-8, 0)}
							size={UDim2.fromScale(1, 0.136)}
							icon={"rbxassetid://70651545986325"}
							order={0}
							iconPosition={UDim2.fromScale(1, 0)}
						/>
						<SidebarSwitcherComponent
							text={MENUS.Skills}
							isEnabled={enabledMenu === MENUS.Skills}
							setEnabledMenu={setEnabledMenu}
							position={UDim2.fromScale(0.12, 0.161)}
							size={UDim2.fromScale(0.88, 0.136)}
							icon={"rbxassetid://90345162177443"}
							iconPosition={UDim2.fromScale(1, 0)}
							order={1}
						/>
						<SidebarSwitcherComponent
							text={MENUS.Index}
							isEnabled={enabledMenu === MENUS.Index}
							setEnabledMenu={setEnabledMenu}
							position={UDim2.fromScale(0.239, 0.322)}
							size={UDim2.fromScale(0.761, 0.136)}
							icon={""}
							iconPosition={UDim2.fromScale(1, 0)}
							order={2}
						/>
						<SidebarSwitcherComponent
							text={MENUS.Shop}
							isEnabled={enabledMenu === MENUS.Shop}
							setEnabledMenu={setEnabledMenu}
							position={UDim2.fromScale(0.356, 0.483)}
							size={UDim2.fromScale(0.644, 0.136)}
							icon={"rbxassetid://125407928227030"}
							iconPosition={UDim2.fromScale(0.95, 0)}
							order={3}
						/>
					</frame>
				</frame>
			</frame>
		</frame>
	);
};
