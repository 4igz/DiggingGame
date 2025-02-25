//!optimize 2
//!native
import React, { Dispatch, useEffect } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { Rarity } from "shared/networkTypes";
import { separateWithCommas, shortenNumber, spaceWords } from "shared/util/nameUtil";
import { ExitButton } from "./inventory";
import { boatConfig } from "shared/config/boatConfig";
import Object from "@rbxts/object-utils";
import { SoundService } from "@rbxts/services";

const BOATSHOP_MENUS = {
	Boats: "Boats",
};

interface ItemStat {
	key: string;
	value: string | number;
	icon: string; // Icon emoji or asset ID
}

interface GenericItemProps {
	itemName: string;
	rarity: Rarity;
	speed: number; // List of stats to display
	image: string;
	owned: boolean;
	price: number;
}

const GenericItemComponent: React.FC<GenericItemProps> = (props) => {
	const { itemName: boatName, owned } = props;
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

	<frame
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BackgroundTransparency={1}
		BorderSizePixel={0}
		LayoutOrder={props.price}
		key={"Item"}
		Position={UDim2.fromScale(0.601, 0)}
		AnchorPoint={new Vector2(0.5, 0.5)}
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
						SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("BoatSpawn") as Sound);
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
					Text={"SPAWN"}
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
				ZIndex={3}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Speed"}
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
						Image={""} // FIXME: Speed icon?
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
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Amount"}
						Position={UDim2.fromScale(0.808, 0.382)}
						Size={UDim2.fromScale(1.02, 0.763)}
						Text={`x${string.format("%.1f", props.speed)}`}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						ZIndex={5}
					>
						<uistroke key={"UIStroke"} Thickness={2} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0198, 0)}
							PaddingTop={new UDim(0.0198, 0)}
						/>
					</textlabel>
				</frame>

				<uilistlayout key={"UIListLayout"} Padding={new UDim(0.05, 0)} SortOrder={Enum.SortOrder.LayoutOrder} />
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Information"}
				Position={UDim2.fromScale(0.0674, 0.602)}
				Size={UDim2.fromScale(0.852, 0.318)}
				ZIndex={3}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Item Info"}
					Position={UDim2.fromScale(0.0292, 0.458)}
					Size={UDim2.fromScale(0.958, 0.533)}
					ZIndex={3}
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
						ZIndex={3}
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
						ZIndex={3}
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
				Size={UDim2.fromScale(0.9, 1)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
				ZIndex={2}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />
			</imagelabel>
		</imagebutton>
	</frame>;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			LayoutOrder={props.price}
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
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Amount"}
							Position={UDim2.fromScale(0.808, 0.382)}
							Size={UDim2.fromScale(1.02, 0.763)}
							Text={`x${shortenNumber(props.speed)}`}
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
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Information"}
					Position={UDim2.fromScale(0.0674, 0.602)}
					Size={UDim2.fromScale(0.852, 0.318)}
					ZIndex={3}
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
							Text={props.itemName}
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
								Text={props.itemName}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Right}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
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
					Text={`$${separateWithCommas(props.price)}`}
					TextColor3={Color3.fromRGB(92, 255, 133)}
					TextScaled={true}
					TextWrapped={true}
					Visible={!owned}
					ZIndex={16}
				>
					<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"2"} Thickness={4.6} />
				</textlabel>

				<frame
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={0.45}
					BorderSizePixel={0}
					key={"Overlay"}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={15}
					Visible={props.owned}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://86601969325749"}
						key={"Check"}
						Position={UDim2.fromScale(0.493, 0.443)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.623, 0.388)}
						SliceCenter={new Rect(100, 259, 901, 259)}
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
						Position={UDim2.fromScale(0.508, 0.538)}
						Size={UDim2.fromScale(0.9, 0.9)}
						Text={"SPAWN"}
						TextColor3={Color3.fromRGB(0, 0, 0)}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke key={"1"} Thickness={5} />

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
							Position={UDim2.fromScale(0.5, 0.49)}
							Size={UDim2.fromScale(1, 1)}
							Text={"SPAWN"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
						>
							<uistroke key={"1"} Thickness={5} />
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
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const menuRef = React.createRef<Frame>();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.631, 0.704), springs.responsive);
			// TODO: Fetch owned boats
			Functions.getOwnedBoats().then((ownedBoats) => {
				setOwnedBoats(ownedBoats);
			});

			const connection = Events.updateBoatInventory.connect((ownedBoats) => {
				setOwnedBoats(ownedBoats);
			});

			return () => {
				connection.Disconnect();
			};
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
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
					props.uiController.closeUi(gameConstants.BOAT_SHOP_UI);
				}}
				isMenuVisible={visible}
			/>

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
						Image={""}
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
				Text={"Aura's Shop"}
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

				{Object.entries(boatConfig).map(([boatName, boatCfg]) => {
					const owned = ownedBoats.get(boatName) ?? false;
					return (
						<GenericItemComponent
							itemName={boatName}
							rarity={boatCfg.rarityType}
							image={boatCfg.itemImage}
							speed={boatCfg.speed}
							owned={owned}
							price={boatCfg.price}
						/>
					);
				})}
			</scrollingframe>
		</frame>
	);
};
