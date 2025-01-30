import React, { useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum, { IsInf, IsNaN } from "shared/util/eternityNum";
import { separateWithCommas } from "shared/util/nameUtil";
import { AnimatedButton } from "./mainUi";
import { UiController } from "client/controllers/uiController";
import { UserInputService } from "@rbxts/services";
import { gameConstants } from "shared/constants";

interface MoneyVectorProps {
	offset: UDim2;
	size: UDim2;
	uiAnchor: Vector2;
	key: string;
	onComplete: () => void;
}

const MoneyVector = (props: MoneyVectorProps) => {
	const [position, positionMotion] = useMotion(props.uiAnchor);
	const [transparency, transparencyMotion] = useMotion(0);
	// 	const subPos = new Vector2(props.offset.X.Offset, props.offset.Y.Offset);
	// 	const endPos = position.getValue().sub(subPos);

	// 	const cleanup = positionMotion.onStep((value) => {
	// 		if (value.sub(endPos).Magnitude < 10) {
	// 			transparencyMotion.onComplete(() => {
	// 				props.onComplete();
	// 			});
	// 			// Animate to the middle of the screen
	// 			const fallPos = position.getValue().sub(new Vector2(-props.offset.X.Offset, -100));
	// 			positionMotion.spring(fallPos, springs.default);
	// 			const posStep = positionMotion.onStep((value) => {
	// 				if (value.sub(fallPos).Magnitude < 50) {
	// 					transparencyMotion.spring(1, springs.responsive);
	// 					posStep();
	// 				}
	// 			});
	// 			cleanup();
	// 		}
	// 	});

	// 	// Animate to the offset
	// 	positionMotion.spring(position.getValue().sub(subPos), springs.responsive);
	// }, []);

	React.useEffect(() => {
		// 1) Define start, up, and final/fall positions explicitly
		const startPos = position.getValue();

		const x = math.random(-100, 100);
		const upPos = startPos.sub(new Vector2(x, 50));
		const fallPos = startPos.add(new Vector2(-x * 2, 50));

		positionMotion.spring(upPos, springs.default);

		// Watch until we reach upPos...
		const unsub1 = positionMotion.onStep((current) => {
			if (current.sub(upPos).Magnitude < 25) {
				unsub1();

				// 3) Animate down to the fallPos
				positionMotion.spring(fallPos, springs.default);

				// Watch until we reach fallPos...
				const unsub2 = positionMotion.onStep((current2) => {
					if (current2.sub(fallPos).Magnitude < 25) {
						// Once close, stop watching
						unsub2();

						// 4) Fade out
						transparencyMotion.spring(1, springs.responsive);

						// Finally, when fade completes, call onComplete
						transparencyMotion.onComplete(() => {
							props.onComplete();
						});
					}
				});
			}
		});
	}, []);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			Image={"rbxassetid://96446480715038"}
			ImageTransparency={transparency}
			Size={props.size}
			Position={position.map((value) => UDim2.fromOffset(value.X, value.Y))}
			key={props.key}
			BackgroundTransparency={1}
		/>
	);
};

interface MenuProps {
	uiController: UiController;
	amount?: string;
}

const MONEY_VECTOR_CREATION_AMT = new NumberRange(5, 10);

export const RightSideMenu = (props: MenuProps) => {
	const [moneyVectors, setMoneyVectors] = useState<MoneyVectorProps[]>([]);
	const [animationRunning, setAnimationRunning] = useState(false);
	const [wasClicked, setWasClicked] = useState(false);
	const [moneyValue, setMoneyValue] = useState("0");
	const [, moneyMotion] = useMotion(0);

	const updateMoneyValue = (value: string) => {
		const etNum = EternityNum.fromString(value);
		const num = EternityNum.toNumber(etNum);
		if (IsNaN(etNum) || IsInf(etNum) || num >= math.huge || num !== num) {
			setMoneyValue(`$${EternityNum.short(etNum)}`);
		} else {
			const cleanup = moneyMotion.onStep((value: number, dt) => {
				setMoneyValue(`$${separateWithCommas(math.floor(value))}`);
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
					size={UDim2.fromScale(1, 0.176)}
					onClick={() => {
						if (animationRunning || props.uiController.getOpenMenu() === gameConstants.GAMEPASS_SHOP_UI)
							return;
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
								uiAnchor: UserInputService.GetMouseLocation(),
								key: tostring(tick()),
								onComplete,
							});
						}
						setMoneyVectors(vectors);
						setAnimationRunning(true);
						setWasClicked(true);
						// Once ALL have finished (all Promises resolve), fire setAnimationRunning(false)
						Promise.all(completionPromises).then(() => {
							setAnimationRunning(false);
						});
						props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
					}}
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
						Size={UDim2.fromScale(0.658, 0.7)}
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
						Position={UDim2.fromScale(0.765, 0)}
						Size={UDim2.fromScale(0.256, 0.947)}
					/>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.7} />
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
