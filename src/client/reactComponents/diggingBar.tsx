//!optimize 2
import React, { ReactNode, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, Lighting, Workspace, UserInputService, HapticService } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/gameConstants";
import { NetworkedTarget, PlayerDigInfo, Target } from "shared/networkTypes";

import { BASE_SHOVEL_STRENGTH, shovelConfig } from "shared/config/shovelConfig";
import { Signals } from "shared/signals";
import { ShovelController } from "client/controllers/shovelController";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { interval } from "shared/util/interval";
import { numberSerializer } from "shared/network";
import UiController from "client/controllers/uiController";
import { GamepassController } from "client/controllers/gamepassController";
import { redToGreen } from "shared/util/colorUtil";
import { usePx } from "client/hooks/usePx";

export interface DiggingBarProps {
	target?: Target;
	digInfo?: PlayerDigInfo;
	shovelController: ShovelController;
	gamepassController: GamepassController;
	uiController: UiController;

	visible: boolean;
}

const redScreen = new Instance("ColorCorrectionEffect");
redScreen.Name = "RedScreenEffect";
redScreen.TintColor = new Color3(1, 1, 1); // Will set to red when bar is low for red screen effect
redScreen.Enabled = true;
redScreen.Parent = Lighting;

const redTint = new Color3(1, 0.6, 0.6);
const whiteTint = new Color3(1, 1, 1);

const camera = Workspace.CurrentCamera;
const defaultFov = camera?.FieldOfView ?? 70;
const fovGoal = 83;

const DIG_REMINDER_TIMER = 3;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const replicateInterval = interval(1 / 10);
const digInterval = interval(gameConstants.DIG_TIME_SEC);
const frameInterval = interval(1 / 60);

const DIG_STAGES = [
	0.18, // Going higher than this, highlight 8, going lower, highlight 4
	0.37, // Going higher than this, highlight 12, going lower, highlight 8
	0.59, // Going higher than this, highlight 16, going lower, highlight 12
	0.81, // Going higher than this, highlight 20, going lower, highlight 16
];

const COLOR_TO_STAGE = [
	Color3.fromRGB(48, 68, 137),
	Color3.fromRGB(64, 86, 162),
	Color3.fromRGB(48, 68, 137),
	Color3.fromRGB(64, 86, 162),
	Color3.fromRGB(48, 68, 137),
];

interface Click {
	time: number;
	id: number;
}

const RED = new Color3(1, 0, 0);
const GREEN = new Color3(0, 1, 0);
const PROC_LERP_AMT = 0.5;
const CLICK_TIMER = 1;
const CPS_REQ = 3;

let clickId = 0;

export const DiggingBar = (props: Readonly<DiggingBarProps>): ReactNode => {
	const [barProgress, setBarProgress] = useMotion(1);
	const [rotation, setRotation] = useMotion(0);
	const [cycle, setCycle] = useState(0);
	const [fov, fovMotion] = useMotion(defaultFov);
	const [clientTarget, setClientTarget] = useState<NetworkedTarget | undefined>();
	const [digInfo, setDigInfo] = useState<PlayerDigInfo>();
	const [digStage, setDigStage] = useState(0);
	const [prevDigStage, setPrevDigStage] = useState(0);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.75, 0.5));
	const [recentClicks, setClicks] = useState<Click[]>([]);
	const [barColor, barColorSpring] = useMotion(Color3.fromRGB(255, 0, 0));

	const px = usePx();

	const progressRef = useRef(0);

	const [scale, setScale] = useMotion(1);

	const [warnStage, setWarnStage] = React.useState(0);
	const [visible, setVisible] = React.useState(false);

	const [dugYet, setHasDugYet] = useState(false);
	const [showReminder, setShowReminder] = useState(false);

	const [reminderVisibility, reminderMotion] = useMotion(1);

	const [stageSize, stageMotion] = useMotion(UDim2.fromScale(1, 1));
	const [stageColor, stageColorMotion] = useMotion(COLOR_TO_STAGE[0]);

	const warnStages = [{ 0.4: 1 }, { 0.25: 2 }, { 0.1: 3 }];

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.75, 0.41), springs.bubbly);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.75, 0.51));
		}

		let time = 0;
		const connection = RunService.Heartbeat.Connect((dt) => {
			if (!visible) {
				return;
			}
			time += dt;

			const value = math.sin(time * math.pi);
			setCycle(value);
		});

		props.uiController.setGuiEnabled(gameConstants.DIG_BAR_UI, visible);

		// Cleanup connection when component unmounts
		return () => connection.Disconnect();
	}, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (visible) {
			if (!clientTarget || !digInfo) {
				warn("DiggingBar requires a target and digInfo to be passed");
				return;
			}
			const shovelCfg = shovelConfig[digInfo.shovel];
			const owns2x = props.gamepassController.getOwnsGamepass("x2Strength");
			const increment =
				digInfo.strength * gameConstants.STRENGTH_MODIFIER +
				shovelCfg.strengthMult * BASE_SHOVEL_STRENGTH * (owns2x ? 2 : 1);
			let lastReplicatedProgress = 0;
			let finished = false;
			setHasDugYet(false);

			// Create mock data for the target
			progressRef.current = clientTarget.digProgress;
			let spawnedTask: thread | undefined = undefined;

			const clickConnection = Signals.gotDigInput.Connect(() => {
				if (!props.shovelController.canStartDigging) return;
				setShowReminder(false);
				setHasDugYet(true);
				setClicks((prev) => [...prev, { time: tick(), id: clickId++ }]);
				const activeGamepad =
					UserInputService.GetLastInputType() === Enum.UserInputType.Gamepad1
						? Enum.UserInputType.Gamepad1
						: Enum.UserInputType.Gamepad2;

				if (HapticService.IsVibrationSupported(activeGamepad)) {
					HapticService.SetMotor(activeGamepad, Enum.VibrationMotor.Small, 1);
					task.delay(0.1, () => {
						HapticService.SetMotor(activeGamepad, Enum.VibrationMotor.Small, 0);
					});
				}

				// Since the server is rate limited by this same timer, we should
				// ratelimit on the client too incase they are autoclicking
				// way faster than the dig_time and cause the bar to go out of sync
				if (digInterval()) {
					progressRef.current += increment;
				}

				setRotation.spring(math.clamp(rotation.getValue() + math.random(-2, 2), -12, 12), springs.responsive);
				setScale.spring(math.max(scale.getValue() + math.random(0.01, 0.05), 1.1), springs.responsive);

				// Allow springs to compound.
				if (spawnedTask) {
					task.cancel(spawnedTask);
					spawnedTask = undefined;
				}

				spawnedTask = task.delay(0.1, () => {
					setScale.spring(1, springs.responsive);
					setRotation.spring(0, springs.responsive);
				});
			});

			const autoDigConnection = Signals.autoDig.Connect(() => {
				if (digInterval()) {
					progressRef.current += increment;
				}
				setHasDugYet(true);
				setShowReminder(false);

				setClicks((prev) => [...prev, { time: tick(), id: clickId++ }]);

				setRotation.spring(math.clamp(rotation.getValue() + math.random(-2, 2), -12, 12), springs.responsive);
				setScale.spring(math.max(scale.getValue() + math.random(0.01, 0.05), 1.1), springs.responsive);

				// Allow springs to compound.
				if (spawnedTask) {
					task.cancel(spawnedTask);
					spawnedTask = undefined;
				}

				spawnedTask = task.delay(0.1, () => {
					setScale.spring(1, springs.responsive);
					setRotation.spring(0, springs.responsive);
				});
			});

			const hb = RunService.Heartbeat.Connect((dt) => {
				if (!clientTarget) return;
				setBarProgress.spring(
					math.clamp((clientTarget.maxProgress - progressRef.current) / clientTarget.maxProgress, 0, 1),
					springs.responsive,
				);

				setWarnStage(0);

				warnStages.forEach((stage) => {
					for (const [threshold, newStage] of pairs(stage)) {
						if (!clientTarget) return;
						if (progressRef.current / clientTarget.maxProgress <= threshold) {
							setWarnStage(newStage);
						}
					}
				});

				const progressRatio = progressRef.current / clientTarget.maxProgress;
				const firstWarningThreshold = 0.25;
				if (progressRatio <= firstWarningThreshold) {
					redScreen.TintColor = whiteTint.Lerp(redTint, 1 - progressRatio / firstWarningThreshold);
				} else {
					redScreen.TintColor = whiteTint;
				}

				Signals.updateDiggingProgress.Fire(progressRef.current, clientTarget.maxProgress);

				if (progressRef.current <= 0) {
					clickConnection?.Disconnect();
					Events.endDiggingClient();
					hb?.Disconnect();
					return;
				}

				// Make bar decrease over time
				if (frameInterval() && progressRef.current > 0 && progressRef.current < clientTarget.maxProgress) {
					const DECREASE_RATE = gameConstants.BAR_DECREASE_RATE;
					progressRef.current = progressRef.current - clientTarget.maxProgress * DECREASE_RATE * dt;

					if (replicateInterval() && progressRef.current > lastReplicatedProgress) {
						const serialized = numberSerializer.serialize(progressRef.current).buffer;
						Events.replicateDigProgress(serialized);
						lastReplicatedProgress = progressRef.current;
					}
				}
				if (!finished && progressRef.current >= clientTarget.maxProgress) {
					finished = true;
					Events.finishedDigging();
					hb?.Disconnect();
				}
				progressRef.current = math.clamp(progressRef.current, 0, clientTarget.maxProgress);
			});

			const endDiggingConnection = Events.endDiggingServer.connect(() => {
				fovMotion.spring(defaultFov, springs.default);
				redScreen.TintColor = whiteTint;

				clickConnection?.Disconnect();
				autoDigConnection?.Disconnect();
				hb?.Disconnect();
			});

			const endDiggingSignalConnection = Signals.endDigging.Connect(() => {
				fovMotion.spring(defaultFov, springs.default);

				redScreen.TintColor = whiteTint;

				clickConnection?.Disconnect();
				autoDigConnection?.Disconnect();
				hb?.Disconnect();
			});

			return () => {
				endDiggingConnection.Disconnect();
				autoDigConnection.Disconnect();
				endDiggingSignalConnection.Disconnect();
				hb.Disconnect();
				clickConnection.Disconnect();
			};
		} else {
			setBarProgress.immediate(1);
			fovMotion.spring(defaultFov, springs.wobble2);
			setClientTarget(undefined);
			setDigInfo(undefined);
			setHasDugYet(false);
			setShowReminder(false);
			setDigStage(0);
			setPrevDigStage(0);
		}
	}, [visible, clientTarget, digInfo]);

	useEffect(() => {
		if (!visible) {
			return;
		}
		fovMotion.spring(lerp(fovGoal, defaultFov, barProgress.getValue() / 1), springs.default);

		const progress = barProgress.getValue();
		let currentStage = 0;

		for (let i = DIG_STAGES.size() - 1; i >= 0; i--) {
			if (progress > DIG_STAGES[i]) {
				currentStage = i + 1;
				break;
			}
		}

		setDigStage(currentStage);
	}, [barProgress.getValue(), visible]);

	useEffect(() => {
		if (visible && !dugYet) {
			let running = true;
			const beganDigging = tick();

			task.spawn(() => {
				while (running) {
					if (tick() - beganDigging > DIG_REMINDER_TIMER) {
						setShowReminder(true);
						break;
					}
					task.wait();
				}
			});

			const inputConnection = UserInputService.InputBegan.Connect((input) => {
				if (input.UserInputType === Enum.UserInputType.MouseButton1) {
					setShowReminder(false);
					setHasDugYet(true);
					running = false;
				}
			});

			return () => {
				running = false;
				inputConnection.Disconnect();
				setShowReminder(false);
			};
		}
	}, [dugYet, visible]);

	useEffect(() => {
		if (showReminder) {
			reminderMotion.spring(0, springs.default);
		} else {
			reminderMotion.immediate(1);
		}
	}, [showReminder]);

	useEffect(() => {
		fovMotion.onStep((value) => {
			const myCamera = camera ?? Workspace.CurrentCamera;
			if (!myCamera) return;
			myCamera.FieldOfView = value;
		});

		Events.beginDigging.connect((target: NetworkedTarget, digInfo: PlayerDigInfo) => {
			setClientTarget(target);
			setDigInfo(digInfo);
			setVisible(true);
		});

		Events.endDiggingServer.connect(() => {
			setVisible(false);
		});
	}, []);

	useEffect(() => {
		const con = RunService.RenderStepped.Connect(() => {
			for (const click of recentClicks) {
				if (tick() - click.time > CLICK_TIMER) {
					setClicks((prev) => prev.filter((click2) => click2.id !== click.id));
				}
			}
		});

		barColorSpring.spring(redToGreen(recentClicks.size() / CPS_REQ), springs.default);

		return () => {
			con.Disconnect();
		};
	}, [recentClicks]);

	useEffect(() => {
		if (!visible) return;

		const stageColor = COLOR_TO_STAGE[prevDigStage];

		stageMotion.immediate(UDim2.fromScale(1, 1));
		stageColorMotion.immediate(stageColor);
		stageMotion.spring(UDim2.fromScale(1.2, 1.2), springs.bubbly);
		stageColorMotion.spring(stageColor.Lerp(digStage > prevDigStage ? RED : GREEN, PROC_LERP_AMT), springs.bubbly);

		const unsub = stageMotion.onComplete(() => {
			stageMotion.spring(UDim2.fromScale(1, 1));
			stageColorMotion.spring(stageColor, springs.bubbly);
		});

		setPrevDigStage(digStage);
		return () => {
			unsub();
		};
	}, [digStage, visible]);

	const platform = getPlayerPlatform();

	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} Visible={visible}>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				key={"Digging Progress Bar Frame"}
				Size={scale.map((s) => UDim2.fromScale(0.3 * s, 0.5 * s))}
				Visible={visible}
				Position={popInPos}
				Rotation={rotation.map((r) => math.clamp(math.max(1, r) * (cycle * 4), -8, 8))}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://131382351827899"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
				/>
				<folder key={"Bars"}>
					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.692078114, 0.633055806)}
						BackgroundTransparency={1}
						Image={"rbxassetid://99229586290044"}
						ImageColor3={digStage === 3 ? stageColor : Color3.fromRGB(48, 68, 137)}
						key={"16"}
						Position={UDim2.fromScale(0.692078, 0.633056)}
						Size={digStage === 3 ? stageSize : UDim2.fromScale(1.03, 1.03)}
						ZIndex={digStage === 3 ? 10 : 1}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.633056)}
							Size={UDim2.fromScale(0.384156, 0.085)}
							Text={"16 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={4}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.0883, 0)}
								PaddingRight={new UDim(0.0883, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.67500025, 0.459999919)}
						BackgroundTransparency={1}
						Image={"rbxassetid://126856902854073"}
						ImageColor3={digStage === 2 ? stageColor : Color3.fromRGB(64, 86, 162)}
						key={"12"}
						Position={UDim2.fromScale(0.675, 0.46)}
						Size={digStage === 2 ? stageSize : UDim2.fromScale(1.03, 1.03)}
						ZIndex={digStage === 2 ? 10 : 1}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.46)}
							Size={UDim2.fromScale(0.35, 0.085)}
							Text={"12 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={4}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.0952, 0)}
								PaddingRight={new UDim(0.0952, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.665000021, 0.279999942)}
						BackgroundTransparency={1}
						Image={"rbxassetid://140382903871140"}
						ImageColor3={digStage === 1 ? stageColor : Color3.fromRGB(48, 68, 137)}
						key={"8"}
						Position={UDim2.fromScale(0.665, 0.28)}
						Size={digStage === 1 ? stageSize : UDim2.fromScale(1.03, 1.03)}
						ZIndex={digStage === 1 ? 10 : 1}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.28)}
							Size={UDim2.fromScale(0.33, 0.085)}
							Text={"8 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={4}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.15, 0)}
								PaddingRight={new UDim(0.15, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.712000728, 0.832972407)}
						BackgroundTransparency={1}
						Image={"rbxassetid://121836677630694"}
						ImageColor3={digStage === 4 ? stageColor : Color3.fromRGB(64, 86, 162)}
						key={"20"}
						Position={UDim2.fromScale(0.712001, 0.832972)}
						Size={digStage === 4 ? stageSize : UDim2.fromScale(1.03, 1.03)}
						ZIndex={digStage === 4 ? 10 : 1}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.832972)}
							Size={UDim2.fromScale(0.424001, 0.085)}
							Text={"20 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={4}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.054, 0)}
								PaddingRight={new UDim(0.054, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.644309998, 0.109999977)}
						BackgroundTransparency={1}
						Image={"rbxassetid://81833790422645"}
						ImageColor3={digStage === 0 ? stageColor : Color3.fromRGB(64, 86, 162)}
						key={"4"}
						Position={UDim2.fromScale(0.64431, 0.11)}
						Size={digStage === 0 ? stageSize : UDim2.fromScale(1.03, 1.03)}
						ZIndex={digStage === 0 ? 10 : 1}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.11)}
							Size={UDim2.fromScale(0.288619, 0.085)}
							Text={"4 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={4}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.157, 0)}
								PaddingRight={new UDim(0.157, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>
					</imagelabel>
				</folder>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.61} />
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Progress Marker Frame"}
					Position={UDim2.fromScale(0.2, 0.0781)}
					Size={UDim2.fromScale(0.298, 0.809)}
					ZIndex={10}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://74432683218728"}
						key={"Marker"}
						Position={barProgress.map((p) => UDim2.fromScale(0.5, p))}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1)}
					>
						<frame
							AnchorPoint={new Vector2(0.5, 1)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Shovel Marker"}
							Position={barProgress.map((p) => UDim2.fromScale(-0.5 - p, 1))}
							Size={UDim2.fromScale(1, 1)}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								SortOrder={Enum.SortOrder.LayoutOrder}
								VerticalAlignment={Enum.VerticalAlignment.Center}
							/>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://90210450208885"}
								key={"Shovel Icon"}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.63, 0.798)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://75994909740048"}
								key={"Marker Icon"}
								Position={UDim2.fromScale(0.63, 0.196)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.37, 0.469)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</frame>
					</imagelabel>
				</frame>

				<frame
					BackgroundTransparency={1}
					key={"Title"}
					Position={UDim2.fromScale(0.102245, -0.102229)}
					Size={UDim2.fromScale(0.703086, 0.0800461)}
					ZIndex={10}
					Visible={true}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						TextTransparency={0}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={1}
						key={"Title"}
						Position={UDim2.fromScale(0.768435, 0.506021)}
						Size={UDim2.fromScale(1.12169, 0.961364)}
						Text={`${
							platform === "PC"
								? "Click"
								: platform === "Mobile"
								? "Tap"
								: platform === "Console"
								? "L2/R2"
								: "Tap"
						} to Dig!`}
						TextColor3={new Color3(1, 1, 1)}
						// TextScaled={true}
						TextSize={px(25)}
						TextXAlignment={Enum.TextXAlignment.Left}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} Transparency={0} />
					</textlabel>
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Progress Bar Frame"}
					Position={UDim2.fromScale(0.229, 0.482)}
					Size={UDim2.fromScale(0.277, 0.826)}
					ZIndex={2}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://95707056401845"}
						key={"Filled Progress Bar"}
						ImageColor3={barColor}
						Position={UDim2.fromScale(0.522, 0.495)}
						Size={UDim2.fromScale(1, 1.01)}
					>
						<uigradient
							key={"UIGradient"}
							Offset={barProgress.map((p) => {
								return new Vector2(0.98, p);
							})}
							Rotation={90}
							Transparency={
								new NumberSequence([
									new NumberSequenceKeypoint(0, 1),
									new NumberSequenceKeypoint(0.00125, 0),
									new NumberSequenceKeypoint(1, 0),
								])
							}
						/>
					</imagelabel>
				</frame>
				<uiscale key={"UIScale"} />
				<folder key={"Bars2"}>
					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.692078114, 0.633055806)}
						BackgroundTransparency={1}
						Image={"rbxassetid://133323928788153"}
						ImageColor3={digStage === 3 ? stageColor : Color3.fromRGB(48, 68, 137)}
						ImageTransparency={1}
						key={"16"}
						Position={UDim2.fromScale(0.692078, 0.633056)}
						Rotation={-0.002105}
						Size={digStage === 3 ? stageSize : UDim2.fromScale(1, 1)}
						ZIndex={digStage === 3 ? 15 : 5}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.633056)}
							Size={UDim2.fromScale(0.384156, 0.085)}
							Text={"16 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={6}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.0883, 0)}
								PaddingRight={new UDim(0.0883, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>

						<uiscale key={"UIScale"} Scale={1.1} />
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.67500025, 0.459999919)}
						BackgroundTransparency={1}
						Image={"rbxassetid://95711239284393"}
						ImageColor3={digStage === 2 ? stageColor : Color3.fromRGB(166, 188, 255)}
						ImageTransparency={1}
						key={"12"}
						Position={UDim2.fromScale(0.675, 0.46)}
						Size={digStage === 2 ? stageSize : UDim2.fromScale(1, 1)}
						ZIndex={digStage === 2 ? 15 : 5}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.46)}
							Size={UDim2.fromScale(0.35, 0.085)}
							Text={"12 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={6}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.0952, 0)}
								PaddingRight={new UDim(0.0952, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>

						<uiscale key={"UIScale"} Scale={1.1} />
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.665000021, 0.279999942)}
						BackgroundTransparency={1}
						Image={"rbxassetid://76687140716470"}
						ImageColor3={digStage === 1 ? stageColor : Color3.fromRGB(48, 68, 137)}
						ImageTransparency={1}
						key={"8"}
						Position={UDim2.fromScale(0.665, 0.28)}
						Size={digStage === 1 ? stageSize : UDim2.fromScale(1, 1)}
						ZIndex={digStage === 1 ? 15 : 5}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.28)}
							Size={UDim2.fromScale(0.33, 0.085)}
							Text={"8 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={6}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.15, 0)}
								PaddingRight={new UDim(0.15, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>

						<uiscale key={"UIScale"} Scale={1.1} />
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.712000728, 0.832972407)}
						BackgroundTransparency={1}
						Image={"rbxassetid://114830222118525"}
						ImageColor3={digStage === 4 ? stageColor : Color3.fromRGB(64, 86, 162)}
						ImageTransparency={1}
						key={"20"}
						Position={UDim2.fromScale(0.712001, 0.832972)}
						Rotation={-0.0016744}
						Size={digStage === 4 ? stageSize : UDim2.fromScale(1, 1)}
						ZIndex={digStage === 4 ? 15 : 5}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.832972)}
							Size={UDim2.fromScale(0.424001, 0.085)}
							Text={"20 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={6}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.054, 0)}
								PaddingRight={new UDim(0.054, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>

						<uiscale key={"UIScale"} Scale={1.1} />
					</imagelabel>

					<imagelabel
						Active={false}
						AnchorPoint={new Vector2(0.644309998, 0.109999977)}
						BackgroundTransparency={1}
						Image={"rbxassetid://91647746850914"}
						ImageColor3={digStage === 0 ? stageColor : Color3.fromRGB(115, 137, 213)}
						ImageTransparency={1}
						key={"4"}
						Position={UDim2.fromScale(0.64431, 0.11)}
						Size={digStage === 0 ? stageSize : UDim2.fromScale(1, 1)}
						ZIndex={digStage === 0 ? 15 : 5}
					>
						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Number"}
							Position={UDim2.fromScale(0.5, 0.11)}
							Size={UDim2.fromScale(0.288619, 0.085)}
							Text={"4 FT"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={6}
						>
							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uipadding
								key={"UIPadding"}
								PaddingBottom={new UDim(0.000288, 0)}
								PaddingLeft={new UDim(0.157, 0)}
								PaddingRight={new UDim(0.157, 0)}
								PaddingTop={new UDim(0.000288, 0)}
							/>
						</textlabel>

						<uiscale key={"UIScale"} Scale={1.1} />
					</imagelabel>
				</folder>
			</frame>

			<frame
				key={"Frame"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Position={UDim2.fromScale(0.5, 0.75)}
				Size={UDim2.fromScale(0.233, 0.076)}
				Visible={false}
			>
				<textlabel
					key={"TextLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={
						new Font(
							"rbxasset://fonts/families/FredokaOne.json",
							Enum.FontWeight.Bold,
							Enum.FontStyle.Normal,
						)
					}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(0.85, 0.85)}
					Text={`${platform === "Mobile" ? "Tap" : platform === "Console" ? "L2/R2" : "Click"} to dig!`}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					TextTransparency={reminderVisibility}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Thickness={px(3.4)} Transparency={reminderVisibility} />
				</textlabel>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"Claim"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Transparency={reminderVisibility}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, new Color3(0.459, 0.459, 0.459)),
								new ColorSequenceKeypoint(1, new Color3(0.459, 0.459, 0.459)),
							])
						}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 1),
								new NumberSequenceKeypoint(0.501, 0.494),
								new NumberSequenceKeypoint(1, 1),
							])
						}
					/>

					<uistroke
						key={"UIStroke"}
						Color={new Color3(1, 1, 1)}
						Thickness={px(3)}
						Transparency={reminderVisibility}
					>
						<uigradient
							key={"UIGradient"}
							Transparency={
								new NumberSequence([
									new NumberSequenceKeypoint(0, 1),
									new NumberSequenceKeypoint(0.0362, 1),
									new NumberSequenceKeypoint(0.5, 0),
									new NumberSequenceKeypoint(0.951, 1),
									new NumberSequenceKeypoint(1, 1),
								])
							}
						/>
					</uistroke>
				</frame>
			</frame>
		</frame>
	);
};
