//!optimize 2
import React, { useEffect } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import { ItemName, ItemType, Rarity, RewardType } from "shared/networkTypes";
import { shortenNumber, spaceWords } from "shared/util/nameUtil";

const RC = gameConstants.RARITY_COLORS;

export interface ClaimedPopupProps {
	itemRarity?: Rarity;
	reward: ItemType | number | RewardType;
	itemName: ItemName | "Money";
	onComplete: () => void;
	count: number;
}

const DEFAULT_COLOR = new Color3(0.27, 1, 0.25);

export const ClaimedPopup = (props: ClaimedPopupProps) => {
	const [sizeMotion, setSizeMotion] = useMotion(UDim2.fromScale(0, 0));

	const [spinValue, setSpinValue] = React.useState(0);
	const [imageRotation, setImageRotation] = useMotion(0);

	const POPUP_TIME = 5;

	useEffect(() => {
		setSizeMotion.spring(UDim2.fromScale(0.3, 0.1), springs.responsive);

		task.delay(POPUP_TIME, () => {
			setSizeMotion.onComplete(() => {
				props.onComplete();
			});
			setSizeMotion.spring(UDim2.fromScale(0, 0), springs.responsive);
		});

		let currentRotation = imageRotation.getValue();
		const MAX_ROTATION = 45;
		const rotationThread = task.spawn(() => {
			while (true) {
				// Make image bob back and forth
				task.wait(1);
				currentRotation = currentRotation < MAX_ROTATION ? MAX_ROTATION : -MAX_ROTATION;
				setImageRotation.spring(currentRotation, springs.bubbly);
			}
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	// Second effect handles the event data
	useEffect(() => {
		const SPIN_FREQUENCY = 0.1; // Smaller value = slower spin

		const connection = RunService.RenderStepped.Connect(() => {
			setSpinValue(0.5 * (1 + math.sin(2 * math.pi * SPIN_FREQUENCY * tick())));
		});

		return () => {
			connection.Disconnect();
		};
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 1)}
			BackgroundTransparency={1}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={sizeMotion}
			Visible={true}
		>
			<uilistlayout
				key={"UIListLayout"}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
			/>

			<frame
				AnchorPoint={new Vector2(1, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"ImageHolder"}
				Position={UDim2.fromScale(0.625, 0.219)}
				Size={UDim2.fromScale(0.5, 2)}
			>
				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://74632346775366"}
					key={"Star"}
					Rotation={spinValue * 360}
					Size={UDim2.fromScale(1, 1)}
				/>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"ItemImage"}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={5}
					Image={
						REWARD_IMAGES[props.reward as RewardType] ??
						(gameConstants.SHOP_CONFIGS[props.reward as ItemType] !== undefined
							? gameConstants.SHOP_CONFIGS[props.reward as ItemType][props.itemName as ItemName]
									?.itemImage
							: "rbxassetid://96446480715038")
					}
					Rotation={imageRotation}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
				</imagelabel>

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://104992023858077"}
					key={"Radial"}
					Rotation={spinValue * 360}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				/>
			</frame>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"ExplainerText"}
				RichText={true}
				Size={UDim2.fromScale(2, 1)}
				TextXAlignment={Enum.TextXAlignment.Center}
				Text={`Claimed ${
					type(props.itemName) === "number"
						? props.reward === "Money"
							? "$" + shortenNumber(props.itemName as unknown as number, false)
							: props.reward === "Experience"
							? shortenNumber(props.itemName as unknown as number, false) + "XP"
							: props.reward === "SkillPoints"
							? shortenNumber(props.itemName as unknown as number, false) + "SP"
							: shortenNumber(props.itemName as unknown as number, false)
						: spaceWords(props.itemName) ?? "Unknown"
				}`}
				TextColor3={type(props.itemName) === "number" ? DEFAULT_COLOR : RC[props.itemRarity ?? "Common"]}
				TextScaled={true}
				TextWrapped={false}
				AutomaticSize={Enum.AutomaticSize.X}
			>
				<uistroke key={"UIStroke"} Color={new Color3(0, 0, 0)} Thickness={1} />
			</textlabel>
		</frame>
	);
};
