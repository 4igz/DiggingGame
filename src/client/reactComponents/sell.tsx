import React from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { Target } from "shared/networkTypes";
import { ExitButton, SellAllBtn } from "./mainUi";

interface SellTargetProps {
	target: Target;
}

const SellTargetComponent: React.FC<SellTargetProps> = (props) => {
	<frame
		BackgroundColor3={Color3.fromRGB(225, 225, 225)}
		BorderColor3={Color3.fromRGB(0, 0, 0)}
		BorderSizePixel={0}
		key={"Segment"}
		Size={UDim2.fromScale(0.18, 0.0021)}
	>
		<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Detail"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={UDim2.fromScale(0.85, 0.85)}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.9}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"TopVignette"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

				<uigradient
					key={"UIGradient"}
					Rotation={90}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 0),
							new NumberSequenceKeypoint(0.513, 0.856),
							new NumberSequenceKeypoint(1, 1),
						])
					}
				/>
			</frame>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.9}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"BottomVignette"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

				<uigradient
					key={"UIGradient"}
					Rotation={-90}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 0),
							new NumberSequenceKeypoint(0.513, 0.856),
							new NumberSequenceKeypoint(1, 1),
						])
					}
				/>
			</frame>
		</frame>

		<textlabel
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
			key={"ItemName"}
			Position={UDim2.fromScale(-0.279, -0.0172)}
			Rotation={-10}
			Size={UDim2.fromScale(1.28, 0.255)}
			Text={props.target.name}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
		>
			<uistroke key={"UIStroke"} Thickness={3} Transparency={0.3} />
		</textlabel>

		<textbutton
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
			key={"Weight"}
			Position={UDim2.fromScale(-0.112, 0.802)}
			Size={UDim2.fromScale(1.22, 0.258)}
			Text={`${string.format("%.1f", props.target.weight)}kg`}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
			Event={{
				MouseButton1Click: () => {
					Events.sellTarget(props.target.itemId);
				},
			}}
		>
			<uistroke key={"UIStroke"} Thickness={3} Transparency={0.3} />
		</textbutton>

		<imagelabel
			key={"ImageLabel"}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"} // TODO: Change to actual image
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={UDim2.fromScale(1, 0.722)}
			ZIndex={0}
		/>
	</frame>;

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(17, 25, 49)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Item"}
			Position={UDim2.fromScale(8.15e-8, 0.427)}
			Size={UDim2.fromScale(0.18, 0.436)}
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

				<uistroke key={"UIStroke"} Color={gameConstants.RARITY_COLORS[props.target.rarityType]} Thickness={3} />

				<imagebutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromOffset(70, 70)}
					Event={{
						MouseButton1Click: () => {
							Events.sellTarget(props.target.itemId);
						},
					}}
				/>
				<textlabel
					Size={UDim2.fromScale(1, 0.3)}
					Position={UDim2.fromScale(0, 0.9)}
					BackgroundTransparency={1}
					Text={props.target.name}
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				>
					<uistroke Thickness={2} />
				</textlabel>
			</frame>
		</frame>
	);
};

interface SellUiProps {
	uiController: UiController;
	visible: boolean;
}

export const Sell: React.FC<SellUiProps> = (props) => {
	const [shopContent, setShopContent] = React.useState<Target[]>([]);
	const [visible, setVisible] = React.useState(false);
	const [pos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const menuRef = React.useRef<Frame>();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			posMotion.spring(UDim2.fromScale(0.5, 0.5), springs.responsive);

			Functions.getInventory("Target").then(([_, targets]) => {
				const content = [];

				for (const target of targets) {
					content.push(target as Target);
				}

				setShopContent(content);
			});
		} else {
			posMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	React.useEffect(() => {
		Events.updateInventory.connect((invType, [_, inventory]) => {
			if (invType !== "Target") return;
			const content = [];

			for (const target of inventory) {
				content.push(target as Target);
			}

			setShopContent(content);
		});
	}, []);

	<frame
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BackgroundTransparency={0.6}
		BorderColor3={Color3.fromRGB(0, 0, 0)}
		BorderSizePixel={0}
		key={"Sell"}
		Position={pos}
		Size={UDim2.fromScale(0.391, 0.539)}
		Visible={visible}
	>
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

		<textlabel
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			FontFace={
				new Font("rbxasset://fonts/families/AccanthisADFStd.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
			}
			key={"Title"}
			Position={UDim2.fromScale(0.132, -0.0641)}
			Size={UDim2.fromScale(0.334, 0.12)}
			Text={"Sell Items"}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={4} />
		</textlabel>

		<imagelabel
			key={"ImageLabel"}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			Image={"rbxasset://textures/ui/GuiImagePlaceholder.png"}
			Position={UDim2.fromScale(-0.0628, -0.0641)}
			Rotation={-25}
			ScaleType={Enum.ScaleType.Crop}
			Size={UDim2.fromScale(0.166, 0.15)}
		/>

		<frame
			BackgroundColor3={Color3.fromRGB(240, 18, 25)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"ExitButton"}
			Position={UDim2.fromScale(0.941, -0.0425)}
			Size={UDim2.fromScale(0.0862, 0.129)}
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
				FontFace={new Font("rbxasset://fonts/families/Arial.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"ButtonActual"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Text={"X"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				ZIndex={2}
				Event={{
					MouseButton1Click: () => {
						props.uiController.closeUi(gameConstants.SELL_UI);
					},
				}}
			>
				<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.16, 0)} PaddingTop={new UDim(0.16, 0)} />
			</textbutton>
		</frame>

		<scrollingframe
			key={"ScrollingFrame"}
			Active={true}
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			BorderSizePixel={0}
			BottomImage={""}
			CanvasSize={UDim2.fromScale(0, 3)}
			Position={UDim2.fromScale(0.5, 0)}
			ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
			ScrollBarThickness={10}
			Size={UDim2.fromScale(0.938, 0.739)}
			TopImage={""}
			ZIndex={0}
		>
			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(27, 42, 53)}
				BorderSizePixel={0}
				key={"Content"}
				Size={UDim2.fromScale(1, 40)}
			>
				<uigridlayout
					key={"UIGridLayout"}
					CellPadding={UDim2.fromScale(0.07, 0.0006)}
					CellSize={UDim2.fromScale(0.18, 0.0021)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<uipadding key={"UIPadding"} PaddingTop={new UDim(0.0005, 0)} />

				{shopContent.map((target) => (
					<SellTargetComponent target={target} />
				))}
			</frame>
		</scrollingframe>

		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"SellButton"}
			Position={UDim2.fromScale(0.306, 0.824)}
			Size={UDim2.fromScale(0.387, 0.136)}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(19, 183, 255)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(49, 205, 255)),
					])
				}
			/>

			<uistroke key={"UIStroke"} Thickness={3} />

			<textbutton
				key={"TextButton"}
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
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Text={"Sell All"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				Event={{
					Activated: () => {
						Events.sellAll();
					},
				}}
			>
				<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.02, 0)} PaddingTop={new UDim(0.06, 0)} />

				<uistroke key={"UIStroke"} Thickness={3} />
			</textbutton>
		</frame>

		<uicorner key={"UICorner"} CornerRadius={new UDim(0.06, 0)} />

		{/* <textlabel
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
				key={"Disclaimer"}
				Position={UDim2.fromScale(0.0347, 1.02)}
				Size={UDim2.fromScale(0.346, 0.0541)}
				Text={"Gold Fish = 7.5 Cash"}
				TextColor3={Color3.fromRGB(251, 213, 0)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={2} />
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
				key={"Disclaimer"}
				Position={UDim2.fromScale(0.545, 1.02)}
				Size={UDim2.fromScale(0.419, 0.0541)}
				Text={"Diamond Fish = 40x Cash"}
				TextColor3={Color3.fromRGB(45, 202, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(43, 44, 45)} Thickness={2} />
			</textlabel> */}
	</frame>;

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Sell Treasures Sub-Menu"}
			Position={pos}
			Size={UDim2.fromScale(0.727, 0.606)}
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

			<ExitButton uiName={gameConstants.SELL_UI} uiController={props.uiController} menuRefToClose={menuRef} />

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.74} />

			<frame
				BackgroundColor3={Color3.fromRGB(80, 130, 229)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Title"}
				Position={UDim2.fromScale(-0.0358, -0.083)}
				Size={UDim2.fromScale(0.469, 0.168)}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					LayoutOrder={1}
					key={"Title"}
					Position={UDim2.fromScale(0.77, 0.5)}
					Size={UDim2.fromScale(0.712, 0.654)}
					Text={"Sell Treasures!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={5.3} />
				</textlabel>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://112456131027742"}
					key={"Icon"}
					Position={UDim2.fromScale(0, -0.383)}
					Size={UDim2.fromScale(0.364, 1.77)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0.025, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.85} />
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(30, 42, 79)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Treasures Container"}
				Position={UDim2.fromScale(0.0394, 0.0851)}
				Size={UDim2.fromScale(0.924, 0.666)}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://101723443450777"}
					key={"Bubbles"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(367, 222, 694, 222)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.0289, 0)} />
				</imagelabel>

				<scrollingframe
					key={"ScrollingFrame"}
					Active={true}
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					CanvasSize={new UDim2()}
					Position={UDim2.fromScale(0.498, 0.519)}
					ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
					ScrollBarThickness={0}
					ScrollingDirection={Enum.ScrollingDirection.Y}
					Size={UDim2.fromScale(0.968, 0.963)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						Wraps={true}
					/>

					{shopContent.map((target) => (
						<SellTargetComponent target={target} />
					))}
				</scrollingframe>

				<uicorner key={"UICorner"} CornerRadius={new UDim(0.0289, 0)} />

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.41} />
			</frame>

			<SellAllBtn
				position={UDim2.fromScale(0.5, 0.85)}
				size={UDim2.fromScale(0.278, 0.154)}
				requiresGamepass={false}
			/>
		</frame>
	);
};
