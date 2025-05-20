import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService, UserInputService } from "@rbxts/services";
import { sellShopXArrowAtom } from "client/atoms/uiAtoms";
import { TutorialController } from "client/controllers/tutorialController";
import UiController from "client/controllers/uiController";
import { useMotion } from "client/hooks/useMotion";
import { usePx } from "client/hooks/usePx";
import { useSliceScale } from "client/hooks/useSlice";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import {
	DETECT_STEP,
	DIG_STEP,
	FINISH_STEP,
	QUEST_STEP,
	SELL_STEP,
	tutorialConfig,
} from "shared/config/tutorialConfig";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface MessageProps {
	uiController: UiController;
}

export const TutorialMessage = (props: MessageProps) => {
	const [popInPos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.775));
	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [step, setStep] = useState(1);
	const [sellMenuOpen, setSellMenuOpen] = useState(false);
	const [platform, setPlatform] = useState(getPlayerPlatform());
	const [tutorialActive, setTutorialActive] = useState(false);
	const [otherMenuOpen, setOtherMenuOpen] = useState(false);

	const arrow1Ref = useRef<ImageLabel>();

	const scaledSlice = useSliceScale();
	const px = usePx();

	useEffect(() => {
		Signals.setTutorialStep.Connect((step) => {
			const cfg = tutorialConfig[step - 1];
			setStep(step);

			if (!cfg) {
				setVisible(false);
				return;
			}

			setMessage(cfg.message);
			setVisible(true);

			if (step === FINISH_STEP) {
				task.delay(2, () => {
					setVisible(false);
				});
				setTutorialActive(false);
			}
		});

		Functions.getTutorial().then((proceed) => {
			if (!proceed) return;

			Signals.setTutorialStep.Fire(DETECT_STEP);
			setTutorialActive(true);
		});

		Signals.menuOpened.Connect((isOpen, menuName) => {
			posMotion.spring(isOpen ? UDim2.fromScale(0.5, 0.95) : UDim2.fromScale(0.5, 0.775), springs.responsive);

			if (menuName === gameConstants.SELL_UI) {
				setSellMenuOpen(isOpen);
			} else {
				setOtherMenuOpen(isOpen);
			}
		});

		posMotion.spring(
			props.uiController.isMenuLayerOpen() ? UDim2.fromScale(0.5, 0.95) : UDim2.fromScale(0.5, 0.8),
			springs.responsive,
		);

		UserInputService.InputChanged.Connect(() => {
			setPlatform(getPlayerPlatform());
		});
	}, []);

	useEffect(() => {
		if (step === DETECT_STEP && tutorialActive) {
			const connection = Signals.setLuckbarVisible.Connect((open) => {
				posMotion.spring(open ? UDim2.fromScale(0.45, 0.775) : UDim2.fromScale(0.5, 0.775));
			});

			return () => {
				connection.Disconnect();
			};
		}
	}, [step, tutorialActive]);

	useEffect(() => {
		if (!arrow1Ref.current) return;
		if (step === 0) {
			const tween1 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.4, 0.91),
			});
			const tween2 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.37, 0.91),
			});
			let running = true;
			const thread = task.spawn(() => {
				while (running) {
					tween1.Play();
					tween1.Completed.Wait();
					tween2.Play();
					tween2.Completed.Wait();
				}
			});

			return () => {
				running = false;
				task.cancel(thread);
				tween1.Destroy();
				tween2.Destroy();
			};
		} else if (step === SELL_STEP) {
			const tween1 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.38, 0.74),
			});
			const tween2 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.395, 0.74),
			});
			let running = true;
			const thread = task.spawn(() => {
				while (running) {
					tween1.Play();
					tween1.Completed.Wait();
					tween2.Play();
					tween2.Completed.Wait();
				}
			});

			return () => {
				running = false;
				task.cancel(thread);
				tween1.Destroy();
				tween2.Destroy();
			};
		} else if ((step === DETECT_STEP || step === DIG_STEP) && platform === "Mobile") {
			const tween1 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.67, 0.8),
			});
			const tween2 = TweenService.Create(arrow1Ref.current, new TweenInfo(1), {
				Position: UDim2.fromScale(0.7, 0.8),
			});
			let running = true;
			const thread = task.spawn(() => {
				while (running) {
					tween1.Play();
					tween1.Completed.Wait();
					tween2.Play();
					tween2.Completed.Wait();
				}
			});

			return () => {
				running = false;
				task.cancel(thread);
				tween1.Destroy();
				tween2.Destroy();
			};
		} else if (step === QUEST_STEP && sellMenuOpen) {
			sellShopXArrowAtom(true);
		} else if (step === QUEST_STEP && !sellMenuOpen) {
			sellShopXArrowAtom(false);
		}
	}, [step, arrow1Ref.current, message, platform, sellMenuOpen]);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://136665615709133"}
				ImageColor3={Color3.fromRGB(255, 0, 4)}
				Position={UDim2.fromScale(0.37, 0.91)}
				Rotation={step === QUEST_STEP && sellMenuOpen ? 0 : 90}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.05, 0.15)}
				ZIndex={10}
				Visible={
					!otherMenuOpen &&
					(step === 0 ||
						(step === SELL_STEP && sellMenuOpen) ||
						(step === DIG_STEP && platform === "Mobile") ||
						(step === DETECT_STEP && platform === "Mobile")) &&
					tutorialActive
				}
				ref={arrow1Ref}
			/>

			<frame
				AnchorPoint={new Vector2(0.5, 1)}
				BackgroundTransparency={1}
				key={"TutorialMessage"}
				Position={popInPos}
				Size={UDim2.fromScale(0.364771, 0.225)}
				Visible={visible}
			>
				<uiaspectratioconstraint AspectRatio={10} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://83143085311406"}
					key={"Gradient"}
					Position={UDim2.fromScale(0.5, 0.493)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(0.75, 1.5)}
					SliceCenter={new Rect(23, 22, 372, 67)}
					SliceScale={scaledSlice(0.7)}
				/>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428")}
					key={"Description"}
					Position={UDim2.fromScale(0.46, 0.49)}
					Size={UDim2.fromScale(0.65, 1.3)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Text={message}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					RichText={true}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextYAlignment={Enum.TextYAlignment.Center}
				>
					<uistroke
						key={"UIStroke"}
						LineJoinMode={Enum.LineJoinMode.Bevel}
						Thickness={px(2)}
						Transparency={0.2}
					/>
				</textlabel>

				<frame
					BackgroundTransparency={1}
					key={"Seller Profile"}
					Position={UDim2.fromScale(0.54, -1.1)}
					Size={UDim2.fromScale(0.5, 1.72)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://101474809776872"}
						key={"Background"}
						Position={UDim2.fromScale(0.658678, 0.933597)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1.07079, 1.05101)}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://77754309050946"}
							key={"Profile"}
							Position={UDim2.fromScale(0.497479, 0.448476)}
							Size={UDim2.fromScale(0.6, 0.7541)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

							<frame
								BackgroundColor3={Color3.fromRGB(255, 0, 0)}
								key={".$Notification"}
								Position={UDim2.fromScale(0.7, -0.1)}
								Size={UDim2.fromScale(0.5, 0.5)}
								Visible={true}
								ZIndex={34}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://16658221428",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									key={"Title"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"!"}
									TextColor3={new Color3(1, 1, 1)}
									TextScaled={true}
									ZIndex={35}
								>
									<uistroke key={"UIStroke"} Thickness={px(2)} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.025, 0)}
										PaddingLeft={new UDim(0.05, 0)}
										PaddingRight={new UDim(0.05, 0)}
										PaddingTop={new UDim(0.025, 0)}
									/>
								</textlabel>

								<uistroke key={"UIStroke"} Thickness={px(3)} />

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>
						</imagelabel>
					</imagelabel>
				</frame>
			</frame>
		</frame>
	);
};
