import React, { useEffect } from "@rbxts/react";
import { Events, Functions } from "client/network";
import { questConfig } from "shared/config/questConfig";
import { QuestProgress } from "shared/networkTypes";

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

interface QuestInfoSideButtonProps {}

export const QuestInfoSideButton = (props: QuestInfoSideButtonProps) => {
	const [questInfo, setQuestInfo] = React.useState<Map<keyof typeof questConfig, QuestProgress>>();
	const [activeQuest, setActiveQuest] = React.useState<
		{ name: keyof typeof questConfig; info: QuestProgress } | undefined
	>(undefined);
	const [questComplete, setQuestComplete] = React.useState(false);

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

		if (questProgress && questProgress.completed) {
			setQuestComplete(true);
		}
	}, [questInfo]);

	useEffect(() => {
		Events.updateQuestProgress.connect((questProgress) => {
			setQuestInfo(questProgress);
		});

		Functions.getQuestProgress().then((questProgress) => {
			setQuestInfo(questProgress);
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(1, 1)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Sidebar"}
			Position={UDim2.fromScale(1, 0.56)}
			Size={UDim2.fromScale(0.275, 0.124)}
			Visible={activeQuest !== undefined}
		>
			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://140089934931360"}
				key={"Character"}
				Position={UDim2.fromScale(0.728, -0.22)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.253, 1.28)}
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
				Size={UDim2.fromScale(0.833, 0.914)}
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
				Size={UDim2.fromScale(0.659, 0.328)}
				Text={questComplete ? "Quest Complete!" : "Quest In Progress"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} Thickness={2} Transparency={0.2} />
			</textlabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Label"}
				Position={UDim2.fromScale(0.162, 0.356)}
				Size={UDim2.fromScale(0.566, 0.48)}
				Text={activeQuest ? activeQuest.name : "No Quest Active"}
				TextColor3={Color3.fromRGB(255, 213, 62)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} Thickness={2} Transparency={0.2} />
			</textlabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428")}
				key={"PopupClicked"}
				Position={UDim2.fromScale(0.11, 1.13)}
				Size={UDim2.fromScale(0.848, 0.252)}
				Text={"(4/8 peglegs obtained) (Reward: 200 cash)"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
				Visible={false}
			>
				<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} Thickness={2} Transparency={0.2} />
			</textlabel>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={new Font("rbxassetid://16658221428")}
				key={"PopupUpdate"}
				Position={UDim2.fromScale(0.11, 1.13)}
				RichText={true}
				Size={UDim2.fromScale(0.775, 0.252)}
				Text={"(<b>4/8</b>) peglegs aquired!"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
				Visible={false}
			>
				<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} Thickness={2} Transparency={0.2} />
			</textlabel>

			<uiscale key={"UIScale"} Scale={0.9} />
		</frame>
	);
};
