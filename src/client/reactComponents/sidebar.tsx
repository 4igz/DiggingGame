import React, { useEffect } from "@rbxts/react";
import { UiController } from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { MENUS } from "./mainUi";

interface SidebarButtonProps {
	icon: string;
	text: string;
	onClick?: () => void;
}

const SidebarButton = (props: SidebarButtonProps) => {
	const START_SZ = UDim2.fromScale(0.396, 0.251);
	const SZ_INC = UDim2.fromScale(0.05, 0.05);
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setPressed] = React.useState(false);
	const [size, sizeMotion] = useMotion(START_SZ);

	useEffect(() => {
		sizeMotion.spring(isHovered ? START_SZ.add(SZ_INC) : START_SZ, springs.bubbly);
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(
			isPressed ? START_SZ.sub(SZ_INC) : isHovered ? START_SZ.add(SZ_INC) : START_SZ,
			springs.bubbly,
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
					MouseButton1Down: () => setPressed(true),
					MouseButton1Up: () => setPressed(false),
					MouseButton1Click: props.onClick,
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
		</frame>
	);
};

interface SidebarProps {
	uiController: UiController;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"QuickActionButtons"}
			Position={UDim2.fromScale(0.02, 0.173)}
			Size={UDim2.fromScale(0.143, 0.529)}
		>
			<uilistlayout
				key={"UIListLayout"}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>

			<SidebarButton
				icon={"rbxassetid://70651545986325"}
				text={"BACKPACK"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Inventory });
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://90345162177443"}
				text={"SKILLS"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Skills });
				}}
			/>
			<SidebarButton
				icon={"rbxassetid://125407928227030"}
				text={"SHOP"}
				onClick={() => {
					props.uiController.toggleUi(gameConstants.MAIN_UI, { menu: MENUS.Shop });
				}}
			/>
		</frame>
	);
};
