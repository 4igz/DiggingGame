import React, { useEffect, useState } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Events } from "client/network";

const DistanceLabel = () => {
	const [visible, setVisible] = useState(false);
	const [distance, setDistance] = useState(0);
	const [pos, setPos] = useState(new Vector3(0, 0, 0));

	useEffect(() => {
		const trove = new Trove();

		trove.add(
			Events.targetSpawnSuccess.connect((pos: Vector3) => {
				setPos(pos);
				setVisible(true);
			}),
		);

		trove.add(
			Events.targetDespawned.connect(() => {
				setVisible(false);
			}),
		);

		trove.add(
			RunService.RenderStepped.Connect(() => {
				if (visible) {
					const player = Players.LocalPlayer;
					const character = player.Character;
					if (!character) return;

					setDistance(pos.sub(character.GetPivot().Position).Magnitude);
				}
			}),
		);

		return () => trove.destroy();
	}, [pos, visible]);

	return (
		<textlabel
			Size={UDim2.fromScale(0.2, 0.1)}
			Position={new UDim2(0.5, 0, 0.1, 0)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Text={`Distance: ${math.floor(distance)} studs`}
			TextScaled={true}
			Font={Enum.Font.SourceSansBold}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			Visible={visible}
		>
			<uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
		</textlabel>
	);
};

export default DistanceLabel;
