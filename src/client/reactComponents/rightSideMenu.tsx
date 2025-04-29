//!optimize 2
import React, { createRef, useEffect, useRef, useState } from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events, Functions } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum, { IsInf, IsNaN } from "shared/util/eternityNum";
import UiController from "client/controllers/uiController";
import { GuiService, RunService, UserInputService } from "@rbxts/services";
import { gameConstants } from "shared/gameConstants";
import { subscribe } from "@rbxts/charm";
import { hasDailyAtom, hasGiftAtom } from "client/atoms/rewardAtoms";
import { shortenNumber } from "shared/util/nameUtil";
import { usePx } from "client/hooks/usePx";
import { AnimatedButton } from "./buttons";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { Signals } from "shared/signals";

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

const GAMEPAD_KEYCODES = {
	[gameConstants.DAILY_REWARD_UI]: Enum.KeyCode.DPadLeft,
	[gameConstants.PLAYTIME_REWARD_UI]: Enum.KeyCode.DPadRight,
};

interface MenuProps {
	uiController: UiController;
	amount?: string;
}

const MONEY_VECTOR_CREATION_AMT = new NumberRange(4, 6);

const DEFAULT_POS = UDim2.fromScale(0.972, 0.28);
const CLOSED_POS = UDim2.fromScale(1.25, 0.28);

export const RightSideMenu = (props: MenuProps) => {
	const [moneyVectors, setMoneyVectors] = useState<MoneyVectorProps[]>([]);
	const [moneyValue, setMoneyValue] = useState("0");
	const [, moneyMotion] = useMotion(0);
	const [gamepadEnabled, setGamepadEnabled] = React.useState(UserInputService.GamepadEnabled);
	const moneyFrameRef = createRef<Frame>();
	const [hasGift, setHasGift] = useState(hasGiftAtom());
	const [hasDaily, setHasDaily] = useState(hasDailyAtom());
	const [menuPos, setMenuPos] = useMotion(DEFAULT_POS);

	const px = usePx();

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
		Functions.getMoneyShortString()
			.then((money) => {
				updateMoneyValue(money);
			})
			.catch((e) => {
				warn(e);
			});

		Events.updateMoney.connect((newAmount) => {
			updateMoneyValue(newAmount);
		});

		UserInputService.GamepadConnected.Connect(() => {
			setGamepadEnabled(true);
		});

		UserInputService.GamepadDisconnected.Connect(() => {
			setGamepadEnabled(false);
		});

		UserInputService.InputBegan.Connect((input) => {
			if (props.uiController.isMenuLayerOpen()) return;
			if (GuiService.SelectedObject !== undefined) return;
			for (const [menu, keyCode] of pairs(GAMEPAD_KEYCODES)) {
				if (input.KeyCode === keyCode) {
					props.uiController.toggleUi(menu as string);
				}
			}
		});

		Signals.menuOpened.Connect((isOpen, menuName) => {
			setMenuPos.spring(
				isOpen && menuName === gameConstants.SHOP_UI ? DEFAULT_POS : isOpen ? CLOSED_POS : DEFAULT_POS,
				springs.default,
			);
		});

		subscribe(hasGiftAtom, (hasGift) => {
			setHasGift(hasGift);
		});

		subscribe(hasDailyAtom, (hasDaily) => {
			setHasDaily(hasDaily);
		});
	}, []);

	const MENU_MOBILE_SCALE = 1.25;

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
				Position={menuPos}
				Size={UDim2.fromScale(
					0.211 * (getPlayerPlatform() === "Mobile" ? MENU_MOBILE_SCALE : 1),
					0.512 * (getPlayerPlatform() === "Mobile" ? MENU_MOBILE_SCALE : 1),
				)}
			>
				<AnimatedButton
					position={UDim2.fromScale(0.5, 0.5)}
					size={UDim2.fromScale(0.658, 0.166)}
					selectable={false}
					onClick={() => {
						// if (animationRunning) return;
						const creationAmt = math.random(MONEY_VECTOR_CREATION_AMT.Min, MONEY_VECTOR_CREATION_AMT.Max);
						const vectors: MoneyVectorProps[] = [];
						for (let i = 0; i < creationAmt; i++) {
							const onComplete = (key: string) => {
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
						Size={UDim2.fromScale(1.119, 0.886)}
						SliceCenter={new Rect(89, 120, 960, 120)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={".$Amount"}
						Position={UDim2.fromScale(0.1, 0.5)}
						Size={UDim2.fromScale(0.597257, 0.563684)}
						Text={moneyValue}
						TextColor3={Color3.fromRGB(92, 255, 133)}
						// TextScaled={true}
						TextSize={px.even(30)}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Center}
					>
						<uistroke key={"UIStroke"} Thickness={px.ceil(3)} Transparency={0} />

						<textlabel
							AnchorPoint={new Vector2(0, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={".$Amount"}
							Position={UDim2.fromScale(0, 0.425)}
							Size={UDim2.fromScale(0.597257, 0.563684)}
							Text={moneyValue}
							TextColor3={Color3.fromRGB(92, 255, 133)}
							// TextScaled={true}
							TextSize={px.even(30)}
							TextXAlignment={Enum.TextXAlignment.Left}
							TextYAlignment={Enum.TextYAlignment.Center}
						>
							<uistroke key={"UIStroke"} Thickness={px.ceil(3)} Transparency={0} />
						</textlabel>
					</textlabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://94511559177860"}
						key={"Wallet"}
						AnchorPoint={new Vector2(1, 0)}
						Position={UDim2.fromScale(1.2, -0.1)}
						Size={UDim2.fromScale(0.469, 1.209)}
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
					Size={UDim2.fromScale(1.013, 0.221)}
				>
					<AnimatedButton
						layoutOrder={1}
						position={UDim2.fromScale(0.341, -0.368)}
						size={UDim2.fromScale(0.329, 0.981)}
						selectable={false}
						onClick={() => {
							props.uiController.toggleUi(gameConstants.PLAYTIME_REWARD_UI);
						}}
					>
						<imagelabel
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
								// TextScaled={true}
								// TextWrapped={true}
								TextSize={px(25)}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0056, 0)}
									PaddingLeft={new UDim(0.305, 0)}
									PaddingRight={new UDim(0.305, 0)}
									PaddingTop={new UDim(0.0056, 0)}
								/>
							</textlabel>

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 0, 0)}
							key={".$Notification"}
							Position={UDim2.fromScale(0.6, 0.0908)}
							Size={UDim2.fromScale(0.307, 0.307)}
							Visible={hasGift}
							ZIndex={34}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
								Text={"!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={px(2)} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.025, 0)}
									PaddingLeft={new UDim(0.05, 0)}
									PaddingRight={new UDim(0.05, 0)}
									PaddingTop={new UDim(0.025, 0)}
								/>
							</textlabel>

							<uistroke key={"UIStroke"} Thickness={px(3)} />

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</frame>

						<imagelabel
							Image={UserInputService.GetImageForKeyCode(Enum.KeyCode.DPadRight)}
							Position={UDim2.fromScale(0.5, 1)}
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							Size={UDim2.fromScale(0.4, 0.4)}
							Visible={gamepadEnabled}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</AnimatedButton>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Daily Menu"}
						Position={UDim2.fromScale(0.671, -0.368)}
						Size={UDim2.fromScale(0.329, 0.981)}
					>
						<AnimatedButton
							size={UDim2.fromScale(1, 1)}
							selectable={false}
							onClick={() => {
								props.uiController.toggleUi(gameConstants.DAILY_REWARD_UI);
								hasDailyAtom(false);
							}}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(255, 0, 0)}
								key={".$Notification"}
								Position={UDim2.fromScale(0.6, 0.0908)}
								Size={UDim2.fromScale(0.307, 0.307)}
								ZIndex={34}
								Visible={hasDaily}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://16658221428",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									key={"Title"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"!"}
									TextColor3={new Color3(1, 1, 1)}
									TextScaled={true}
									ZIndex={10}
								>
									<uistroke key={"UIStroke"} Thickness={px(2)} />

									<uipadding
										key={"UIPadding"}
										PaddingBottom={new UDim(0.025, 0)}
										PaddingLeft={new UDim(0.05, 0)}
										PaddingRight={new UDim(0.05, 0)}
										PaddingTop={new UDim(0.025, 0)}
									/>
								</textlabel>

								<uistroke key={"UIStroke"} Thickness={px(3)} />

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</frame>

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
							<imagelabel
								Image={UserInputService.GetImageForKeyCode(Enum.KeyCode.DPadLeft)}
								Position={UDim2.fromScale(0.5, 1)}
								BackgroundTransparency={1}
								Size={UDim2.fromScale(0.4, 0.4)}
								Visible={gamepadEnabled}
								AnchorPoint={new Vector2(0.5, 0)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
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
								// TextScaled={true}
								// TextWrapped={true}
								TextSize={px(25)}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />

								<uipadding
									key={"UIPadding"}
									PaddingBottom={new UDim(0.0056, 0)}
									PaddingLeft={new UDim(0.308, 0)}
									PaddingRight={new UDim(0.308, 0)}
									PaddingTop={new UDim(0.0056, 0)}
								/>
							</textlabel>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</AnimatedButton>

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
								// TextScaled={true}
								// TextWrapped={true}
								TextSize={px(25)}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />

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
