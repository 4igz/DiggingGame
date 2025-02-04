import React, { createRef, useEffect, useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum, { IsInf, IsNaN } from "shared/util/eternityNum";
import { separateWithCommas } from "shared/util/nameUtil";
import { AnimatedButton } from "./mainUi";
import { UiController } from "client/controllers/uiController";
import { RunService, UserInputService } from "@rbxts/services";
import { gameConstants } from "shared/constants";

interface MoneyVectorProps {
	offset: UDim2;
	size: UDim2;
	uiAnchor: Vector2;
	key: string;
	onComplete: () => void;
}

let variation = 0;
const MoneyVector = (props: MoneyVectorProps) => {
	const vectorRef = createRef<ImageLabel>();

	useEffect(() => {
		const cashClone = vectorRef.current;
		if (!cashClone) {
			return;
		}
		const startTick = tick();
		const random = new Random();

		let position = props.uiAnchor;

		variation += 2;
		variation = variation % 4;

		const startVelocityX = (random.NextNumber() / 2 + 0.5) * (variation - 2);
		let velocity = new Vector2(startVelocityX, -2).Unit.mul(random.NextInteger(400, 600));
		const acceleration = new Vector2(0, 2000);

		// Set initial position and parent
		cashClone.Position = new UDim2(0, position.X, 0, position.Y);

		// Define constants
		const KILL_TIME = 0.8;
		const POP_IN_TIME = 0.05;
		const FADE_OUT_TIME = 0.25;
		const ROTATION_MAX_CONST = 30;

		const connection = RunService.RenderStepped.Connect((dt) => {
			// RenderStepped:Wait() returns a tuple [dt], so use destructuring
			const currentTick = tick();
			const runningTime = currentTick - startTick;

			// Break conditions
			if (!cashClone.Parent || runningTime > KILL_TIME) {
				connection.Disconnect();
				props.onComplete();
				return;
			}

			// Rotation
			cashClone.Rotation = (runningTime / KILL_TIME) * -startVelocityX * ROTATION_MAX_CONST;

			// Update velocity and position
			velocity = velocity.add(acceleration.mul(dt));
			position = position.add(velocity.mul(dt));

			// Apply new position
			cashClone.Position = new UDim2(0, position.X, 0, position.Y);

			// Visibility logic
			if (runningTime > POP_IN_TIME) {
				cashClone.Visible = true;
			}

			// Fade-out logic
			if (KILL_TIME - runningTime < FADE_OUT_TIME) {
				cashClone.ImageTransparency = 1 - (KILL_TIME - runningTime) / FADE_OUT_TIME;
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
	}, []);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0)}
			Image={"rbxassetid://96446480715038"}
			Size={props.size}
			key={props.key}
			BackgroundTransparency={1}
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
	const [animationRunning, setAnimationRunning] = useState(false);
	const [wasClicked, setWasClicked] = useState(false);
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
		if (!animationRunning && wasClicked) {
			setWasClicked(false);
			setMoneyVectors([]);
		}
	}, [animationRunning, wasClicked]);

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
						const completionPromises = new Array<Promise<void>>();
						const vectors: MoneyVectorProps[] = [];
						for (let i = 0; i < creationAmt; i++) {
							let resolvePromise!: () => void;
							const promise = new Promise<void>((resolve) => {
								resolvePromise = resolve;
							});
							const onComplete = () => {
								resolvePromise();
							};

							completionPromises.push(promise);

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
						setMoneyVectors(vectors);
						setAnimationRunning(true);
						setWasClicked(true);
						// Once ALL have finished
						Promise.all(completionPromises).then(() => {
							setAnimationRunning(false);
						});
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
