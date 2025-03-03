import React, { useEffect, useState } from "@rbxts/react";
import { GuiService, UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { ShovelController } from "client/controllers/shovelController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";

interface ClickEffectProps {
	position: UDim2;
	onComplete: () => void;
}

const ClickEffect = (props: ClickEffectProps) => {
	const [scale, setScale] = useMotion(0.5);
	const [transparency, setTransparency] = useMotion(0);
	const [position, setPosition] = useState(props.position);

	useEffect(() => {
		setScale.spring(1.2, springs.responsive);
		setTransparency.spring(1, springs.responsive);

		setTransparency.onComplete(props.onComplete);

		if (props.position !== position) {
			setPosition(props.position);
		}
	}, [props.position]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BorderSizePixel={0}
			Size={UDim2.fromScale(0.065, 0.107)}
			Position={position}
			BackgroundTransparency={transparency}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		>
			<uiscale Scale={scale} />
			<uicorner CornerRadius={new UDim(1, 0)} />
			<uiaspectratioconstraint AspectRatio={1} />
		</frame>
	);
};

interface ContainerProps {
	shovelController: ShovelController;
}

export const ClickEffectContainer = (props: ContainerProps) => {
	const [platform, setPlatform] = useState(getPlayerPlatform());
	const [clicks, setClicks] = useState<{ pos: Vector2; key: number }[]>([]);

	useEffect(() => {
		const connection = UserInputService.LastInputTypeChanged.Connect(() => {
			setPlatform(getPlayerPlatform());
		});

		return () => {
			connection.Disconnect();
		};
	}, []);

	useEffect(() => {
		const trove = new Trove();

		trove.add(
			UserInputService.InputBegan.Connect((input, _gameProcessed) => {
				if (!props.shovelController.diggingActive) return;
				if (
					input.UserInputType === Enum.UserInputType.MouseButton1 ||
					input.KeyCode === Enum.KeyCode.ButtonR2 ||
					input.KeyCode === Enum.KeyCode.ButtonL2
				) {
					setClicks((prev) => {
						return [...prev, { pos: UserInputService.GetMouseLocation(), key: tick() }];
					});
				}
			}),
		);

		if (platform === "Mobile") {
			const TAP_THRESHOLD = 0.2;
			const touchStartTimes: Map<InputObject, number> = new Map();

			trove.add(
				UserInputService.InputBegan.Connect((input, _gameProcessed) => {
					if (!props.shovelController.diggingActive) return;

					if (input.UserInputType === Enum.UserInputType.Touch) {
						touchStartTimes.set(input, tick());
					}
				}),
			);

			trove.add(
				UserInputService.InputEnded.Connect((input, _gameProcessed) => {
					if (!props.shovelController.diggingActive) return;

					if (input.UserInputType === Enum.UserInputType.Touch) {
						const beginTouchTime = touchStartTimes.get(input);
						if (!beginTouchTime) {
							return;
						}
						touchStartTimes.delete(input);
						if (tick() - beginTouchTime < TAP_THRESHOLD) {
							const pos = input.Position;
							const newPos = new Vector2(pos.X, pos.Y).add(GuiService.GetGuiInset()[0]);
							setClicks((prev) => {
								return [...prev, { pos: newPos, key: tick() }];
							});
						}
					}
				}),
			);
		}

		return () => {
			trove.destroy();
		};
	}, [platform]);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			{clicks.map((clickInfo) => {
				return (
					<ClickEffect
						key={clickInfo.key}
						position={new UDim2(0, clickInfo.pos.X, 0, clickInfo.pos.Y)}
						onComplete={() => {
							setClicks((prev) => {
								return prev.filter((click) => click.key !== clickInfo.key);
							});
						}}
					/>
				);
			})}
		</frame>
	);
};
