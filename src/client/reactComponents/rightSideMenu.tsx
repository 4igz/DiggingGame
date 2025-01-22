import React, { createRef, useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum from "shared/util/eternityNum";
import { separateWithCommas } from "shared/util/nameUtil";
import { AnimatedButton } from "./mainUi";
import { UiController } from "client/controllers/uiController";
import { UserInputService, Workspace } from "@rbxts/services";
import { gameConstants } from "shared/constants";
import { createMotion } from "@rbxts/ripple";

interface MoneyVectorProps {
	offset: UDim2;
	size: UDim2;
	uiAnchor: Vector2;
	key: string;
	setAnimationRunning: (clicked: boolean) => void;
}

const MoneyVector = (props: MoneyVectorProps) => {
	const [position, positionMotion] = useMotion(UDim2.fromOffset(props.uiAnchor.X, props.uiAnchor.Y));

	React.useEffect(() => {
		// Animate to the offset
		positionMotion.spring(position.getValue().add(props.offset), springs.bubbly);

		task.delay(0.5, () => {
			// Animate to the middle of the screen
			const screenCenter = new Vector2(
				Workspace.CurrentCamera!.ViewportSize.X / 2,
				Workspace.CurrentCamera!.ViewportSize.Y / 2,
			);
			const cleanup = positionMotion.onStep((value: UDim2, dt) => {
				const toVec = new Vector2(value.X.Offset, value.Y.Offset);
				const distance = toVec.sub(screenCenter).Magnitude;
				if (distance < 10) {
					positionMotion.destroy();
					props.setAnimationRunning(false);
					cleanup();
				}
			});
			positionMotion.spring(UDim2.fromOffset(screenCenter.X, screenCenter.Y), springs.responsive);
		});
	}, []);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			Image={"rbxassetid://96446480715038"}
			Size={props.size}
			Position={position}
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
	const moneyMotion = createMotion(0);

	React.useEffect(() => {
		if (!animationRunning && wasClicked) {
			setWasClicked(false);
			setMoneyVectors([]);
			props.uiController.toggleUi(gameConstants.GAMEPASS_SHOP_UI);
		}
	}, [animationRunning, wasClicked]);

	React.useEffect(() => {
		const cleanup = moneyMotion.onStep((value: number, dt) => {
			setMoneyValue(`$${separateWithCommas(math.floor(value))}`);
		});

		if (props.amount) {
			const num = EternityNum.toNumber(EternityNum.fromString(props.amount));
			// NaN check
			if (num !== num) {
				setMoneyValue(EternityNum.short(EternityNum.fromString(props.amount)));
			} else {
				moneyMotion.spring(EternityNum.toNumber(EternityNum.fromString(props.amount)), springs.default);
			}
		}
		const connection = Events.updateMoney.connect((newAmount) => {
			moneyMotion.spring(EternityNum.toNumber(EternityNum.fromString(newAmount)), springs.default);
		});

		return () => {
			connection.Disconnect();
			cleanup();
		};
	}, [props.amount]);

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
						const vectors: MoneyVectorProps[] = [];
						for (let i = 0; i < creationAmt; i++) {
							vectors.push({
								size: UDim2.fromScale(0.05, 0.1),
								offset: UDim2.fromOffset(math.random(-100, 100), math.random(-100, 100)),
								uiAnchor: UserInputService.GetMouseLocation(),
								key: tostring(tick()),
								setAnimationRunning: setAnimationRunning,
							});
						}
						setMoneyVectors(vectors);
						setAnimationRunning(true);
						setWasClicked(true);
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
