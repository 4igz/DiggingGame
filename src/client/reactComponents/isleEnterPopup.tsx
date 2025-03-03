//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { ZoneController } from "client/controllers/zoneController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { difficulties, mapConfig } from "shared/config/mapConfig";
import { fullTargetConfig, trashConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/gameConstants";
import { Rarity } from "shared/networkTypes";
import { AnimatedButton } from "./inventory";

interface ItemProps {
	itemName: string;
	rarity: Rarity;
	order: number;
	bgColor: Color3;
}

const IsleItem = (props: ItemProps) => {
	return (
		<AnimatedButton size={UDim2.fromScale(1, 1)} layoutOrder={props.order} active={false}>
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://138923309919912"}
				ImageColor3={props.bgColor}
				key={"ItemBackground"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel
					Size={UDim2.fromScale(1, 1)}
					Image={fullTargetConfig[props.itemName].itemImage}
					BackgroundTransparency={1}
				>
					<uilistlayout
						key={"UIListLayout"}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Bottom}
					/>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"ItemName"}
						Size={UDim2.fromScale(1, 0.2)}
						Text={props.itemName}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={14}
					>
						<uistroke key={"UIStroke"} />
					</textlabel>

					<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.2, 0)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={1}
						key={"Rarity"}
						Size={UDim2.fromScale(1, 0.2)}
						Text={props.rarity}
						TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke key={"UIStroke"} />
					</textlabel>
				</imagelabel>
			</imagelabel>
		</AnimatedButton>
	);
};

interface IsleEnterPopupProps {
	zoneController: ZoneController;
}

const connectedZoneNames = new Set<string>();

export const IsleEnterPopup = (props: IsleEnterPopupProps) => {
	const [isleName, setIsleName] = useState<keyof typeof mapConfig>("");
	const [firstEnter, setFirstEnter] = useState(true);
	const [pos, posMotion] = useMotion(UDim2.fromScale(0.5, -0.3));
	const [, transparencyMotion] = useMotion(1);
	const [isleItems, setIsleItems] = useState<ItemProps[]>([]);
	const frameRef = createRef<Frame>();

	useEffect(() => {
		if (!isleName || isleName === "") return;
		if (firstEnter) {
			setFirstEnter(false);
			return;
		}
		const cfg = mapConfig[isleName];
		if (!cfg) {
			warn(`Island ${isleName} does not have a corresponding config in mapConfig`);
			return;
		}
		// Incase they were running before:
		posMotion.stop();
		transparencyMotion.stop();

		// Reset states:
		transparencyMotion.immediate(1);
		posMotion.immediate(UDim2.fromScale(0.5, -0.3));
		// setIsleItems([]); // Reset previous items

		// Iterate through the targetList and add the items to the list
		const newItems: ItemProps[] = [];
		for (const item of cfg.targetList) {
			if (!trashConfig[item] && fullTargetConfig[item]) {
				const itemCfg = fullTargetConfig[item];
				newItems.push({
					itemName: item,
					rarity: itemCfg.rarityType,
					bgColor: gameConstants.MAP_THEME_COLORS[isleName],
					order: itemCfg.rarity,
				});
			}
		}
		setIsleItems(newItems);

		let cleaned = false;
		const ON_SCREEN_TIME = 2;

		const unsub2 = posMotion.onComplete(() => {
			task.wait(ON_SCREEN_TIME);
			if (cleaned) {
				transparencyMotion.immediate(1);
				return;
			}
			transparencyMotion.spring(1, springs.molasses);
		});

		task.defer(() => {
			transparencyMotion.spring(0, springs.pitch);
			posMotion.spring(UDim2.fromScale(0.5, 0), springs.heavy);
		});

		return () => {
			cleaned = true;
			unsub2();
		};
	}, [isleName]);

	useEffect(() => {
		props.zoneController.isleZoneMap.forEach((zone, name) => {
			connectedZoneNames.add(name);
			zone.localPlayerEntered.Connect(() => {
				setIsleName(name);
			});
		});

		props.zoneController.zonesUpdated.Connect(() => {
			props.zoneController.isleZoneMap.forEach((zone, name) => {
				if (connectedZoneNames.has(name)) return;
				connectedZoneNames.add(name);
				zone.localPlayerEntered.Connect(() => {
					setIsleName(name);
				});
			});
		});

		transparencyMotion.onStep((value) => {
			if (frameRef.current) {
				for (const descendant of frameRef.current.GetDescendants()) {
					// if (descendant.IsA("GuiObject")) {
					// 	descendant.BackgroundTransparency = value;
					// }
					if (descendant.IsA("TextLabel") || descendant.IsA("TextButton")) {
						descendant.TextTransparency = value;
					}
					if (descendant.IsA("ImageLabel") || descendant.IsA("ImageButton")) {
						descendant.ImageTransparency = value;
					}
					if (descendant.IsA("UIStroke")) {
						descendant.Transparency = value;
					}
				}
			}
		});
	}, [frameRef]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Top Bar Frame"}
			Position={pos}
			Size={UDim2.fromScale(3.31, 0.2)}
			ref={frameRef}
		>
			<uilistlayout
				key={"UIListLayout"}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalFlex={Enum.UIFlexAlignment.SpaceEvenly}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Title"}
				Position={UDim2.fromScale(0.0164, 0.0261)}
				Size={UDim2.fromScale(0.967, 0.236)}
				Text={isleName}
				TextColor3={Color3.fromRGB(0, 255, 162)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={4} />

				<uipadding
					key={"UIPadding"}
					PaddingBottom={new UDim(0.00545, 0)}
					PaddingLeft={new UDim(0.386, 0)}
					PaddingRight={new UDim(0.386, 0)}
					PaddingTop={new UDim(0.00545, 0)}
				/>
			</textlabel>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Container"}
				Position={UDim2.fromScale(0.0749, 0.351)}
				Size={UDim2.fromScale(0.982, 0.511)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				{isleItems.map((item) => (
					<IsleItem {...item} />
				))}
			</frame>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Italic)}
				key={"Difficulty"}
				Position={UDim2.fromScale(0.0164, 0.796)}
				Size={UDim2.fromScale(0.967, 0.169)}
				Text={mapConfig[isleName]?.difficulty ?? "Easy"}
				TextColor3={difficulties[mapConfig[isleName]?.difficulty] ?? Color3.fromRGB(0, 255, 162)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={4} />

				<uipadding
					key={"UIPadding"}
					PaddingBottom={new UDim(0.00098, 0)}
					PaddingLeft={new UDim(0.465, 0)}
					PaddingRight={new UDim(0.465, 0)}
					PaddingTop={new UDim(0.00098, 0)}
				/>
			</textlabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.58} />
		</frame>
	);
};
