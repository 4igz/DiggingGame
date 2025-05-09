import React, { useEffect, useState } from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";
import { AnimatedButton } from "./buttons";
import UiController from "client/controllers/uiController";
import { useMotion } from "@rbxts/pretty-react-hooks";
import { Signals } from "shared/signals";
import { PotionConfig, potionConfig } from "shared/config/potionConfig";
import { Events } from "client/network";
import { formatShortTime } from "shared/util/nameUtil";

interface PotionProps {
	cfg: PotionConfig;
	potionName: keyof typeof potionConfig;
	onComplete: () => void;
	timeLeft?: number; // Defaults to the default time of that potion
	updateId?: number; // Add a unique identifier for each update
}

const PotionTimer = (props: PotionProps) => {
	const [timeLeft, setTimeLeft] = useState(props.timeLeft ?? props.cfg.duration);

	const px = usePx();

	useEffect(() => {
		setTimeLeft(props.timeLeft ?? props.cfg.duration);

		let running = true;

		const timer = async () => {
			while (running) {
				await Promise.delay(1);
				setTimeLeft((prev) => {
					if (prev > 0) {
						return math.max(prev - 1, 0);
					} else {
						props.onComplete();
						return 0;
					}
				});
			}
		};

		timer();

		return () => {
			running = false;
		};
	}, [props.timeLeft, props.updateId]);

	return (
		<imagelabel
			Image={props.cfg.itemImage}
			BackgroundTransparency={1}
			Size={UDim2.fromScale(0.1, 1)}
			LayoutOrder={props.timeLeft}
			key={props.potionName}
			ScaleType={"Fit"}
			ZIndex={1}
		>
			<uiaspectratioconstraint AspectRatio={1} />

			<textlabel
				Text={formatShortTime(timeLeft)}
				FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0, 1)}
				Position={UDim2.fromScale(0, 1)}
				Size={UDim2.fromScale(1, 0.3)}
				TextScaled={true}
				TextXAlignment={Enum.TextXAlignment.Center}
				TextColor3={new Color3(1, 1, 1)}
			>
				<uistroke Thickness={px(3)} />
			</textlabel>
		</imagelabel>
	);
};

interface BottomTipsProps {
	uiController: UiController;
}

const DEFAULT_POS = UDim2.fromScale(0.025, 0.99);
const CLOSED_POS = UDim2.fromScale(0.025, 1.15);

export const BottomTips = (props: BottomTipsProps) => {
	const [hoveringPremium, setHoveringPremium] = useState(false);
	const [menuPos, menuPosMotion] = useMotion(DEFAULT_POS);
	const [currentPotions, setCurrentPotions] = useState(new Array<PotionProps>());

	const px = usePx();

	const removePotion = (potionName: keyof typeof potionConfig) => {
		setCurrentPotions((prev) => prev.filter((v) => v.potionName !== potionName));
	};

	useEffect(() => {
		Signals.menuOpened.Connect((isOpen) => {
			menuPosMotion.spring(isOpen ? CLOSED_POS : DEFAULT_POS);
		});

		Signals.drankPotion.Connect((potionName: keyof typeof potionConfig) => {
			const cfg = potionConfig[potionName];

			setCurrentPotions((prev) => {
				const existingIndex = prev.findIndex((v: PotionProps) => v.potionName === potionName);

				if (existingIndex !== -1) {
					const newPotions = [...prev];
					newPotions[existingIndex] = {
						...prev[existingIndex],
						timeLeft: (prev[existingIndex].timeLeft || 0) + cfg.duration,
						updateId: math.random(),
					};
					return newPotions;
				}

				return [
					...prev,
					{
						cfg,
						potionName,
						updateId: math.random(),
						onComplete: () => {
							print("Called oncomplete for potion: " + potionName);
							removePotion(potionName);
						},
					},
				];
			});
		});

		Events.updateActivePotions.connect((potions) => {
			setCurrentPotions(
				potions.map((potion) => ({
					cfg: potionConfig[potion.potionName],
					potionName: potion.potionName,
					timeLeft: potion.timeLeft,
					onComplete: () => {
						removePotion(potion.potionName);
					},
				})),
			);
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0, 1)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Position={menuPos}
			Size={UDim2.fromScale(1, 0.1)}
			ZIndex={100}
			Visible={true}
		>
			<uilistlayout FillDirection={"Horizontal"} Padding={new UDim(0, 15)} />

			<AnimatedButton
				layoutOrder={0}
				position={UDim2.fromScale(-0.000172565, 1)}
				size={UDim2.fromScale(0.033, 1)}
				anchorPoint={new Vector2(0, 1)}
				onClick={() => {
					MarketplaceService.PromptPremiumPurchase(Players.LocalPlayer);
				}}
				onHover={() => {
					setHoveringPremium(true);
				}}
				onLeave={() => {
					setHoveringPremium(false);
				}}
			>
				<textlabel
					FontFace={Font.fromEnum(Enum.Font.Bangers)}
					key={"Premium"}
					Text={""}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0, 0.05)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					<uistroke key={"UIStroke"} Thickness={px(4)} />

					<textlabel
						Size={UDim2.fromScale(1, 0.5)}
						Position={UDim2.fromScale(0, 0.6)}
						Text={" +10%"}
						FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
						TextSize={px(25)}
						BackgroundTransparency={1}
						TextColor3={new Color3(1, 1, 1)}
						TextXAlignment={Enum.TextXAlignment.Center}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />

						<uigradient
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, new Color3(1, 0.77, 0.28)),
									new ColorSequenceKeypoint(1, new Color3(1, 0.68, 0)),
								])
							}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						AutomaticSize={Enum.AutomaticSize.Y}
						BackgroundColor3={new Color3()}
						BackgroundTransparency={0.3}
						BorderColor3={Color3.fromRGB(27, 42, 53)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"ToolTip"}
						Position={UDim2.fromScale(3.82001, -0.59)}
						Size={UDim2.fromScale(7, 0.4)}
						Text={"Premium users get +10% money and +10% experience!"}
						TextColor3={new Color3(1, 1, 1)}
						// TextScaled={true}
						TextSize={px(15)}
						TextWrapped={true}
						TextTransparency={0.1}
						ZIndex={100}
						Visible={hoveringPremium}
					>
						<uistroke
							key={"UIStroke"}
							ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
							Thickness={px(10)}
							Transparency={0.3}
						/>
						<uistroke
							key={"UIStroke"}
							ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
							Thickness={px(2)}
							Transparency={0.3}
							Color={new Color3()}
						/>
					</textlabel>
				</textlabel>
			</AnimatedButton>

			<frame
				Size={UDim2.fromScale(0.5, 1)}
				BackgroundTransparency={1}
				LayoutOrder={1}
				Position={UDim2.fromScale(-0.000172565, 1)}
			>
				<uilistlayout FillDirection={"Horizontal"} Padding={new UDim(0, 10)} />

				{currentPotions.map((v) => {
					return (
						<PotionTimer
							cfg={v.cfg}
							potionName={v.potionName}
							timeLeft={v.timeLeft}
							onComplete={v.onComplete}
						/>
					);
				})}
			</frame>
		</frame>
	);
};
