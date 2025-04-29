import React, { useEffect, useState } from "@rbxts/react";
import { AnimatedButton } from "./buttons";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { Players, TweenService, UserInputService } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const updateLog = playerGui.WaitForChild(gameConstants.UPDATE_LOG_UI) as ScreenGui;
const containerFrame = updateLog.WaitForChild("Container") as Frame;

const closeFrame = containerFrame.WaitForChild("X") as Frame;
const closeButton = closeFrame.WaitForChild("Btn") as TextButton;

const tinfo = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.In);

interface UpdateLogButtonProps {
	uiController: UiController;
}

export const UpdateLogButton = (props: UpdateLogButtonProps) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const con1 = closeButton.MouseEnter.Connect(() => {
			TweenService.Create(closeFrame, tinfo, { Size: UDim2.fromScale(0.15, 0.25) }).Play();
		});

		const con2 = closeButton.MouseLeave.Connect(() => {
			TweenService.Create(closeFrame, tinfo, { Size: UDim2.fromScale(0.123, 0.194) }).Play();
		});

		const con3 = closeButton.MouseButton1Click.Connect(() => {
			updateLog.Enabled = false;
			TweenService.Create(containerFrame, new TweenInfo(0), {
				Position: UDim2.fromScale(0.5, 0.6),
			}).Play();
			TweenService.Create(closeFrame, tinfo, { Size: UDim2.fromScale(0.123, 0.194) }).Play();
			setVisible(false);
		});

		let inputCon: RBXScriptConnection;

		if (visible) {
			inputCon = UserInputService.InputBegan.Connect((input, gpe) => {
				if (gpe) return;
				if (input.KeyCode === Enum.KeyCode.ButtonB) {
					updateLog.Enabled = false;
					TweenService.Create(containerFrame, new TweenInfo(0), {
						Position: UDim2.fromScale(0.5, 0.6),
					}).Play();
					TweenService.Create(closeFrame, tinfo, { Size: UDim2.fromScale(0.123, 0.194) }).Play();
					setVisible(false);
				}
			});
		}

		return () => {
			con1.Disconnect();
			con2.Disconnect();
			con3.Disconnect();
			if (inputCon) {
				inputCon.Disconnect();
			}
		};
	}, [visible]);

	return (
		<AnimatedButton
			onClick={() => {
				if (!visible) {
					updateLog.Enabled = true;

					TweenService.Create(containerFrame, tinfo, { Position: UDim2.fromScale(0.5, 0.5) }).Play();
				} else {
					updateLog.Enabled = false;

					TweenService.Create(containerFrame, new TweenInfo(0), {
						Position: UDim2.fromScale(0.5, 0.6),
					}).Play();
				}

				setVisible(!visible);
			}}
			size={UDim2.fromScale(1, 1)}
		>
			<imagelabel
				Size={UDim2.fromScale(1, 1)}
				Image="rbxassetid://116318103434460"
				ScaleType={Enum.ScaleType.Fit}
				BackgroundTransparency={1}
			/>
			<uiaspectratioconstraint AspectRatio={1} />
		</AnimatedButton>
	);
};
