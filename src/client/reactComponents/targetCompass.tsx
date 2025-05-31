//!optimize 2
import React, { useEffect, useState } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { useMotion } from "client/hooks/useMotion";
import { usePx } from "client/hooks/usePx";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import { BASE_DETECTOR_STRENGTH } from "shared/config/metalDetectorConfig";

const DistanceLabel = () => {
	const [visible, setVisible] = useState(false);
	const [distance, setDistance] = useState(0);
	const [startDistance, setStartDistance] = useState(0);
	const [pos, setPos] = useState(new Vector3(0, 0, 0));
	const [barSize, setBarSize] = useMotion(UDim2.fromScale(0, 0.465));

	const px = usePx();

	useEffect(() => {
		const trove = new Trove();

		trove.add(
			Events.targetSpawnSuccess.connect((pos: Vector3) => {
				setPos(pos);
				setVisible(true);

				const player = Players.LocalPlayer;
				const character = player.Character;

				if (character && character.Parent) {
					setStartDistance(pos.sub(character.GetPivot().Position).Magnitude);
					setDistance(math.floor(pos.sub(character.GetPivot().Position).Magnitude));
				} else {
					setStartDistance(BASE_DETECTOR_STRENGTH);
				}
			}),
		);

		trove.add(
			Events.targetDespawned.connect(() => {
				setVisible(false);
				setBarSize.immediate(UDim2.fromScale(0, 0.465));
			}),
		);

		if (visible) {
			trove.add(
				RunService.RenderStepped.Connect(() => {
					if (visible) {
						const player = Players.LocalPlayer;
						const character = player.Character;
						if (!character) return;

						setDistance(math.floor(pos.sub(character.GetPivot().Position).Magnitude));
					}
				}),
			);
		}

		return () => trove.destroy();
	}, [pos, visible]);

	useEffect(() => {
		const barX = math.clamp((startDistance - distance) / math.max(1, startDistance), 0, 0.95);
		setBarSize.spring(UDim2.fromScale(barX, 0.465), springs.bubbly);
	}, [distance, startDistance]);

	useEffect(() => {
		Events.beginDigging.connect(() => {
			setVisible(false);
		});
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Metal Detector Frame"}
			Position={new UDim2(0.5, 0, 0, 15)}
			Size={UDim2.fromScale(0.585, 0.0867)}
			ZIndex={0}
			Visible={visible}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Meter"}
				Position={UDim2.fromScale(0.414, 0.5)}
				Size={UDim2.fromScale(0.829, 0.8)}
				ZIndex={5}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://119594294281634"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(255, 0, 4)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Meter"}
						Position={UDim2.fromScale(0.025, 0.194)}
						Size={barSize}
						ZIndex={1}
					>
						<frame
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Meter Progress"}
							Position={UDim2.fromScale(1, 0.5)}
							Size={UDim2.fromScale(0.2, 1.7)}
							ZIndex={1e3}
						>
							<uisizeconstraint
								key={"UISizeConstraint"}
								MinSize={new Vector2(px.floor(85), px.floor(85))}
								MaxSize={new Vector2(90, 90)}
							/>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://130443371048253"}
								key={"Background"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 1)}
								ZIndex={10}
							/>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://119544070088143"}
								key={"Metal Detector Icon"}
								Position={UDim2.fromScale(0.18, 0.125)}
								Size={UDim2.fromScale(0.64, 0.5)}
								ZIndex={10}
							/>

							<textlabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Meter Amount"}
								Position={UDim2.fromScale(0.163, 0.703)}
								Size={UDim2.fromScale(0.67, 0.18)}
								Text={`${math.floor(distance)}m`}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />

								<uipadding
									key={"UIPadding"}
									PaddingLeft={new UDim(0.209, 0)}
									PaddingRight={new UDim(0.209, 0)}
								/>
							</textlabel>
						</frame>
					</frame>
				</imagelabel>

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://137159884318805"}
					Interactable={false}
					key={"Lines"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={6}
				/>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Treasure Map Frame"}
				Position={UDim2.fromScale(0.731, -0.232)}
				Size={UDim2.fromScale(0.149, 1.45)}
			>
				<imagelabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://76806044140289"}
					key={"Icon"}
					Position={UDim2.fromScale(0.29, 0)}
					Size={UDim2.fromScale(1, 1)}
				/>
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={9.74} />
		</frame>
	);
};

export default DistanceLabel;
