import React, { Dispatch } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { gameConstants } from "shared/constants";
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

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemImage, itemName, rarity, stats, itemType, isEquipped } = props;

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			LayoutOrder={
				rarity === "Secret"
					? 1
					: rarity === "Mythical"
					? 2
					: rarity === "Legendary"
					? 3
					: rarity === "Rare"
					? 4
					: rarity === "Uncommon"
					? 5
					: 6
			}
			key={"Item"}
			Position={UDim2.fromScale(-2.49e-8, 9.67e-9)}
			Size={UDim2.fromScale(0.33, 1.01)}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://132205041343382"}
				key={"Item Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 0.949)}
				Event={{
					MouseButton1Click: () => {
						// Equip the item
						Events.equipItem(itemType, itemName);
					},
				}}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.748} />

				<imagelabel Image={itemImage} Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} />

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Stats"}
					Position={UDim2.fromScale(0.0923, 0.069)}
					Size={UDim2.fromScale(0.472, 0.374)}
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
							Text={rarity}
							TextColor3={gameConstants.RARITY_COLORS[rarity]}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={2} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.00323, 0)}
								PaddingLeft={new UDim(0.623, 0)}
								PaddingRight={new UDim(0.623, 0)}
								PaddingTop={new UDim(0.00323, 0)}
							/>
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
							Text={spaceWords(itemName)}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Right}
						>
							<uistroke key={"UIStroke"} Thickness={2} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.0132, 0)}
								PaddingLeft={new UDim(0.245, 0)}
								PaddingRight={new UDim(0.245, 0)}
								PaddingTop={new UDim(0.0132, 0)}
							/>
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
							Image={"rbxassetid://135857882759075"}
							key={"Star"}
							Position={UDim2.fromScale(0.768, 0)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.333, 0.8)}
						/>

					</frame> */}
				</frame>
			</imagebutton>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.709} />
		</frame>
	);
};

const TreasureItemComponent: React.FC<GenericItemProps> = ({
	itemImage,
	rarity,
	itemName,
	stats,
	isEquipped,
	// itemType,
}) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(17, 25, 49)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Item"}
			Position={UDim2.fromScale(-1.69e-7, -0.0175)}
			Size={UDim2.fromScale(0.179, 0.39)}
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

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromOffset(70, 70)}
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

export function CategoryButton(props: CategoryButtonProps) {
	const { currentCategory, title, iconId, position, size, anchorPoint } = props;

	return (
		<imagebutton
			key={"CategoryBtn"}
			AnchorPoint={anchorPoint ?? new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Image={"rbxassetid://95497998243578"}
			ImageColor3={currentCategory === title ? Color3.fromRGB(188, 98, 18) : Color3.fromRGB(22, 33, 66)}
			Position={position}
			ScaleType={Enum.ScaleType.Slice}
			Size={size}
			SliceCenter={new Rect(98, 73, 643, 212)}
			SliceScale={0.25}
			ZIndex={-10}
			Event={{
				MouseButton1Click: () => {
					// Change the category
					props.setCategory(title);
				},
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
				ImageColor3={currentCategory === title ? Color3.fromRGB(248, 199, 50) : Color3.fromRGB(52, 70, 126)}
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
				ImageColor3={currentCategory === title ? Color3.fromRGB(255, 255, 100) : Color3.fromRGB(77, 104, 188)}
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
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(1, 1)}
					Size={UDim2.fromScale(0.606, 0.432)}
					Text={title}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Center}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

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
}

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
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={props.title}
			Position={UDim2.fromScale(0.00269, -4.18e-7)}
			Size={UDim2.fromScale(0.995, 0.306)}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://83760144959092"}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(1, 1)}
				SliceCenter={new Rect(36, 60, 994, 60)}
				SliceScale={0.7}
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
								Event={{
									Activated: () => {
										Events.upgradeSkill.fire(string.lower(props.title) as SkillName);
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
			</imagelabel>
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
	const [levelState, setLevelState] = React.useState<
		{ level: number; xp: number; xpMax: number; skillPoints: number } | undefined
	>();
	const [selectedInventoryType, setSelectedInventoryType] = React.useState<ItemType>("MetalDetectors");
	const [pos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [loading, setLoading] = React.useState(false);
	const [loadingSpring, setLoadingSpring] = useMotion(1);

	const DetectorFolder = ReplicatedStorage.WaitForChild("MetalDetectors") as Folder;
	const TargetModelFolder = ReplicatedStorage.WaitForChild("TargetModels") as Folder;
	const ShovelFolder = ReplicatedStorage.WaitForChild("Shovels") as Folder;

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
					{ key: "detectionDistance", value: item.strength, icon: "rbxassetid://136640572681412" },
					{ key: "luck", value: item.luck, icon: "rbxassetid://85733831609212" },
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
					icon: "rbxassetid://100052274681629",
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
				isEquipped: [equipped.equippedDetector, equipped.equippedShovel, equipped.equippedTreasure].includes(
					item.name,
				),
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
			// setInventory([]);
			setLoading(true);
			Functions.getInventory(selectedInventoryType).then((items) => {
				updateInventory(items);
				setLoading(false);
			});
			const connection = Events.updateInventory.connect((inventoryType, inv) => {
				if (inventoryType === selectedInventoryType) {
					updateInventory(inv);
				}
			});

			return () => {
				connection.Disconnect();
			};
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
			const levelCon = Events.updateLevelUi.connect((level, xp, xpMax, skillPoints) => {
				setLevelState({ level, xp, xpMax, skillPoints });
			});

			return () => {
				skillCon.Disconnect();
				levelCon.Disconnect();
			};
		}
	}, [visible, enabledMenu, selectedInventoryType]);

	React.useEffect(() => {
		if (visible) {
			posMotion.spring(UDim2.fromScale(0.5, 0.4), springs.bubbly);
		} else {
			posMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	React.useEffect(() => {
		if (loading) {
			setLoadingSpring.spring(0, springs.crawl);
		} else {
			setLoadingSpring.immediate(1);
		}
	}, [loading]);

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
						new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
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
						Size={UDim2.fromScale(math.max((levelState?.xp ?? 0.5) / (levelState?.xpMax ?? 1), 0.05), 1.17)}
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
	</frame>;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Container"}
			Position={pos}
			Size={UDim2.fromScale(0.72, 0.75)}
			Visible={visible}
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
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://133515423550411"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(0.100000001, 0.100000001, 0.100000001, 0.100000001)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.66} />
				</imagelabel>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Exit Button"}
					Position={UDim2.fromScale(0.978, 0.0365)}
					Size={UDim2.fromScale(0.123, 0.194)}
					ZIndex={100}
				>
					<textlabel
						key={"TextLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.518, 0.518)}
						Text={"X"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0843, 0)}
							PaddingLeft={new UDim(0.294, 0)}
							PaddingRight={new UDim(0.294, 0)}
							PaddingTop={new UDim(0.0843, 0)}
						/>
					</textlabel>

					<imagebutton
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://105623320030835"}
						key={"ExitBtn"}
						Position={UDim2.fromScale(0.466, 0.527)}
						ScaleType={Enum.ScaleType.Slice}
						Selectable={false}
						Size={UDim2.fromScale(0.824, 0.87)}
						SliceCenter={new Rect(0.5, 0.5, 0.5, 0.5)}
						SliceScale={0.4}
						ZIndex={100}
						Event={{
							MouseButton1Click: () => {
								props.uiController.closeUi(gameConstants.MAIN_UI);
							},
						}}
					/>
				</frame>

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
							Visible={false}
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

						{/* <scrollingframe
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticCanvasSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							CanvasSize={new UDim2()}
							key={"Shovels Container"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScrollBarImageTransparency={1}
							ScrollBarThickness={0}
							ScrollingDirection={Enum.ScrollingDirection.X}
							Selectable={false}
							Size={UDim2.fromScale(0.975, 1)}
							Visible={selectedInventoryType === "Shovels"}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0.01, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>

							{inventory.map((itemProps) => {
								if (selectedInventoryType !== "Shovels") return;
								return <GenericItemComponent {...itemProps}></GenericItemComponent>;
							})}
						</scrollingframe> */}

						<scrollingframe
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticCanvasSize={
								selectedInventoryType === "Target" ? Enum.AutomaticSize.Y : Enum.AutomaticSize.X
							}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							CanvasSize={new UDim2()}
							key={"Treasures Container"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScrollBarImageTransparency={1}
							ScrollBarThickness={0}
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
							/>

							<textlabel
								Size={UDim2.fromScale(1, 1)}
								TextScaled={true}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								TextTransparency={loadingSpring}
								Text={`Loading ${selectedInventoryType}s...`}
								Visible={loading}
							/>

							{inventory.map((itemProps) => {
								if (loading) return;
								if (selectedInventoryType === "Target") {
									return <TreasureItemComponent {...itemProps}></TreasureItemComponent>;
								} else {
									return <GenericItemComponent {...itemProps}></GenericItemComponent>;
								}
							})}
						</scrollingframe>

						{/* <scrollingframe
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticCanvasSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							CanvasSize={new UDim2()}
							key={"Metal Detectors Container"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScrollBarImageTransparency={1}
							ScrollBarThickness={0}
							ScrollingDirection={Enum.ScrollingDirection.X}
							Selectable={false}
							Size={UDim2.fromScale(0.975, 1)}
							Visible={selectedInventoryType === "MetalDetectors"}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0.01, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>

							{inventory.map((itemProps) => {
								if (selectedInventoryType !== "MetalDetectors") return;
								return <GenericItemComponent {...itemProps}></GenericItemComponent>;
							})}
						</scrollingframe> */}
					</frame>

					{/* Inventory Nav */}
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Top Navigation"}
						Position={UDim2.fromScale(1.65e-7, 0.0309)}
						Size={UDim2.fromScale(0.931, 0.14)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0.0139, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						{/* Search Bar */}
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://104980497933554"}
							LayoutOrder={5}
							key={"Search Bar"}
							Position={UDim2.fromScale(0.587, 0.163)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.394, 0.79)}
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
							/>
						</imagelabel>

						{/* Sell All Btn */}
						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							LayoutOrder={4}
							key={"Sell All Btn Frame"}
							Size={UDim2.fromScale(0.268, 1)}
						>
							<imagebutton
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://92239062767450"}
								key={"Sell All Btn"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(1, 1)}
								SliceCenter={new Rect(40, 86, 544, 87)}
								SliceScale={0.3}
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
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(0.684, 0.524)}
									Text={"Sell All"}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={3} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.071, 0)}
										PaddingLeft={new UDim(0.226, 0)}
										PaddingRight={new UDim(0.226, 0)}
										PaddingTop={new UDim(0.071, 0)}
									/>
								</textlabel>
							</imagebutton>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							LayoutOrder={1}
							key={"Shovels Tab"}
							Size={UDim2.fromScale(0.103, 1.18)}
						>
							<imagebutton
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={
									selectedInventoryType === "Shovels"
										? "rbxassetid://109250907266323"
										: "rbxassetid://105250247379697"
								}
								LayoutOrder={1}
								key={"Shovels Tab Btn"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("Shovels");
									},
								}}
							>
								<imagelabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://101307691874432"}
									key={"Icon"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.7, 0.7)}
								/>
							</imagebutton>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							LayoutOrder={2}
							key={"Metal Detector Tab"}
							Size={UDim2.fromScale(0.103, 1.18)}
						>
							<imagebutton
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={
									selectedInventoryType === "MetalDetectors"
										? "rbxassetid://109250907266323"
										: "rbxassetid://105250247379697"
								}
								LayoutOrder={2}
								key={"Metal Detector Tab Btn"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("MetalDetectors");
									},
								}}
							>
								<imagelabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://139989446078706"}
									key={"Icon"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.7, 0.7)}
								/>
							</imagebutton>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Inventory Tab"}
							Size={UDim2.fromScale(0.103, 1.18)}
						>
							<imagebutton
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={
									selectedInventoryType === "Target"
										? "rbxassetid://109250907266323"
										: "rbxassetid://105250247379697"
								}
								key={"Inventory Tab Btn"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
								Event={{
									MouseButton1Click: () => {
										setSelectedInventoryType("Target");
									},
								}}
							>
								<imagelabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://90146219889959"}
									key={"Icon"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.7, 0.7)}
								/>
							</imagebutton>
						</frame>
					</frame>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />
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
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
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
									Size={UDim2.fromScale(1.03, 1.07)}
									SliceCenter={new Rect(47, 94, 539, 94)}
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
											FontFace={
												new Font(
													"rbxassetid://16658221428",
													Enum.FontWeight.Bold,
													Enum.FontStyle.Normal,
												)
											}
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
											<uistroke
												key={"UIStroke"}
												Color={Color3.fromRGB(8, 66, 34)}
												Thickness={4}
											/>

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
					Visible={false}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(20, 33, 79)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Index Container"}
						Position={UDim2.fromScale(0, 0.166)}
						Size={UDim2.fromScale(0.671, 0.831)}
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
							ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
							ScrollBarThickness={0}
							ScrollingDirection={Enum.ScrollingDirection.Y}
							Size={UDim2.fromScale(1, 1)}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0.005, 0)}
								SortOrder={Enum.SortOrder.LayoutOrder}
								Wraps={true}
							/>

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.01, 0)}
								PaddingLeft={new UDim(0.01, 0)}
								PaddingRight={new UDim(0.01, 0)}
								PaddingTop={new UDim(0.01, 0)}
							/>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://126358206935930"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://84668810565175"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://106616263841751"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://134558639597567"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://115729927097630"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://113969441104588"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://97508814457340"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Index Item Frame"}
								Position={UDim2.fromScale(6.68e-8, -3.13e-8)}
								Size={UDim2.fromScale(0.246, 0.362)}
							>
								<imagebutton
									Active={false}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://134558639597567"}
									key={"Index Item"}
									Position={UDim2.fromScale(0.5, 0.5)}
									ScaleType={Enum.ScaleType.Fit}
									Selectable={false}
									Size={UDim2.fromScale(0.95, 0.95)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>
						</scrollingframe>
					</frame>

					<imagelabel
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
					</imagelabel>

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
						/>

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
								Text={"Super Rock"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
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
								Text={"1 in 5.5B"}
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
									"After 3 years of being regular rock, the rock decided it’s time to become SUPER SAYIAN!!!"
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
				Position={UDim2.fromScale(0.13, 0.537)}
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
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.05} />

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Treasure Count"}
				Position={UDim2.fromScale(0.58, 0.977)}
				Size={UDim2.fromScale(0.367, 0.0965)}
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
					Text={"Treasures: 0/300"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
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
