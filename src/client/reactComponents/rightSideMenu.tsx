import React, { createRef, useEffect, useRef, useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum, { IsInf, IsNaN } from "shared/util/eternityNum";
import { separateWithCommas } from "shared/util/nameUtil";
import { AnimatedButton } from "./mainUi";
import { UiController } from "client/controllers/uiController";
import { RunService, UserInputService } from "@rbxts/services";
import { gameConstants } from "shared/constants";
import { set } from "@rbxts/sift/out/Array";

interface MoneyVectorProps {
	offset: UDim2;
	size: UDim2;
	uiAnchor: Vector2;
	key: string;
	onComplete: (key: string) => void;
}

let variation = 0;
const random = new Random();
const MoneyVector = (props: MoneyVectorProps) => {
	variation += 1;
	variation = variation % 4;

	const vectorRef = createRef<ImageLabel>();
	const startVelocityX = useRef((random.NextNumber() / 2 + 0.5) * (variation - 2));
	const startTick = useRef(tick());
	const [position, setPosition] = useState(props.uiAnchor);
	const [velocity, setVelocity] = useState(
		new Vector2(startVelocityX.current, -2).Unit.mul(random.NextInteger(400, 600)),
	);
	const [rotation, setRotation] = useState(0);
	const [transparency, setTransparency] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const cashClone = vectorRef.current;
		if (!cashClone) {
			return;
		}

		const acceleration = new Vector2(0, 2000);

		// Define constants
		const KILL_TIME = 0.8;
		const POP_IN_TIME = 0.05;
		const FADE_OUT_TIME = 0.25;
		const ROTATION_MAX_CONST = 30;

		task.delay(KILL_TIME, () => {
			if (vectorRef.current && vectorRef.current.Parent) {
				vectorRef.current.Destroy();
			}
		});

		const connection = RunService.RenderStepped.Connect((dt) => {
			const currentTick = tick();
			const runningTime = currentTick - startTick.current;

			// Break conditions
			if (!cashClone.Parent || runningTime > KILL_TIME) {
				connection.Disconnect();
				return;
			}

			// Rotation
			setRotation((runningTime / KILL_TIME) * -startVelocityX.current * ROTATION_MAX_CONST);

			// Update velocity and position
			setVelocity(velocity.add(acceleration.mul(dt)));
			setPosition(position.add(velocity.mul(dt)));

			// Visibility logic
			if (runningTime > POP_IN_TIME) {
				setVisible(true);
			}

			// Fade-out logic
			if (KILL_TIME - runningTime < FADE_OUT_TIME) {
				setTransparency(1 - (KILL_TIME - runningTime) / FADE_OUT_TIME);
			}
		});

		return () => {
			if (connection.Connected) {
				connection.Disconnect();
			}
			if (vectorRef.current && vectorRef.current.Parent) {
				vectorRef.current.Destroy();
			}
		};
	}, [vectorRef]);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0)}
			Image={"rbxassetid://96446480715038"}
			Size={props.size}
			Visible={visible}
			Position={new UDim2(0, position.X, 0, position.Y)}
			ImageTransparency={transparency}
			key={props.key}
			BackgroundTransparency={1}
			Rotation={rotation}
			ref={vectorRef}
		/>
	);
};

interface MenuProps {
	uiController: UiController;
	amount?: string;
}

const MONEY_VECTOR_CREATION_AMT = new NumberRange(4, 6);

export const RightSideMenu = (props: MenuProps) => {
	const [moneyVectors, setMoneyVectors] = useState<MoneyVectorProps[]>([]);
	const [moneyValue, setMoneyValue] = useState("0");
	const [, moneyMotion] = useMotion(0);
	const moneyFrameRef = createRef<Frame>();

	const updateMoneyValue = (value: string) => {
		const etNum = EternityNum.fromString(value);
		const num = EternityNum.toNumber(etNum);
		if (IsNaN(etNum) || IsInf(etNum) || num >= math.huge || num !== num) {
			setMoneyValue(`$${EternityNum.short(etNum)}`);
		} else {
			const cleanup = moneyMotion.onStep((value: number, dt) => {
				setMoneyValue(`$${EternityNum.short(EternityNum.fromNumber(value))}`);
			});
			const cleanupComplete = moneyMotion.onComplete(() => {
				cleanup();
				cleanupComplete();
			});
			moneyMotion.spring(EternityNum.toNumber(etNum), springs.default);
		}
	};

	React.useEffect(() => {
		Functions.getMoneyShortString.invoke().then((money) => {
			updateMoneyValue(money);
		});
		Events.updateMoney.connect((newAmount) => {
			updateMoneyValue(newAmount);
		});
	}, []);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			{moneyVectors.map((props) => {
				return <MoneyVector {...props} />;
			})}
			<frame
				AnchorPoint={new Vector2(1, 0)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Menu Container Frame"}
				Position={UDim2.fromScale(0.972, 0.235)}
				Size={UDim2.fromScale(0.269, 0.627)}
			>
				<AnimatedButton
					position={UDim2.fromScale(0.5, 0.5)}
					size={UDim2.fromScale(0.9, 0.2)}
					onClick={() => {
						// if (animationRunning) return;
						const creationAmt = math.random(MONEY_VECTOR_CREATION_AMT.Min, MONEY_VECTOR_CREATION_AMT.Max);
						const vectors: MoneyVectorProps[] = [];
						for (let i = 0; i < creationAmt; i++) {
							const onComplete = (key: string) => {
								print(key);
								setMoneyVectors((prev) => {
									return prev.filter((vector) => vector.key !== key);
								});
							};

							vectors.push({
								size: UDim2.fromScale(0.05, 0.1),
								offset: UDim2.fromOffset(math.random(-100, 100), math.random(50, 100)),
								uiAnchor:
									// moneyFrameRef.current?.AbsolutePosition.add(
									// 	moneyFrameRef.current?.AbsoluteSize.div(1),
									// ) ??
									UserInputService.GetMouseLocation(),
								key: tostring(tick()),
								onComplete,
							});
						}
						setMoneyVectors((prev) => [...prev, ...vectors]);
						props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
					}}
					Ref={moneyFrameRef}
				>
					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://128518524234528"}
						key={"Background"}
						ScaleType={Enum.ScaleType.Slice}
						Size={UDim2.fromScale(1, 1)}
						SliceCenter={new Rect(89, 120, 960, 120)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Amount"}
						Position={UDim2.fromScale(0.062, 0.5)}
						Size={UDim2.fromScale(0.6, 0.7)}
						Text={moneyValue}
						TextColor3={Color3.fromRGB(92, 255, 133)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					>
						<uistroke key={"UIStroke"} Thickness={4} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.00285, 0)}
							PaddingTop={new UDim(0.00285, 0)}
						/>
					</textlabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://94511559177860"}
						key={"Wallet"}
						AnchorPoint={new Vector2(1, 0)}
						Position={UDim2.fromScale(1, 0)}
						Size={UDim2.fromScale(0.5, 1)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
					</imagelabel>
				</AnimatedButton>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.65} />

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Items Menu"}
					Position={UDim2.fromScale(0.031, 0.176)}
					Size={UDim2.fromScale(0.969, 0.211)}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						LayoutOrder={1}
						key={"Gift  Menu"}
						Position={UDim2.fromScale(0.341, -0.368)}
						Size={UDim2.fromScale(0.329, 0.981)}
					>
						<imagebutton
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScaleType={Enum.ScaleType.Fit}
							Selectable={false}
							Size={UDim2.fromScale(0.9, 0.9)}
						>
							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://127513841052443"}
								key={"Icon"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.8, 0.8)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.493, 0.854)}
								Size={UDim2.fromScale(1.25, 0.246)}
								Text={"Gift"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0056, 0)}
									PaddingLeft={new UDim(0.305, 0)}
									PaddingRight={new UDim(0.305, 0)}
									PaddingTop={new UDim(0.0056, 0)}
								/>
							</textlabel>

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagebutton>

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Daily  Menu"}
						Position={UDim2.fromScale(0.671, -0.368)}
						Size={UDim2.fromScale(0.329, 0.981)}
					>
						<imagebutton
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScaleType={Enum.ScaleType.Fit}
							Selectable={false}
							Size={UDim2.fromScale(0.9, 0.9)}
						>
							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://82246683047981"}
								key={"Icon"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.8, 0.8)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.493, 0.854)}
								Size={UDim2.fromScale(1.25, 0.246)}
								Text={"Daily"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0056, 0)}
									PaddingLeft={new UDim(0.308, 0)}
									PaddingRight={new UDim(0.308, 0)}
									PaddingTop={new UDim(0.0056, 0)}
								/>
							</textlabel>

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagebutton>

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>

					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Right}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						LayoutOrder={1}
						key={"Codes Menu"}
						Position={UDim2.fromScale(0.341, -0.368)}
						Size={UDim2.fromScale(0.329, 0.981)}
						Visible={false}
					>
						<imagebutton
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Button"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScaleType={Enum.ScaleType.Fit}
							Selectable={false}
							Size={UDim2.fromScale(0.9, 0.9)}
						>
							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://122946695401404"}
								key={"Icon"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.8, 0.8)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.493, 0.854)}
								Size={UDim2.fromScale(1.25, 0.246)}
								Text={"Codes"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0056, 0)}
									PaddingLeft={new UDim(0.305, 0)}
									PaddingRight={new UDim(0.305, 0)}
									PaddingTop={new UDim(0.0056, 0)}
								/>
							</textlabel>

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagebutton>

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.98} />
				</frame>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Right}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
			</frame>
		</frame>
	);
};
