//!optimize 2
import React from "@rbxts/react";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { TargetItem } from "shared/networkTypes";
import { AnimatedButton, ExitButton, SellAllBtn } from "./inventory";
import { fullTargetConfig } from "shared/config/targetConfig";
import { shortenNumber } from "shared/util/nameUtil";
import { getOrderFromRarity } from "shared/util/rarityUtil";

interface SellTargetProps {
	target: TargetItem;
}

const SellTargetComponent: React.FC<SellTargetProps> = (props) => {
	const cfg = fullTargetConfig[props.target.name];
	const rarity = cfg.rarityType;

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(17, 25, 49)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Item"}
			Position={UDim2.fromScale(0, 0)}
			Size={UDim2.fromScale(0.18, 0.436)}
			LayoutOrder={getOrderFromRarity(rarity)}
		>
			<AnimatedButton
				size={UDim2.fromScale(0.9, 0.9)}
				active={true}
				onClick={() => {
					Events.sellTarget(props.target.itemId);
				}}
			>
				{/* <uiaspectratioconstraint key={"UIAspectRatioConstraint"} /> */}
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
				<uistroke key={"UIStroke"} Color={gameConstants.RARITY_COLORS[cfg.rarityType]} Thickness={3} />
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Icon"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Image={fullTargetConfig[props.target.name].itemImage}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={10}
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

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Kg"}
					Position={UDim2.fromScale(-0.0188, -0.0372)}
					Size={UDim2.fromScale(0.862, 0.211)}
					Text={`${shortenNumber(props.target.weight)}kg`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={10}
				>
					<uistroke Color={Color3.fromRGB(23, 30, 52)} key={"4"} Thickness={3} />
				</textlabel>
			</AnimatedButton>
		</frame>
	);
};

interface SellUiProps {
	uiController: UiController;
	visible: boolean;
}

export const Sell: React.FC<SellUiProps> = (props) => {
	const [shopContent, setShopContent] = React.useState<TargetItem[]>([]);
	const [visible, setVisible] = React.useState(false);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const menuRef = React.useRef<Frame>();

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.629, 0.702), springs.responsive);
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
		}
	}, [visible]);

	React.useEffect(() => {
		Functions.getInventory("Target")
			.then(([_, targets]) => {
				setShopContent(targets as TargetItem[]);
			})
			.catch((e) => {
				warn(e);
			});
		// Events.profileReady.connect(() => {
		// 	Functions.getInventory("Target")
		// 		.then(([_, targets]) => {
		// 			setShopContent(targets as TargetItem[]);
		// 		})
		// 		.catch((e) => {
		// 			warn(e);
		// 		});
		// });
		Events.updateInventory.connect((invType, [_, inventory]) => {
			if (invType !== "Target") return;
			setShopContent(inventory as TargetItem[]);
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Sell Treasures Sub-Menu"}
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
				uiName={gameConstants.SELL_UI}
				uiController={props.uiController}
				menuRefToClose={menuRef}
				isMenuVisible={visible}
			/>

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
					<uigridlayout
						key={"UIGridLayout"}
						CellPadding={UDim2.fromScale(0.025, 0.1)}
						CellSize={UDim2.fromScale(0.18, 0.423)}
						SortOrder={Enum.SortOrder.LayoutOrder}
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
				visible={true}
			/>
		</frame>
	);
};
