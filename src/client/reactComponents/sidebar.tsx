import React, { useEffect } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { MENUS } from "./mainUi";
import { AutoDigging } from "client/controllers/autoDigController";
import { Players } from "@rbxts/services";
import { Signals } from "shared/signals";

interface SidebarButtonProps {
	icon: string;
	text: string;
	notificationVisible?: boolean;
	notificationColor?: Color3;
	notificationText?: string;
	onClick?: () => void;
}

const SidebarButton = (props: SidebarButtonProps) => {
	const START_SZ = UDim2.fromScale(0.396, 0.251);
	const SZ_INC = UDim2.fromScale(0.025, 0.025);
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [size, sizeMotion] = useMotion(START_SZ);

	useEffect(() => {
		sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.responsive);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(
			isPressed ? START_SZ.sub(SZ_INC) : isHovered ? START_SZ.add(SZ_INC) : START_SZ,
			springs.responsive,
		);
	}, [isPressed]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Backpack"}
			Position={UDim2.fromScale(0, 3.12e-8)}
			Size={size}
		>
			<imagebutton
				key={"ImageButton"}
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={props.icon}
				Position={UDim2.fromScale(0, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
				Event={{
					MouseEnter: () => setIsHovered(true),
					MouseLeave: () => setIsHovered(false),
					MouseButton1Click: () => {
						if (props.onClick) {
							props.onClick();
						}
						setPressed(true);
						task.delay(0.1, () => setPressed(false));
					},
				}}
			/>
			<textlabel
				AnchorPoint={new Vector2(0, 0.5)}
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
				Position={UDim2.fromScale(-0.194, 0.869)}
				Size={UDim2.fromScale(1.38, 0.261)}
				Text={props.text}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<frame
				BackgroundColor3={props.notificationColor ?? Color3.fromRGB(255, 0, 0)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Notification"}
				Position={UDim2.fromScale(0.676, 0.0908)}
				Size={UDim2.fromScale(0.307, 0.307)}
				Visible={props.notificationVisible ?? false}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Text={props.notificationText ?? ""}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={2} />

					<uipadding
						key={"UIPadding"}
						PaddingBottom={new UDim(0.0167, 0)}
						PaddingLeft={new UDim(0.35, 0)}
						PaddingRight={new UDim(0.35, 0)}
						PaddingTop={new UDim(0.0167, 0)}
					/>
				</textlabel>

				<uistroke key={"UIStroke"} Thickness={2} />

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
			</frame>
		</frame>
	);
};

interface SidebarProps {
	autoDigController: AutoDigging;
	uiController: UiController;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const [autoDigEnabled, setAutoDiggingEnabled] = React.useState(false);

	useEffect(() => {
		Signals.setAutoDiggingEnabled.Connect((enabled: boolean) => {
			setAutoDiggingEnabled(enabled);
		});
	}, []);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"QuickActionButtons"}
			Position={UDim2.fromScale(0.01, 0.5)}
			Size={UDim2.fromScale(0.2, 0.6)}
			AnchorPoint={new Vector2(0, 0.5)}
		>
			<uilistlayout
				key={"UIListLayout"}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>

			<SidebarButton
				icon={"rbxassetid://70651545986325"}
				text={"Backpack"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Inventory });
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://90345162177443"}
				text={"Skills"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Skills });
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://125407928227030"}
				text={"Shop"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://108568741864610"}
				text={"Auto Dig"}
				notificationVisible={true}
				notificationColor={autoDigEnabled ? Color3.fromRGB(69, 186, 15) : Color3.fromRGB(230, 42, 25)}
				onClick={() => {
					const enabled = !autoDigEnabled;
					setAutoDiggingEnabled(enabled);

					props.autoDigController.setAutoDiggingEnabled(enabled);
					// Set an attribute for other controllers to know if auto digging is enabled
					// Other than this, there is a signal fired when auto digging is enabled/disabled
					Players.LocalPlayer.SetAttribute("AutoDigging", enabled);
				}}
			/>
		</frame>
	);
};
