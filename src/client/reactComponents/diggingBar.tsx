import React, { ReactNode, useEffect, useState } from "@rbxts/react";
import { RunService, UserInputService, Lighting, Workspace } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { PlayerDigInfo, Target } from "shared/networkTypes";

import { BASE_SHOVEL_STRENGTH, shovelConfig } from "shared/config/shovelConfig";
import { Signals } from "shared/signals";
import { ShovelController } from "client/controllers/shovelController";
import CameraShaker, { CameraShakeInstance } from "@rbxts/camera-shaker";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import Object from "@rbxts/object-utils";

export interface DiggingBarProps {
	target?: Target;
	digInfo?: PlayerDigInfo;
	shovelController: ShovelController;

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
const fovGoal = 50;

const progressBars = [
	{ threshold: 1, barName: "20" },
	{ threshold: 0.81, barName: "16" },
	{ threshold: 0.58, barName: "12" },
	{ threshold: 0.37, barName: "8" },
	{ threshold: 0.17, barName: "4" },
];

const originalBarColors: Record<string, Color3> = {
	["20"]: Color3.fromRGB(64, 86, 162), // match your existing bar color
	["16"]: Color3.fromRGB(48, 68, 137),
	["12"]: Color3.fromRGB(64, 86, 162),
	["8"]: Color3.fromRGB(48, 68, 137),
	["4"]: Color3.fromRGB(64, 86, 162),
};

const barImages: Record<string, string> = {
	["20"]: "rbxassetid://1148302221185259",
	["16"]: "rbxassetid://133323928788153",
	["12"]: "rbxassetid://95711239284393",
	["8"]: "rbxassetid://76687140716470",
	["4"]: "rbxassetid://91647746850914",
};

const barBackgroundImages: Record<string, string> = {
	["20"]: "rbxassetid://121836677630694",
	["16"]: "rbxassetid://99229586290044",
	["12"]: "rbxassetid://126856902854073",
	["8"]: "rbxassetid://140382903871140",
	["4"]: "rbxassetid://81833790422645",
};

const barPositions: Record<string, UDim2> = {
	["20"]: new UDim2(0.45, 0, 0.892, 0),
	["16"]: new UDim2(0.42, 0, 0.7, 0),
	["12"]: new UDim2(0.4, 0, 0.5, 0),
	["8"]: new UDim2(0.37, 0, 0.308, 0),
	["4"]: new UDim2(0.35, 0, 0.127, 0),
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const DiggingBar = (props: Readonly<DiggingBarProps>): ReactNode => {
	const [barProgress, setBarProgress] = useMotion(1);
	const [rotation, setRotation] = useMotion(0);
	const [cycle, setCycle] = useState(0);
	const [fov, fovMotion] = useMotion(defaultFov);

	const [scale, setScale] = useMotion(1);

	const [warnStage, setWarnStage] = React.useState(0);
	const [visible, setVisible] = React.useState(false);

	const warnStages = [{ 0.4: 1 }, { 0.25: 2 }, { 0.1: 3 }];

	const [currentBar, setCurrentBar] = useState<string | undefined>(undefined);

	const [previousBar, setPreviousBar] = useState<string | undefined>(undefined);

	const [barColorMotion, setBarColorMotion] = useMotion(new Color3());
	const [barSizeMotion, setBarSizeMotion] = useMotion(1);

	const RED = Color3.fromRGB(255, 0, 0);

	useEffect(() => {
		let time = 0;
		const connection = RunService.Heartbeat.Connect((dt) => {
			if (!visible) {
				return;
			}
			time += dt;

			const value = math.sin(time * math.pi);
			setCycle(value);
		});

		// Cleanup connection when component unmounts
		return () => connection.Disconnect();
	}, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (visible) {
			const target = props.target;
			const digInfo = props.digInfo;
			if (!target || !digInfo) {
				warn("DiggingBar requires a target and digInfo to be passed");
				return;
			}
			const cfg = shovelConfig[props.digInfo.shovel];
			const increment = props.digInfo.strength + cfg.strengthMult * BASE_SHOVEL_STRENGTH;

			// Create mock data for the target
			let progress = target.digProgress;
			let lastDigTime = tick();
			let spawnedTask: thread | undefined = undefined;

			const clickConnection = Signals.gotDigInput.Connect(() => {
				if (!props.shovelController.getCanStartDigging()) return;
				Events.dig();

				// Since the server is rate limited by this same timer, we should
				// ratelimit on the client too incase they are autoclicking
				// way faster than the dig_time and cause the bar to go out of sync
				if (tick() - lastDigTime >= gameConstants.DIG_TIME_SEC) {
					progress += increment;
					lastDigTime = tick();
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
				progress += increment;
				lastDigTime = tick();

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

			const hb = RunService.Heartbeat.Connect(() => {
				setBarProgress.spring((target.maxProgress - progress) / target.maxProgress, springs.responsive);

				setWarnStage(0);

				warnStages.forEach((stage) => {
					for (const [threshold, newStage] of pairs(stage)) {
						if (progress / target.maxProgress <= threshold) {
							setWarnStage(newStage);
						}
					}
				});

				const progressRatio = progress / target.maxProgress;
				const firstWarningThreshold = 0.4;
				if (progressRatio <= firstWarningThreshold) {
					redScreen.TintColor = whiteTint.Lerp(redTint, 1 - progressRatio / firstWarningThreshold);
				} else {
					redScreen.TintColor = whiteTint;
				}

				Signals.updateDiggingProgress.Fire(progress, target.maxProgress);

				if (progress <= 0) {
					clickConnection?.Disconnect();
					Events.endDiggingClient();
					hb?.Disconnect();
					return;
				}

				// Make bar decrease over time
				const DECREASE_RATE = gameConstants.BAR_DECREASE_RATE;
				progress = progress - target.maxProgress * DECREASE_RATE;
				progress = math.clamp(progress, 0, target.maxProgress);
			});

			const endDiggingConnection = Events.endDiggingServer.connect(() => {
				redScreen.TintColor = whiteTint;

				clickConnection?.Disconnect();
				autoDigConnection?.Disconnect();
				hb?.Disconnect();
			});

			const endDiggingSignalConnection = Signals.endDigging.Connect(() => {
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
			fovMotion.spring(defaultFov, springs.bubbly);
		}
	}, [visible]);

	useEffect(() => {
		const unsubProgress = setBarProgress.onStep((value) => {
			// Keep your existing FOV logic
			fovMotion.spring(lerp(fovGoal, defaultFov, value), springs.default);

			const alpha = value;

			let chosenBar: string | undefined;
			for (const data of progressBars) {
				if (alpha <= data.threshold) {
					chosenBar = data.barName;
				}
			}

			// If none matched (alpha >= all thresholds), pick the last bar in the array:
			if (!chosenBar) {
				chosenBar = progressBars[progressBars.size() - 1].barName;
				warn("No bar matched alpha", alpha);
			}

			// If we've changed bars, update state
			if (chosenBar !== currentBar) {
				setPreviousBar(currentBar);
				setCurrentBar(chosenBar);

				// Optional: animate newly activated bar
				print("Chosen:", chosenBar, " Prev:", previousBar);

				if (chosenBar && previousBar) {
					const newBarNum = tonumber(chosenBar);
					const oldBarNum = tonumber(previousBar);

					if (newBarNum !== undefined && oldBarNum !== undefined) {
						if (newBarNum > oldBarNum) {
							// "Going down" (e.g. from 16 ft => 12 ft), do a quick "pop"
							// or color highlight:
							setBarColorMotion.immediate(
								originalBarColors[currentBar ?? -1] ?? originalBarColors[chosenBar],
							);
							setBarColorMotion.spring(RED, springs.responsive);

							const complete = setBarColorMotion.onComplete(() => {
								setBarColorMotion.spring(originalBarColors[chosenBar], springs.responsive);
								complete();
							});

							setBarSizeMotion.spring(1.1, springs.bubbly);

							const complete2 = setBarSizeMotion.onComplete(() => {
								setBarSizeMotion.spring(1, springs.responsive);
								complete2();
							});
						} else {
							// "Going up" (e.g. from 8 ft => 12 ft),
							// do some other effect if you like
						}
					}
				}
			}
		});

		const unsubFov = fovMotion.onStep((value) => {
			camera!.FieldOfView = value;
		});

		return () => {
			unsubProgress();
			unsubFov();
		};
	}, [currentBar, previousBar]);

	const platform = getPlayerPlatform();

	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} Visible={visible}>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Digging Progress Bar Frame"}
				Position={UDim2.fromScale(0.75, 0.5)}
				Size={scale.map((s) => UDim2.fromScale(0.3 * s, 0.5 * s))}
				Visible={visible}
				Rotation={rotation.map((r) => math.clamp(math.max(1, r) * (cycle * 4), -8, 8))}
			>
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Progress Bar Frame"}
					Position={UDim2.fromScale(0.229, 0.482)}
					Size={UDim2.fromScale(0.277, 0.826)}
					ZIndex={10}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://71521093457489"}
						key={"Filled Progress Bar"}
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
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://131382351827899"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
				/>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Shovel Progress"}
					Position={UDim2.fromScale(-0.397, 0.0781)}
					Size={UDim2.fromScale(0.298, 0.809)}
					AnchorPoint={new Vector2(0.5, 0.5)}
				></frame>
				{/* Bars2 folder */}
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Ruler"}
					Position={UDim2.fromScale(0.45, 0)}
					Size={UDim2.fromScale(0.55, 0.919)}
				>
					{(["20", "16", "12", "8", "4"] as const).map((barName) => {
						const isActive = currentBar === barName;
						const barColor = originalBarColors[barName];
						return (
							<imagelabel
								key={barName}
								AnchorPoint={new Vector2(0.5, 0.5)}
								Position={barPositions[barName]}
								Size={UDim2.fromScale(0.548, 0.085)}
								BackgroundTransparency={1}
								ImageColor3={isActive ? barColorMotion : barColor}
								BackgroundColor3={isActive ? barColorMotion : barColor}
								Image={barImages[barName]}
								ImageTransparency={0}
								ZIndex={5}
							>
								<textlabel
									key="Number"
									AnchorPoint={new Vector2(0.5, 0.5)}
									Position={new UDim2(0.5, 0, 0.5, 0)}
									BackgroundTransparency={1}
									Font={Enum.Font.GothamBold}
									Text={`${barName} FT`}
									TextColor3={new Color3(1, 1, 1)}
									Size={UDim2.fromScale(1, 1)}
									TextScaled={true}
								>
									<uistroke Thickness={3} />
								</textlabel>
								<uiscale key="UIScale" Scale={isActive ? barSizeMotion : 1} />
							</imagelabel>
						);
					})}
				</frame>

				<folder key="Bars">
					{(["20", "16", "12", "8", "4"] as const).map((barName) => {
						const isActive = currentBar === barName;
						const barColor = originalBarColors[barName];
						const barImage = barBackgroundImages[barName];

						return (
							<imagelabel
								key={barName}
								AnchorPoint={new Vector2(0.5, 0.5)} // or your preference
								Position={new UDim2(0.5, 0, 0.5, 0)}
								Size={UDim2.fromScale(1, 1)} // matches your Bars2 example
								BackgroundTransparency={1}
								Image={barImage}
								ImageColor3={isActive ? barColorMotion : barColor}
								ZIndex={0}
							>
								{/* Scale effect when active */}
								<uiscale key="UIScale" Scale={isActive ? barSizeMotion : 1} />
							</imagelabel>
						);
					})}
				</folder>

				{/* <frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Ruler"}
					Position={UDim2.fromScale(0.45, 0)}
					Size={UDim2.fromScale(0.55, 0.919)}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"1st Increment"}
						Position={UDim2.fromScale(0.35, 0.127)}
						Size={UDim2.fromScale(0.548, 0.085)}
						Text={"4 FT"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.000288, 0)}
							PaddingLeft={new UDim(0.157, 0)}
							PaddingRight={new UDim(0.157, 0)}
							PaddingTop={new UDim(0.000288, 0)}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"2nd Increment"}
						Position={UDim2.fromScale(0.37, 0.308)}
						Size={UDim2.fromScale(0.548, 0.085)}
						Text={"8 FT"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.000288, 0)}
							PaddingLeft={new UDim(0.15, 0)}
							PaddingRight={new UDim(0.15, 0)}
							PaddingTop={new UDim(0.000288, 0)}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"3rd Increment"}
						Position={UDim2.fromScale(0.4, 0.5)}
						Size={UDim2.fromScale(0.548, 0.085)}
						Text={"12 FT"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.000288, 0)}
							PaddingLeft={new UDim(0.0952, 0)}
							PaddingRight={new UDim(0.0952, 0)}
							PaddingTop={new UDim(0.000288, 0)}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"4th  Increment"}
						Position={UDim2.fromScale(0.42, 0.7)}
						Size={UDim2.fromScale(0.548, 0.085)}
						Text={"16 FT"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.000288, 0)}
							PaddingLeft={new UDim(0.0883, 0)}
							PaddingRight={new UDim(0.0883, 0)}
							PaddingTop={new UDim(0.000288, 0)}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"5th  Increment"}
						Position={UDim2.fromScale(0.45, 0.892)}
						Size={UDim2.fromScale(0.548, 0.085)}
						Text={"20 FT"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={105}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.000288, 0)}
							PaddingLeft={new UDim(0.054, 0)}
							PaddingRight={new UDim(0.054, 0)}
							PaddingTop={new UDim(0.000288, 0)}
						/>
					</textlabel>
				</frame> */}
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
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.61} />
			</frame>

			<textlabel
				Text={`${platform === "Mobile" ? "Tap" : "Click"} to dig!`}
				Position={UDim2.fromScale(0.5, 0.78)}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Font={Enum.Font.BuilderSansBold}
				TextColor3={Color3.fromRGB(0, 120, 255)}
				Size={UDim2.fromScale(0.5, 0.05)}
				TextScaled={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
	);
};
