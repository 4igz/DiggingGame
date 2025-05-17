//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { ZoneController } from "client/controllers/zoneController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { difficulties, mapConfig } from "shared/config/mapConfig";
import { fullTargetConfig, trashConfig } from "shared/config/targetConfig";
import { gameConstants } from "shared/gameConstants";
import { Rarity } from "shared/networkTypes";
import { Functions } from "client/network";
import { redToGreen } from "shared/util/colorUtil";
import { AnimatedButton } from "./buttons";
import { getOrderFromRarity } from "shared/util/rarityUtil";
import { usePx } from "client/hooks/usePx";
import { Signals } from "shared/signals";

interface ItemProps {
	itemName: string;
	rarity: Rarity;
	order: number;
	bgColor: Color3;
	active?: boolean;
}

const IsleItem = (props: ItemProps) => {
	const px = usePx();

	return (
		<AnimatedButton
			size={UDim2.fromScale(0.0581114, 1.5625)}
			layoutOrder={props.order}
			clickable={false}
			active={props.active ?? false}
			anchorPoint={new Vector2(0.5, 0.5)}
		>
			<imagelabel
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				ScaleType={"Fit"}
				Image={"rbxassetid://130373441663401"}
				ImageColor3={gameConstants.RARITY_COLORS[props.rarity]}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={fullTargetConfig[props.itemName].itemImage}
					key={"ItemImage"}
					Position={UDim2.fromScale(0.5, 0.46)}
					Size={UDim2.fromScale(0.666667, 0.64)}
				/>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
					key={"ItemName"}
					Position={UDim2.fromScale(0.5, 0)}
					Size={UDim2.fromScale(1, 0.2)}
					Text={props.itemName}
					TextColor3={new Color3(1, 1, 1)}
					TextSize={px(15)}
					TextTruncate={"SplitWord"}
				>
					<uistroke key={"UIStroke"} Thickness={2} />
				</textlabel>
			</imagelabel>
		</AnimatedButton>
	);
};

interface IsleEnterPopupProps {
	zoneController: ZoneController;
}

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
			posMotion.spring(UDim2.fromScale(0.5, 0.1), springs.heavy);
		});

		return () => {
			cleaned = true;
			unsub2();
		};
	}, [isleName, resetTick, firstEnter]);

	useEffect(() => {
		const enteredSignal = Signals.enteredIsland.Connect((zoneName) => {
			setIsleName(zoneName);
			setResetTick(tick());
		});

		const unsub = transparencyMotion.onStep((value) => {
			if (frameRef.current) {
				frameRef.current.Transparency = value;

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

		return () => {
			enteredSignal.Disconnect();
			unsub();
		};
	}, [frameRef]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundColor3={new Color3()}
			BackgroundTransparency={0.5}
			key={"Container"}
			Position={pos}
			Size={UDim2.fromScale(0.9, 0.071)}
			ref={frameRef}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

			<uigradient
				key={"UIGradient"}
				Transparency={
					new NumberSequence([
						new NumberSequenceKeypoint(0, 1),
						new NumberSequenceKeypoint(0.5, 0),
						new NumberSequenceKeypoint(1, 1),
					])
				}
			/>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				key={"PopupList"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.01, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				{isleItems.map((item) => (
					<IsleItem {...item} active={!disappearing} />
				))}
			</frame>

			<textlabel
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"PlaceName"}
				Position={UDim2.fromScale(0.501, -1.2)}
				Size={UDim2.fromScale(0.266344, 0.625)}
				Text={isleName ?? ""}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
			>
				<uistroke key={"UIStroke"} Thickness={3} />

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(
								0,
								(difficulties[mapConfig[isleName]?.difficulty] ?? new Color3()).Lerp(new Color3(), 0.4),
							),
							new ColorSequenceKeypoint(1, difficulties[mapConfig[isleName]?.difficulty] ?? new Color3()),
						])
					}
					Rotation={90}
				/>
			</textlabel>

			<textlabel
				AnchorPoint={new Vector2(0.5, 1)}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"PlaceName"}
				Position={UDim2.fromScale(0.501, 1.9)}
				Size={UDim2.fromScale(0.266344, 0.375)}
				Text={`(${mapConfig[isleName]?.difficulty ?? ""})`}
				TextColor3={difficulties[mapConfig[isleName]?.difficulty]}
				TextScaled={true}
			>
				<uistroke key={"UIStroke"} Thickness={2} />
			</textlabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={25.8125} />
		</frame>
	);
};
