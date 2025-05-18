import React, { useEffect, useState } from "@rbxts/react";
import { Players, UserInputService } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { Signals } from "shared/signals";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

export const HoldToDetectText = () => {
	const [platform, setPlatform] = useState(getPlayerPlatform());
	const [detectorEquipped, setEquipped] = useState(false);

	const px = usePx();

	useEffect(() => {
		const char = Players.LocalPlayer.Character;

		const tool = char?.FindFirstChildWhichIsA("Tool");
		if (tool && metalDetectorConfig[tool.Name]) {
			setEquipped(true);
		}

		const initialCheckTimer = task.delay(2, () => {
			setPlatform(getPlayerPlatform());
		});

		const inputChangedConnection = UserInputService.InputChanged.Connect(() => {
			setPlatform(getPlayerPlatform());
		});

		const detectorConnection = Signals.detectorEquipUpdate.Connect((equipped) => {
			setEquipped(equipped);
			setPlatform(getPlayerPlatform());

			task.delay(2, () => {
				setPlatform(getPlayerPlatform());
			});
		});

		// Cleanup
		return () => {
			task.cancel(initialCheckTimer);
			inputChangedConnection.Disconnect();
			detectorConnection.Disconnect();
		};
	}, []);

	useEffect(() => {
		task.delay(2, () => {
			setPlatform(getPlayerPlatform());
		});
	}, [detectorEquipped]);

	return (
		<frame
			key={"Frame"}
			BackgroundTransparency={1}
			Position={UDim2.fromScale(0.743, 0.92)}
			Size={UDim2.fromScale(0.105198, 0.05)}
			Visible={platform === "Mobile" && detectorEquipped}
		>
			<textlabel
				key={"TextLabel"}
				BackgroundTransparency={1}
				FontFace={
					new Font(
						"rbxasset://fonts/families/FredokaOne.json",
						Enum.FontWeight.Regular,
						Enum.FontStyle.Normal,
					)
				}
				Position={UDim2.fromScale(-0.0588235, 0)}
				Size={UDim2.fromScale(1.09698, 1)}
				Text={"Hold to Use"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
			>
				<uistroke key={"UIStroke"} Thickness={px(1)} />
			</textlabel>
		</frame>
	);
};
