import React, { ReactNode, useEffect, useState } from "@rbxts/react";
import { RunService, UserInputService } from "@rbxts/services";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import { gameConstants } from "shared/constants";
import { PlayerDigInfo, Target } from "shared/networkTypes";
import { Lighting } from "@rbxts/services";

import { BASE_SHOVEL_STRENGTH, shovelConfig } from "shared/config/shovelConfig";
import { Signals } from "shared/signals";

export interface DiggingBarProps {
	target?: Target;
	digInfo?: PlayerDigInfo;

	visible: boolean;
}

const redScreen = new Instance("ColorCorrectionEffect");
redScreen.Name = "RedScreenEffect";
redScreen.TintColor = new Color3(1, 1, 1); // Will set to red when bar is low for red screen effect
redScreen.Enabled = true;
redScreen.Parent = Lighting;

const redTint = new Color3(1, 0.6, 0.6);
const whiteTint = new Color3(1, 1, 1);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (color1: Color3, color2: Color3, t: number) => {
	return new Color3(lerp(color1.R, color2.R, t), lerp(color1.G, color2.G, t), lerp(color1.B, color2.B, t));
};

export const DiggingBar = (props: Readonly<DiggingBarProps>): ReactNode => {
	const [barProgress, setBarProgress] = useMotion(UDim2.fromScale(1, 0.5));
	const [rotation, setRotation] = useMotion(0);
	const [cycle, setCycle] = useState(0);

	const [scale, setScale] = useMotion(1);

	const [warnStage, setWarnStage] = React.useState(0);
	const [visible, setVisible] = React.useState(false);

	const warnStages = [{ 0.4: 1 }, { 0.25: 2 }, { 0.1: 3 }];

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
			let hb: RBXScriptConnection | undefined = undefined;
			let clickConnection: RBXScriptConnection | undefined = undefined;

			// Create mock data for the target
			let progress = target.digProgress;
			let lastDigTime = tick();
			let spawnedTask: thread | undefined = undefined;

			clickConnection = UserInputService.InputBegan.Connect((input) => {
				if (input.UserInputType === Enum.UserInputType.MouseButton1) {
					Events.dig();

					// Since the server is rate limited by this same timer, we should
					// ratelimit on the client too incase they are autoclicking
					// way faster than the dig_time and cause the bar to go out of sync
					if (tick() - lastDigTime >= gameConstants.DIG_TIME_SEC) {
						progress += increment;
						lastDigTime = tick();
						// Signals.dig.Fire();
					}

					setRotation.spring(
						math.clamp(rotation.getValue() + math.random(-2, 2), -12, 12),
						springs.responsive,
					);
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
				}
			});

			hb = RunService.Heartbeat.Connect(() => {
				setBarProgress.spring(
					UDim2.fromScale(1, math.min(progress, target.maxProgress) / target.maxProgress),
					springs.responsive,
				);

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
					redScreen.TintColor = lerpColor(whiteTint, redTint, 1 - progressRatio / firstWarningThreshold);
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
				const DECREASE_RATE = 0.0005;
				progress = progress - target.maxProgress * DECREASE_RATE;
				progress = math.clamp(progress, 0, target.maxProgress);
			});

			const endDiggingConnection = Events.endDiggingServer.connect(() => {
				redScreen.TintColor = whiteTint;

				clickConnection?.Disconnect();
				hb?.Disconnect();
			});

			return () => {
				endDiggingConnection.Disconnect();
				hb?.Disconnect();
				clickConnection?.Disconnect();
			};
		} else {
			setBarProgress.immediate(UDim2.fromScale(1, 0));
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Bar"}
			Position={UDim2.fromScale(0.75, 0.5)}
			Rotation={rotation.map((r) => math.clamp(math.max(1, r) * (cycle * 4), -8, 8))}
			Size={scale.map((s) => UDim2.fromScale(0.04 * s, 0.65 * s))}
			Visible={visible}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

			<uistroke key={"UIStroke"} Thickness={3} Transparency={0.4} />

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Ruler"}
				Position={UDim2.fromScale(1.07, 0)}
				Size={UDim2.fromScale(3.16, 1)}
				ZIndex={0}
			>
				<uilistlayout
					key={"UIListLayout"}
					Padding={new UDim(0.15, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={1}
					key={"Increment"}
					Size={UDim2.fromScale(0.159, 0.008)}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
						key={"Amount"}
						Position={UDim2.fromScale(1.72, -4.27)}
						Size={UDim2.fromScale(3.04, 9.51)}
						Text={"4ft"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={2}
					key={"Increment"}
					Size={UDim2.fromScale(0.159, 0.008)}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
						key={"Amount"}
						Position={UDim2.fromScale(1.72, -4.27)}
						Size={UDim2.fromScale(3.04, 9.51)}
						Text={"8ft"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={3}
					key={"Increment"}
					Size={UDim2.fromScale(0.159, 0.008)}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
						key={"Amount"}
						Position={UDim2.fromScale(1.72, -4.27)}
						Size={UDim2.fromScale(3.04, 9.51)}
						Text={"12ft"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={4}
					key={"Increment"}
					Size={UDim2.fromScale(0.159, 0.008)}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
						key={"Amount"}
						Position={UDim2.fromScale(1.72, -4.27)}
						Size={UDim2.fromScale(3.04, 9.51)}
						Text={"16ft"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					LayoutOrder={5}
					key={"Increment"}
					Size={UDim2.fromScale(0.159, 0.008)}
				>
					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxasset://fonts/families/ComicNeueAngular.json")}
						key={"Amount"}
						Position={UDim2.fromScale(1.72, -4.27)}
						Size={UDim2.fromScale(3.04, 9.51)}
						Text={"20ft"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</frame>
			</frame>

			<textlabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font(
						"rbxasset://fonts/families/HighwayGothic.json",
						Enum.FontWeight.Bold,
						Enum.FontStyle.Normal,
					)
				}
				key={"Exclaim"}
				Position={UDim2.fromScale(-1.64, 0.811)}
				Size={UDim2.fromScale(0.886, 0.1)}
				Text={"!".rep(warnStage)}
				TextColor3={Color3.fromRGB(255, 0, 0)}
				TextScaled={true}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Right}
			>
				<uistroke key={"UIStroke"} Thickness={3} />
			</textlabel>

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(181, 123, 52)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(147, 98, 42)),
					])
				}
				Rotation={90}
			/>

			<canvasgroup
				key={"CanvasGroup"}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Size={UDim2.fromScale(1, 1)}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					ClipsDescendants={true}
					key={"Clipper"}
					Size={UDim2.fromScale(1, 1)}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 1)}
						BackgroundColor3={Color3.fromRGB(32, 216, 216)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"BarActual"}
						Position={UDim2.fromScale(0.5, 1)}
						Size={barProgress}
					/>
				</frame>

				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 8)} />
			</canvasgroup>

			<frame
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundColor3={Color3.fromRGB(243, 1, 52)}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Slider"}
				Position={barProgress.map((p) => UDim2.fromScale(0.5, 1 - p.Y.Scale))}
				Size={UDim2.fromScale(2.5, 0.2)}
				ZIndex={2}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

				<uistroke key={"UIStroke"} Thickness={3} Transparency={0.4} />

				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"http://www.roblox.com/asset/?id=126053753843429"}
					key={"ShovelIcon"}
					Position={UDim2.fromScale(-1.09, -1.92)}
					Rotation={45 - cycle * 45}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.816, 4.7)}
					SliceCenter={new Rect(0, 0, 512, 512)}
				/>

				<uisizeconstraint
					key={"UISizeConstraint"}
					MaxSize={new Vector2(75, 15)}
					MinSize={new Vector2(75, 15)}
				/>
			</frame>
		</frame>
	);
};
