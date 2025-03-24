//!optimize 2
import React, { useEffect } from "@rbxts/react";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { MENUS } from "./inventory";
import { AutoDigging } from "client/controllers/autoDigController";
import { Players, UserInputService } from "@rbxts/services";
import { Signals } from "shared/signals";
import { Events, Functions } from "client/network";

interface SidebarButtonProps {
	icon: string;
	text: string;
	notificationVisible?: boolean;
	notificationColor?: Color3;
	notificationText?: string;
	gamepadCode: Enum.KeyCode;
	gamepadEnabled?: boolean;
	uiController: UiController;
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

	useEffect(() => {
		const con = UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return;
			if (props.uiController.isMenuLayerOpen()) return;
			if (props.gamepadEnabled && input.KeyCode === props.gamepadCode) {
				if (props.onClick) {
					props.onClick();
				}
				setPressed(true);
				task.delay(0.1, () => setPressed(false));
			}
		});
		return () => con.Disconnect();
	}, [props.gamepadEnabled]);

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
				Selectable={false}
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
				Position={UDim2.fromScale(0.6, 0.0908)}
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
						PaddingBottom={new UDim(0.025, 0)}
						PaddingLeft={new UDim(0.05, 0)}
						PaddingRight={new UDim(0.05, 0)}
						PaddingTop={new UDim(0.025, 0)}
					/>
				</textlabel>

				<uistroke key={"UIStroke"} Thickness={2} />

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
			</frame>

			<imagelabel
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"GamepadButton"}
				Position={UDim2.fromScale(0.8, 0.5)}
				Size={UDim2.fromScale(0.4, 0.4)}
				Image={UserInputService.GetImageForKeyCode(props.gamepadCode)}
				BackgroundTransparency={1}
				Visible={props.gamepadEnabled ?? false}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
			</imagelabel>
		</frame>
	);
};

interface SidebarProps {
	autoDigController: AutoDigging;
	uiController: UiController;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const [autoDigEnabled, setAutoDiggingEnabled] = React.useState(false);
	const [availableSkillPoints, setAvailableSkillPoints] = React.useState(0);
	const [gamepadEnabled, setGamepadEnabled] = React.useState(UserInputService.GamepadEnabled);

	useEffect(() => {
		Signals.setAutoDiggingEnabled.Connect((enabled: boolean) => {
			setAutoDiggingEnabled(enabled);
		});

		Functions.getLevelData()
			.then((levelData) => {
				setAvailableSkillPoints(levelData.skillPoints);
			})
			.catch((e) => {
				warn(e);
			});
		Events.updateLevelUi.connect((_level, _xp, _xpMax, skillPoints) => {
			setAvailableSkillPoints(skillPoints);
		});

		UserInputService.GamepadConnected.Connect(() => {
			setGamepadEnabled(true);
		});

		UserInputService.GamepadDisconnected.Connect(() => {
			setGamepadEnabled(false);
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
				uiController={props.uiController}
				text={"Backpack"}
				gamepadCode={Enum.KeyCode.ButtonY}
				gamepadEnabled={gamepadEnabled}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Inventory });
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://90345162177443"}
				uiController={props.uiController}
				gamepadEnabled={gamepadEnabled}
				gamepadCode={Enum.KeyCode.ButtonX}
				text={"Skills"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Skills });
				}}
				notificationVisible={availableSkillPoints > 0}
				notificationColor={Color3.fromRGB(230, 42, 25)}
				notificationText={tostring(availableSkillPoints)}
			/>
			<SidebarButton
				icon={"rbxassetid://125407928227030"}
				uiController={props.uiController}
				gamepadEnabled={gamepadEnabled}
				gamepadCode={Enum.KeyCode.ButtonB}
				text={"Shop"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://108568741864610"}
				gamepadEnabled={gamepadEnabled}
				text={"Auto Dig"}
				uiController={props.uiController}
				notificationVisible={true}
				notificationColor={autoDigEnabled ? Color3.fromRGB(69, 186, 15) : Color3.fromRGB(230, 42, 25)}
				gamepadCode={Enum.KeyCode.ButtonL3}
				onClick={() => {
					const enabled = !autoDigEnabled;
					setAutoDiggingEnabled(enabled);

					props.autoDigController.setAutoDiggingEnabled(enabled);
				}}
			/>
		</frame>
	);
};
