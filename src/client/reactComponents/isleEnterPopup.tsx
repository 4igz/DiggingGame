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
import { Functions } from "client/network";
import { redToGreen } from "shared/util/colorUtil";

interface ItemProps {
	itemName: string;
	rarity: Rarity;
	order: number;
	bgColor: Color3;
	active?: boolean;
}

const IsleItem = (props: ItemProps) => {
	return (
		<AnimatedButton
			clickable={false}
			active={props.active ?? false}
			size={UDim2.fromScale(0.075, 1)}
			anchorPoint={new Vector2(0.5, 0.5)}
			layoutOrder={props.order}
			position={UDim2.fromScale(0.5, 0.5)}
			zindex={10}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://117435155005447"}
				ImageColor3={gameConstants.RARITY_COLORS[props.rarity]}
				ImageTransparency={0.5}
				key={"Background"}
				Position={UDim2.fromScale(0.5, 0.5)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1)}
				SliceScale={0.15}
			>
				<imagelabel
					BackgroundTransparency={1}
					ImageTransparency={0}
					Image={fullTargetConfig[props.itemName].itemImage}
					key={"Icon"}
					Size={UDim2.fromScale(1, 1)}
				>
					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"ItemName"}
						Position={UDim2.fromScale(-0.312769, -0.123462)}
						Rotation={-15}
						Size={UDim2.fromScale(1.3, 0.35)}
						Text={props.itemName}
						TextColor3={gameConstants.RARITY_COLORS[props.rarity]}
						TextScaled={true}
						TextTransparency={-0.142746}
						TextTruncate={Enum.TextTruncate.AtEnd}
						ZIndex={2351823}
					>
						<uistroke key={"UIStroke"} Thickness={2} />
					</textlabel>
				</imagelabel>
			</imagelabel>

			<uiaspectratioconstraint DominantAxis={Enum.DominantAxis.Height} key={".$UIAspectRatioConstraint"} />
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
	const [currentStrength, setCurrentStrength] = useState(0);
	const [resetTick, setResetTick] = useState(0);
	const [disappearing, setDisappearing] = useState(true);
	const frameRef = createRef<Frame>();

	useEffect(() => {
		Functions.getCurrentStrength().then((strength) => {
			setCurrentStrength(strength);
		});
	}, []);

	useEffect(() => {
		Functions.getCurrentStrength().then((strength) => {
			setCurrentStrength(strength);
		});

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
		setDisappearing(false);
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
			setDisappearing(true);
		});

		task.defer(() => {
			transparencyMotion.spring(0, springs.pitch);
			posMotion.spring(UDim2.fromScale(0.5, 0.05), springs.heavy);
		});

		return () => {
			cleaned = true;
			unsub2();
		};
	}, [isleName, resetTick]);

	useEffect(() => {
		props.zoneController.isleZoneMap.forEach((zone, name) => {
			connectedZoneNames.add(name);
			zone.localPlayerEntered.Connect(() => {
				setIsleName(name);
				setResetTick(time());
			});
		});

		props.zoneController.zonesUpdated.Connect(() => {
			props.zoneController.isleZoneMap.forEach((zone, name) => {
				if (connectedZoneNames.has(name)) return;
				connectedZoneNames.add(name);
				zone.localPlayerEntered.Connect(() => {
					setIsleName(name);
					setResetTick(time());
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
			Size={UDim2.fromScale(1, 0.2)}
			ref={frameRef}
		>
			<uilistlayout
				key={"UIListLayout"}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalFlex={Enum.UIFlexAlignment.SpaceEvenly}
				Padding={new UDim(0.08, 0)}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Title"}
				Position={UDim2.fromScale(0.0164, 0.0261)}
				Size={UDim2.fromScale(1.2, 0.3)}
				Text={`${isleName} - ${mapConfig[isleName]?.difficulty ?? "Easy"}`}
				TextColor3={difficulties[mapConfig[isleName]?.difficulty] ?? Color3.fromRGB(0, 255, 162)}
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
				Size={UDim2.fromScale(1.3, 0.511)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0.008, 0)}
				/>

				{isleItems.map((item) => (
					<IsleItem {...item} active={!disappearing} />
				))}
			</frame>

			<imagelabel
				AnchorPoint={new Vector2(0, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://128518524234528"}
				key={".$Background"}
				Position={new UDim2(0, 5, 1, -5)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.4, 0.2)}
				SliceCenter={new Rect(89, 120, 960, 120)}
			>
				<textlabel
					key={"TextLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={
						new Font(
							"rbxasset://fonts/families/SourceSansPro.json",
							Enum.FontWeight.Bold,
							Enum.FontStyle.Normal,
						)
					}
					Position={new UDim2(0.5, 0, 0.5, -2)}
					Size={new UDim2(1, -10, 1, -5)}
					Text={`Recommended strength: ${mapConfig[isleName]?.recommendedStrength ?? 1}`}
					TextColor3={redToGreen(currentStrength / (mapConfig[isleName]?.recommendedStrength ?? 1))}
					TextScaled={true}
					TextWrapped={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Thickness={2} />
				</textlabel>
			</imagelabel>
			<imagelabel
				AnchorPoint={new Vector2(0, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://128518524234528"}
				key={".$Background"}
				Position={new UDim2(0, 10, 1.2, -5)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.4, 0.2)}
				SliceCenter={new Rect(89, 120, 960, 120)}
			>
				<textlabel
					key={"TextLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={
						new Font(
							"rbxasset://fonts/families/SourceSansPro.json",
							Enum.FontWeight.Bold,
							Enum.FontStyle.Normal,
						)
					}
					Position={new UDim2(0.5, 0, 0.5, -2)}
					Size={new UDim2(1, -10, 1, -5)}
					Text={`Current strength: ${currentStrength}`}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Thickness={2} />
				</textlabel>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.58} />
		</frame>
	);
};
