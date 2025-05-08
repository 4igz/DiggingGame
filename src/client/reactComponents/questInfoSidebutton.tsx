import { subscribe } from "@rbxts/charm";
import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { treasureInventoryAtom } from "client/atoms/inventoryAtoms";
import { usePx } from "client/hooks/usePx";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import { npcCharacterRenders, questConfig } from "shared/config/questConfig";
import { QuestProgress } from "shared/networkTypes";
import { Signals } from "shared/signals";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { makePlural } from "shared/util/nameUtil";

const getActiveQuest = (
	questInfo: Map<keyof typeof questConfig, QuestProgress>,
): [keyof typeof questConfig, QuestProgress] | undefined => {
	for (const [key, value] of questInfo) {
		if (value.active) {
			return [key, questInfo.get(key)!];
		}
	}
	return undefined;
};

const DEFAULT_POS = UDim2.fromScale(1.013, 0.55);
const CLOSED_POS = UDim2.fromScale(1.275, 0.55);

export const QuestInfoSideButton = () => {
	const [pos, setPos] = useMotion(DEFAULT_POS);
	const [questInfo, setQuestInfo] = React.useState<Map<keyof typeof questConfig, QuestProgress>>();
	const [activeQuest, setActiveQuest] = React.useState<
		{ name: keyof typeof questConfig; info: QuestProgress } | undefined
	>(undefined);
	const [, render] = React.useState(0);
	const [platform, setPlatform] = React.useState(getPlayerPlatform());

	const px = usePx();

	useEffect(() => {
		if (questInfo === undefined) return;
		const result = getActiveQuest(questInfo);

		if (result === undefined) {
			// No quest active
			setActiveQuest(undefined);
			return;
		}

		const [key, questProgress] = result;

		setActiveQuest({ name: key, info: questProgress });
	}, [questInfo]);

	useEffect(() => {
		Events.updateInventory.connect(() => {
			render((v) => v + 1);
		});

		subscribe(treasureInventoryAtom, () => {});

		Signals.menuOpened.Connect((isOpen) => {
			if (isOpen) {
				setPos.spring(CLOSED_POS, springs.default);
			} else {
				setPos.spring(DEFAULT_POS, springs.default);
			}
		});
	}, []);

	useEffect(() => {
		Events.updateQuestProgress.connect((questProgress) => {
			setQuestInfo(questProgress);
		});

		Functions.getQuestProgress()
			.then((questProgress) => {
				setQuestInfo(questProgress);
			})
			.catch(warn);

		UserInputService.InputChanged.Connect((input) => {
			setPlatform(getPlayerPlatform());
		});
	}, []);

	const questline = questConfig[activeQuest?.name ?? ""];
	const quest = questline && questline[activeQuest?.info.stage ?? -1];
	const MOBILE_SCALE = 1.5;

	const collectedAmount = treasureInventoryAtom().reduce((acc, target) => {
		if (target.itemName === (quest?.target ?? "")) {
			return ++acc;
		}
		return acc;
	}, 0);

	const hasEnough = collectedAmount >= (quest?.collectAmount ?? 1);

	return (
		<frame
			AnchorPoint={new Vector2(1, 1)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Sidebar"}
			Position={pos}
			Size={UDim2.fromScale(0.275, 0.11 * (platform === "Mobile" ? MOBILE_SCALE : 1))}
			Visible={activeQuest !== undefined}
		>
			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={npcCharacterRenders[activeQuest?.name ?? ""] ?? ""}
				key={"Character"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.8, 0.3)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.35, 1.5)}
				ZIndex={2}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://83143085311406"}
				key={"Gradient"}
				Position={UDim2.fromScale(0.034, 0.493)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.75, 0.914)}
				SliceCenter={new Rect(23, 22, 372, 67)}
				SliceScale={0.7}
			/>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428")}
				key={"Description"}
				Position={UDim2.fromScale(0.0693, 0.116)}
				Size={UDim2.fromScale(0.5, 0.328)}
				Text={
					quest &&
					`Bring ${quest.collectAmount} ${makePlural(quest.target, quest.collectAmount!)} ${
						collectedAmount > 0 ? `${collectedAmount}/${quest.collectAmount}` : ""
					}`
				}
				TextColor3={hasEnough ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke
					key={"UIStroke"}
					LineJoinMode={Enum.LineJoinMode.Bevel}
					Thickness={px(2)}
					Transparency={0.2}
				/>
			</textlabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Label"}
				Position={UDim2.fromScale(0.0693, 0.356)}
				Size={UDim2.fromScale(0.5, 0.48)}
				Text={activeQuest ? (hasEnough ? "Completed" : activeQuest.name) : "No Quest Active"}
				TextColor3={Color3.fromRGB(255, 213, 62)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke
					key={"UIStroke"}
					LineJoinMode={Enum.LineJoinMode.Bevel}
					Thickness={px(2)}
					Transparency={0.2}
				/>
			</textlabel>
			<uiscale key={"UIScale"} Scale={0.9} />
		</frame>
	);
};
