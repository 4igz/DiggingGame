//!optimize 2
import React, { createRef, useEffect, useState } from "@rbxts/react";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { MarketplaceService, Players, SoundService, TweenService } from "@rbxts/services";
import { formatTime } from "shared/util/nameUtil";
import { Events, Functions } from "client/network";
import { usePx } from "client/hooks/usePx";
import { GamepassController } from "client/controllers/gamepassController";
import { AnimatedButton, BuyButton } from "./buttons";
import { limitedOffer } from "shared/config/limitedOffer";
import { getRewardImage } from "shared/util/rewardUtil";
import SpriteClip from "@rbxts/spriteclip";
import { highestLimitedOfferPack } from "client/atoms/rewardAtoms";

const MAX_IMAGE_ROTATION = 15;

// Text sizes
const PRODUCT_NAME_PX = 21;
const SUBTITLE_PX = 32;
const TITLE_PX = 43;
const TAB_PX = 23;
const DESC_PX = 20;

interface MoreDiggingProduct {
	runAnimation: boolean;
	gamepassController: GamepassController;
}

const animation = new SpriteClip();
animation.SpriteSheet = gameConstants.MULTI_DIG_ANIMATION_SPRITESHEET;
animation.SpriteCount = 6;
animation.SpriteCountX = 6;
animation.SpriteSizePixel = new Vector2(170, 170);
animation.FrameRate = 0.5;

const DigProduct = (props: MoreDiggingProduct) => {
	const animationRef = createRef<ImageLabel>();
	const [digLevel, setDigLevel] = React.useState(0);

	const px = usePx();

	React.useEffect(() => {
		if (props.runAnimation) {
			animation.Adornee = animationRef.current;
			animation.Play();

			Functions.getMultiDigLevel()
				.then((level) => {
					setDigLevel(level);
				})
				.catch((e) => {
					warn(e);
				});

			const connection = Events.updateMultiDigLevel.connect((level) => {
				setDigLevel(level);
			});

			return () => {
				animation.Pause();
				connection.Disconnect();
			};
		}
	}, [props.runAnimation]);

	return (
		<AnimatedProductButton
			productId={gameConstants.DEVPRODUCT_IDS["MoreDigging"]}
			productType={Enum.InfoType.Product}
			size={UDim2.fromScale(0.958192, 0.856338)}
			layoutOrder={6}
		>
			<imagelabel
				BackgroundTransparency={1}
				Image={"rbxassetid://135275381669432"}
				LayoutOrder={6}
				key={"ShovelSomething"}
				Size={UDim2.fromScale(1, 1)}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.78947} />
				<BuyButton
					anchorPoint={new Vector2(1, 1)}
					size={UDim2.fromScale(0.318396, 0.256579)}
					position={UDim2.fromScale(0.96816, 0.888158)}
					id={gameConstants.DEVPRODUCT_IDS["MoreDigging"]}
					gamepassController={props.gamepassController}
					productType={Enum.InfoType.Product}
					textSize={50}
				/>
				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.03, 0.05)}
					Size={UDim2.fromScale(0.95, 0.486842)}
					Text={`Add +1 Shovel to every dig ${
						digLevel > 0 ? `(Level ${digLevel >= gameConstants.MAX_MULTIDIG_LEVEL ? "MAX" : digLevel})` : ""
					}`}
					TextColor3={new Color3(1, 1, 1)}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextSize={px(TITLE_PX)}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />
				</textlabel>

				<canvasgroup
					BackgroundTransparency={1}
					GroupTransparency={0.84}
					key={"Pattern"}
					Position={UDim2.fromScale(0.012, 0.0328947)}
					Size={UDim2.fromScale(0.976415, 0.907895)}
					ZIndex={0}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.563, 0.141)}
						Size={UDim2.fromScale(0.0608295, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(-0.0237, 0.832)}
						Size={UDim2.fromScale(0.0898617, 0.39)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.711, -0.168)}
						Size={UDim2.fromScale(0.0898617, 0.39)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.603, 0.664)}
						Size={UDim2.fromScale(0.113, 0.49042)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.197, -0.0859)}
						Size={UDim2.fromScale(0.0608295, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.407, 0.714)}
						Size={UDim2.fromScale(0.0608295, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.563, 0.141)}
						Size={UDim2.fromScale(0.0608295, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(-0.0474, -0.227)}
						Size={UDim2.fromScale(0.188, 0.81592)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.867, 0.427)}
						Size={UDim2.fromScale(0.188, 0.81592)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.344, -0.323)}
						Size={UDim2.fromScale(0.113, 0.49042)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.157, 0.857)}
						Size={UDim2.fromScale(0.113, 0.49042)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</canvasgroup>

				<imagelabel
					key={"ImageLabel"}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					Image={gameConstants.MULTI_DIG_ANIMATION_SPRITESHEET}
					ImageRectOffset={new Vector2(680, 0)}
					ImageRectSize={new Vector2(170, 170)}
					Position={UDim2.fromScale(0.05, 0.25)}
					Size={UDim2.fromScale(0.7, 0.65)}
					ref={animationRef}
				>
					<textlabel
						BackgroundTransparency={1}
						FontFace={
							new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)
						}
						key={"OP"}
						Position={UDim2.fromScale(-0.0635838, -0.358381)}
						Size={UDim2.fromScale(0.289017, 0.752601)}
						Text={"OP"}
						TextColor3={Color3.fromRGB(116, 48, 13)}
						// TextScaled={true}
						TextSize={px(TITLE_PX)}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={
								new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)
							}
							key={"OP"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
							Text={"OP"}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(TITLE_PX)}
							ZIndex={2}
						>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
									])
								}
							/>
						</textlabel>
					</textlabel>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />
				</imagelabel>
			</imagelabel>
		</AnimatedProductButton>
	);
};

export const scrollTo = (labelRef: React.RefObject<Frame>, scrollingRef: React.RefObject<ScrollingFrame>) => {
	const currentScrolling = scrollingRef.current;
	const currentLabel = labelRef.current;

	if (currentScrolling && currentLabel) {
		// Reset the CanvasPosition to 0, ensuring a clean starting point
		// Will doing a 0 timed tween will cancel any concurrent tweens and position it at the start
		TweenService.Create(currentScrolling, new TweenInfo(0), {
			CanvasPosition: new Vector2(0, 0),
		}).Play();
		task.wait(); // Necessary wait to ensure the CanvasPosition is updated before scrolling.

		// Calculate the label's position within the canvas
		const labelOffset = currentLabel.AbsolutePosition.Y - currentScrolling.CanvasPosition.Y;

		const centeredPosition = labelOffset - currentScrolling.AbsoluteSize.Y / 2 - currentLabel.AbsoluteSize.Y;

		// Clamp the position to ensure it stays within bounds
		const clampedPosition = math.clamp(
			centeredPosition,
			0,
			currentScrolling.AbsoluteCanvasSize.Y - currentScrolling.AbsoluteSize.Y,
		);

		// Set the CanvasPosition to the calculated clamped position
		// currentScrolling.CanvasPosition = new Vector2(0, currentPos);
		TweenService.Create(currentScrolling, new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
			CanvasPosition: new Vector2(0, clampedPosition),
		}).Play();
	}
};

interface AnimatedProductButtonProps {
	productId: number;
	productType: Enum.InfoType;
	size?: { X: { Scale: number }; Y: { Scale: number } };
	position?: UDim2;
	anchorPoint?: Vector2;
	scales?: NumberRange;
	layoutOrder?: number;
	children?: React.ReactNode;
	zindex?: number;
	predicate?: () => boolean;
	visible?: boolean;
}

export const AnimatedProductButton = (props: AnimatedProductButtonProps) => {
	return (
		<frame
			Size={props.size ? UDim2.fromScale(props.size.X.Scale, props.size.Y.Scale) : UDim2.fromScale(0.961, 0.588)}
			Position={props.position}
			AnchorPoint={props.anchorPoint}
			LayoutOrder={props.layoutOrder ?? 0}
			ZIndex={props.zindex ?? 10}
			BackgroundTransparency={1}
			Visible={props.visible ?? undefined}
		>
			<AnimatedButton
				size={UDim2.fromScale(1, 1)}
				scales={props.scales}
				onClick={() => {
					// Prompt product purchase
					const canBuy = props.predicate?.() ?? true;
					if (!canBuy) return;
					SoundService.PlayLocalSound(
						SoundService.WaitForChild("UI").WaitForChild("PromptPurchase") as Sound,
					);
					switch (props.productType) {
						case Enum.InfoType.GamePass:
							MarketplaceService.PromptGamePassPurchase(Players.LocalPlayer, props.productId);
						case Enum.InfoType.Product:
							MarketplaceService.PromptProductPurchase(Players.LocalPlayer, props.productId);
					}
				}}
			>
				{React.Children.map(props.children, (child) => {
					return child;
				})}
			</AnimatedButton>
		</frame>
	);
};

interface GamepassShopProps {
	uiController: UiController;
	visible: boolean;
	gamepassController: GamepassController;
}

export const GamepassShopComponent = (props: GamepassShopProps) => {
	const [visible, setVisible] = React.useState(false);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [serverLuckTimer, setServerLuckTimer] = React.useState(0);
	const [imageRotation, setImageRotation] = useMotion(0);
	const [limitedTimeLeft, setLimitedTimeLeft] = useState(60 * 60);

	const px = usePx();

	const menuRef = React.createRef<Frame>();
	const scrollingFrameRef = React.createRef<ScrollingFrame>();

	const LABEL_REFS = {
		featured: React.createRef<Frame>(),
		gamepasses: React.createRef<Frame>(),
		currency: React.createRef<Frame>(),
	};

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.51), springs.responsive);
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("OpenShop") as Sound);
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}

		const connection = Events.updateServerLuckMultiplier.connect((multiplier: number, time: number) => {
			setServerLuckTimer(time);
		});

		return () => {
			connection.Disconnect();
		};
	}, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		let currentRotation = imageRotation.getValue();
		const rotationThread = task.spawn(() => {
			while (true) {
				// Make shop image bob back and forth
				task.wait(1);
				currentRotation = currentRotation < MAX_IMAGE_ROTATION ? MAX_IMAGE_ROTATION : -MAX_IMAGE_ROTATION;
				setImageRotation.spring(currentRotation, springs.bubbly);
				setLimitedTimeLeft((prev) => --prev);
			}
		});

		Functions.getClaimedLimitedOfferPack().then((packNum) => {
			highestLimitedOfferPack(packNum);
		});

		Events.updateClaimedLimitedOfferPack.connect((packNum) => {
			highestLimitedOfferPack(packNum);
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			key={"Container"}
			Position={popInPos}
			Size={UDim2.fromScale(0.6, 0.8)}
			ref={menuRef}
			Visible={visible}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://104833131928246"}
				key={"Bg"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={0}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://98011368868644"}
				key={"Icon"}
				Position={UDim2.fromScale(0.0183157, 0.00283023)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.280702, 0.421053)}
				ZIndex={2}
				Rotation={imageRotation}
			/>

			<textlabel
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Title"}
				Position={UDim2.fromScale(0.125182, -0.0503847)}
				Size={UDim2.fromScale(0.208333, 0.138158)}
				Text={"Shop!"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={2}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(6)} />
			</textlabel>

			<frame
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				key={"Header"}
				Position={UDim2.fromScale(0.5, 0.0197368)}
				Size={UDim2.fromScale(0.973684, 0.251645)}
			>
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					key={"Top"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.0125, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Bottom}
					/>

					{/* Scrolling Buttons */}
					<AnimatedButton
						size={UDim2.fromScale(0.19482, 0.366013)}
						onClick={() => {
							scrollTo(LABEL_REFS.featured, scrollingFrameRef);
						}}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://113483111922855"}
							key={"Featured"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.1} />

							<textlabel
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"OP"}
								Position={UDim2.fromScale(-0.0635838, -0.358381)}
								Size={UDim2.fromScale(0.289017, 0.752601)}
								Text={"OP"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								// TextScaled={true}
								TextSize={px(TAB_PX)}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"OP"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"OP"}
									TextColor3={new Color3(1, 1, 1)}
									// TextScaled={true}
									TextSize={px(TAB_PX)}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"OP"}
									Position={UDim2.fromScale(0.5, 0.65)}
									Size={UDim2.fromScale(1, 1)}
									Text={"OP"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									// TextScaled={true}
									TextSize={px(TAB_PX)}
								/>
							</textlabel>

							<textlabel
								key={"TextLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Position={UDim2.fromScale(0.525, 0.475)}
								Size={UDim2.fromScale(0.8, 0.5)}
								Text={"Featured"}
								TextColor3={new Color3(1, 1, 1)}
								// TextScaled={true}
								TextSize={px(TAB_PX)}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3.5)} />
							</textlabel>
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://83795181643227"}
							key={"1"}
							Position={UDim2.fromScale(0.122084, -1.24569)}
							Size={UDim2.fromScale(0.745665, 2.30357)}
							ZIndex={0}
						/>
					</AnimatedButton>

					<AnimatedButton
						size={UDim2.fromScale(0.19482, 0.366013)}
						onClick={() => {
							scrollTo(LABEL_REFS.gamepasses, scrollingFrameRef);
						}}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://71090169310841"}
							key={"Gamepass"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.1} />

							<textlabel
								key={"TextLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Position={UDim2.fromScale(0.525, 0.475)}
								Size={UDim2.fromScale(0.9, 0.5)}
								Text={"Gamepasses"}
								TextColor3={new Color3(1, 1, 1)}
								// TextScaled={true}
								TextSize={px(TAB_PX)}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3.5)} />
							</textlabel>
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://91886638661081"}
							key={"1"}
							Position={UDim2.fromScale(0.456647, -0.875)}
							Size={UDim2.fromScale(0.514451, 1.58929)}
							ZIndex={-1}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://81717198001036"}
							key={"1"}
							Position={UDim2.fromScale(0.265896, -0.875)}
							Size={UDim2.fromScale(0.514451, 1.58929)}
							ZIndex={0}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://132390064654302"}
							key={"1"}
							Position={UDim2.fromScale(0.0693642, -0.875)}
							Size={UDim2.fromScale(0.514451, 1.58929)}
							ZIndex={-1}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>
					</AnimatedButton>

					<AnimatedButton
						size={UDim2.fromScale(0.19482, 0.366013)}
						onClick={() => {
							scrollTo(LABEL_REFS.currency, scrollingFrameRef);
						}}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://137392881319354"}
							key={"Currency"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.1} />

							<textlabel
								key={"TextLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Position={UDim2.fromScale(0.525, 0.475)}
								Size={UDim2.fromScale(0.9, 0.5)}
								Text={"Currency"}
								TextColor3={new Color3(1, 1, 1)}
								// TextScaled={true}
								TextSize={px(TAB_PX)}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3.5)} />
							</textlabel>
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://83795181643227"}
							key={"1"}
							Position={UDim2.fromScale(0.122084, -1.24569)}
							Size={UDim2.fromScale(0.745665, 2.30357)}
							ZIndex={0}
						/>
					</AnimatedButton>
					{/* End Scrolling Buttons */}
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundColor3={Color3.fromRGB(60, 80, 138)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"Divider"}
					Position={UDim2.fromScale(0.5, 1.14379)}
					Size={UDim2.fromScale(1, 0.0261438)}
				/>
			</frame>

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.GAMEPASS_SHOP_UI}
				isMenuVisible={visible}
				// menuRefToClose={menuRef}
			/>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />

			<scrollingframe
				Active={true}
				AnchorPoint={new Vector2(0.5, 1)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				BottomImage={"rbxasset://textures/ui/Scroll/scroll-middle.png"}
				CanvasPosition={new Vector2(0, 1346.38464)}
				CanvasSize={UDim2.fromScale(0, 0)}
				key={"Content"}
				Position={UDim2.fromScale(0.5, 0.934211)}
				ScrollBarImageColor3={new Color3(0.79, 0.79, 0.79)}
				ScrollBarThickness={7}
				ScrollingDirection={Enum.ScrollingDirection.Y}
				Size={UDim2.fromScale(0.970395, 0.583882)}
				TopImage={"rbxasset://textures/ui/Scroll/scroll-middle.png"}
				ref={scrollingFrameRef}
			>
				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<uipadding PaddingLeft={new UDim(0.05)} PaddingRight={new UDim(0.05)} />

				<frame
					BackgroundTransparency={1}
					key={"FeaturedSection"}
					Size={UDim2.fromScale(0.960452, 0.101408)}
					ref={LABEL_REFS.featured}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://106475013833613"}
						key={"Design"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 0.111111)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={212.5} />
					</imagelabel>

					<textlabel
						key={"TextLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.124706, 1)}
						Text={"Featured"}
						TextColor3={Color3.fromRGB(60, 80, 138)}
						TextScaled={true}
						ZIndex={105}
					/>
				</frame>

				<frame
					BackgroundTransparency={1}
					LayoutOrder={1}
					key={"SpaceAfterFeatured"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>

				<AnimatedProductButton
					size={UDim2.fromScale(0.958192, 0.856338)}
					productId={gameConstants.DEVPRODUCT_IDS["StarterPack"]}
					productType={Enum.InfoType.Product}
					visible={limitedTimeLeft > 0 && limitedOffer[highestLimitedOfferPack()] !== undefined}
					layoutOrder={2}
				>
					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://128853663180699"}
						LayoutOrder={2}
						key={"LimitedOffer"}
						Size={UDim2.fromScale(1, 1)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.78947} />
						<textlabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							FontFace={
								new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)
							}
							key={"BestValue"}
							Position={UDim2.fromScale(0.821794, 0.447054)}
							Size={UDim2.fromScale(0.194584, 0.206476)}
							Text={"BEST VALUE!"}
							TextColor3={Color3.fromRGB(116, 48, 13)}
							TextSize={px(33)}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.5, 0.491008)}
								Size={UDim2.fromScale(1, 1.01798)}
								Text={"BEST VALUE!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(33)}
								ZIndex={2}
							>
								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
								/>
							</textlabel>
						</textlabel>

						<BuyButton
							anchorPoint={new Vector2(1, 1)}
							position={UDim2.fromScale(0.96816, 0.888158)}
							size={UDim2.fromScale(0.318396, 0.256579)}
							id={gameConstants.DEVPRODUCT_IDS["StarterPack"]}
							gamepassController={props.gamepassController}
							productType={Enum.InfoType.Product}
						/>
						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.039359, 0.0943521)}
							Size={UDim2.fromScale(0.373821, 0.236842)}
							Text={"Limited Offer!"}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(TITLE_PX)}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />
						</textlabel>
						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Timer"}
							Position={UDim2.fromScale(0.75, 0.174875)}
							Size={UDim2.fromScale(0.160377, 0.105263)}
							Text={formatTime(limitedTimeLeft)}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(SUBTITLE_PX)}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(3)} />
						</textlabel>
						<frame
							BackgroundTransparency={1}
							key={"Circles"}
							Position={UDim2.fromScale(0.0389151, 0.401316)}
							Size={UDim2.fromScale(0.566038, 0.421053)}
						>
							<frame
								AnchorPoint={new Vector2(0, 0.5)}
								BackgroundColor3={Color3.fromRGB(215, 46, 57)}
								key={"Circle"}
								Position={UDim2.fromScale(0, 0.5)}
								Size={UDim2.fromScale(0.266667, 1)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

								<textlabel
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"OP"}
									Position={UDim2.fromScale(0.0490412, -0.263083)}
									Size={UDim2.fromScale(0.305773, 0.752601)}
									Text={"OP"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(46)}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={4} />

									<textlabel
										AnchorPoint={new Vector2(0.5, 0.5)}
										BackgroundTransparency={1}
										FontFace={
											new Font(
												"rbxassetid://11702779409",
												Enum.FontWeight.ExtraBold,
												Enum.FontStyle.Normal,
											)
										}
										key={"OP"}
										Position={UDim2.fromScale(0.5, 0.5)}
										Size={UDim2.fromScale(1, 1)}
										Text={"OP"}
										TextColor3={new Color3(1, 1, 1)}
										TextSize={px(46)}
										ZIndex={2}
									>
										<uigradient
											key={"UIGradient"}
											Color={
												new ColorSequence([
													new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
													new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
												])
											}
										/>
									</textlabel>
								</textlabel>

								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(138, 0, 0)}
									Thickness={px(3)}
									Transparency={0.5}
								/>

								<imagelabel
									key={"ImageLabel"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									Image={"rbxassetid://95141846932408"}
									ImageTransparency={0.63}
									Position={UDim2.fromScale(0.508875, 0.478922)}
									ScaleType={Enum.ScaleType.Crop}
									Size={UDim2.fromScale(1.04005, 1.05069)}
									ZIndex={-5}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									key={"ImageLabel"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Image={
										getRewardImage(
											limitedOffer[
												math.min(highestLimitedOfferPack(), limitedOffer.size() - 1)
											][0],
										) ?? ""
									}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
								</imagelabel>
							</frame>

							<frame
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(215, 46, 57)}
								key={"Circle"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(0.266667, 1)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(138, 0, 0)}
									Thickness={px(3)}
									Transparency={0.5}
								/>

								<textlabel
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"OP"}
									Position={UDim2.fromScale(0.0490412, -0.263083)}
									Size={UDim2.fromScale(0.305773, 0.752601)}
									Text={"OP"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(46)}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={4} />

									<textlabel
										AnchorPoint={new Vector2(0.5, 0.5)}
										BackgroundTransparency={1}
										FontFace={
											new Font(
												"rbxassetid://11702779409",
												Enum.FontWeight.ExtraBold,
												Enum.FontStyle.Normal,
											)
										}
										key={"OP"}
										Position={UDim2.fromScale(0.5, 0.5)}
										Size={UDim2.fromScale(1, 1)}
										Text={"OP"}
										TextColor3={new Color3(1, 1, 1)}
										TextSize={px(46)}
										ZIndex={2}
									>
										<uigradient
											key={"UIGradient"}
											Color={
												new ColorSequence([
													new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
													new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
												])
											}
										/>
									</textlabel>
								</textlabel>
								<imagelabel
									key={"ImageLabel"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									Image={"rbxassetid://95141846932408"}
									ImageTransparency={0.63}
									Position={UDim2.fromScale(0.508875, 0.478922)}
									ScaleType={Enum.ScaleType.Crop}
									Size={UDim2.fromScale(1, 1)}
									ZIndex={-5}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>
								<imagelabel
									key={"ImageLabel"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									Position={UDim2.fromScale(0.5, 0.5)}
									Image={
										getRewardImage(
											limitedOffer[
												math.min(highestLimitedOfferPack(), limitedOffer.size() - 1)
											][1],
										) ?? ""
									}
									Size={UDim2.fromScale(1, 1)}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
								</imagelabel>
							</frame>

							<frame
								AnchorPoint={new Vector2(1, 0.5)}
								BackgroundColor3={Color3.fromRGB(215, 46, 57)}
								key={"Circle"}
								Position={UDim2.fromScale(1, 0.5)}
								Size={UDim2.fromScale(0.266667, 1)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(138, 0, 0)}
									Thickness={px(3)}
									Transparency={0.5}
								/>

								<imagelabel
									key={"ImageLabel"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									Position={UDim2.fromScale(0.5, 0.5)}
									Image={
										getRewardImage(
											limitedOffer[
												math.min(highestLimitedOfferPack(), limitedOffer.size() - 1)
											][2],
										) ?? ""
									}
									Size={UDim2.fromScale(1, 1)}
								>
									<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
								</imagelabel>
							</frame>

							<textlabel
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"+"}
								Position={UDim2.fromScale(0.285, 0.214)}
								Size={UDim2.fromScale(0.0645833, 0.5625)}
								Text={"+"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(3)} />
							</textlabel>

							<textlabel
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"+"}
								Position={UDim2.fromScale(0.65296, 0.213938)}
								Size={UDim2.fromScale(0.0645833, 0.5625)}
								Text={"+"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(3)} />
							</textlabel>
						</frame>
					</imagelabel>
				</AnimatedProductButton>

				<frame
					BackgroundTransparency={1}
					LayoutOrder={3}
					Visible={limitedTimeLeft > 0 && limitedOffer[highestLimitedOfferPack()] !== undefined}
					key={"SpaceAfterLimitedOffer"}
					Size={UDim2.fromScale(1, 0.0225352)}
				/>

				<AnimatedProductButton
					size={UDim2.fromScale(0.958192, 0.856338)}
					productId={gameConstants.DEVPRODUCT_IDS["x2Luck"]}
					productType={Enum.InfoType.Product}
					layoutOrder={4}
				>
					<imagelabel
						BackgroundTransparency={1}
						Image={"rbxassetid://80138033353948"}
						LayoutOrder={4}
						key={"ServerLuckMultiplier"}
						Size={UDim2.fromScale(1, 1)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.78947} />

						<BuyButton
							id={gameConstants.DEVPRODUCT_IDS["x2Luck"]}
							productType={Enum.InfoType.Product}
							size={UDim2.fromScale(0.318, 0.257)}
							position={UDim2.fromScale(0.968, 0.888)}
							anchorPoint={new Vector2(1, 1)}
							gamepassController={props.gamepassController}
							textSize={50}
						/>

						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.039359, 0.0943521)}
							Size={UDim2.fromScale(0.668632, 0.236842)}
							Text={"Multiply  Server  Luck"}
							TextColor3={new Color3(1, 1, 1)}
							TextSize={px(TITLE_PX)}
							// TextScaled={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />
						</textlabel>

						<textlabel
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Timer"}
							Position={UDim2.fromScale(0.75, 0.175)}
							Size={UDim2.fromScale(0.160377, 0.105263)}
							Text={formatTime(serverLuckTimer)}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={false}
							TextSize={px(SUBTITLE_PX)}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(3)} />
						</textlabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://87354534010134"}
							key={"OldBooster"}
							Position={UDim2.fromScale(0.0389151, 0.486842)}
							Size={UDim2.fromScale(0.116745, 0.335526)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.970588} />
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://107024440935490"}
							key={"NewBooster"}
							Position={UDim2.fromScale(0.346698, 0.483553)}
							Size={UDim2.fromScale(0.159198, 0.338816)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.31068} />
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://105860713661271"}
							LayoutOrder={1}
							key={"Arrow"}
							Position={UDim2.fromScale(0.200009, 0.51546)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.0964249, 0.268975)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<canvasgroup
							BackgroundTransparency={1}
							GroupTransparency={0.84}
							key={"Pattern"}
							Position={UDim2.fromScale(0.012, 0.0328947)}
							Size={UDim2.fromScale(0.976415, 0.907895)}
							ZIndex={0}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.563, 0.141)}
								Size={UDim2.fromScale(0.0608295, 0.264)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(-0.0237, 0.832)}
								Size={UDim2.fromScale(0.0898617, 0.39)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.711, -0.168)}
								Size={UDim2.fromScale(0.0898617, 0.39)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.603, 0.664)}
								Size={UDim2.fromScale(0.113, 0.49042)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.197, -0.0859)}
								Size={UDim2.fromScale(0.0608295, 0.264)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.407, 0.714)}
								Size={UDim2.fromScale(0.0608295, 0.264)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.563, 0.141)}
								Size={UDim2.fromScale(0.0608295, 0.264)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(-0.0474, -0.227)}
								Size={UDim2.fromScale(0.188, 0.81592)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.867, 0.427)}
								Size={UDim2.fromScale(0.188, 0.81592)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.344, -0.323)}
								Size={UDim2.fromScale(0.113, 0.49042)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.157, 0.857)}
								Size={UDim2.fromScale(0.113, 0.49042)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</canvasgroup>
					</imagelabel>
				</AnimatedProductButton>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={5}
					key={"SpaceAfterLuckMultiplier"}
					Size={UDim2.fromScale(1, 0.0225352)}
				/>

				<DigProduct runAnimation={visible} gamepassController={props.gamepassController} />

				<frame
					BackgroundTransparency={1}
					LayoutOrder={7}
					key={"SpaceAfterShovelSomething"}
					Size={UDim2.fromScale(1, 0.0225352)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={8}
					key={"GamepassSection"}
					ref={LABEL_REFS.gamepasses}
					Size={UDim2.fromScale(0.960452, 0.101408)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://110919132587472"}
						key={"Design"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 0.111111)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={212.5} />
					</imagelabel>

					<textlabel
						key={"TextLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.147059, 1)}
						Text={"Gamepass"}
						TextColor3={Color3.fromRGB(60, 80, 138)}
						TextScaled={true}
						ZIndex={105}
					/>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={9}
					key={"SpaceAfterGamepass"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={10}
					key={"GpRow1"}
					Position={UDim2.fromScale(0.0423729, 0.723867)}
					Size={UDim2.fromScale(0.972881, 0.706646)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.01, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<AnimatedProductButton
						size={UDim2.fromScale(0.240741, 0.957627)}
						productId={gameConstants.GAMEPASS_IDS["x2Cash"]}
						productType={Enum.InfoType.GamePass}
					>
						<imagelabel
							BackgroundTransparency={1}
							Size={UDim2.fromScale(1, 1)}
							Image={"rbxassetid://130792509691367"}
							key={"2xCash"}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.862832} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"2x Cash!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://120734919491441"}
								key={"GpIcon"}
								Position={UDim2.fromScale(0.5, 0.10177)}
								Size={UDim2.fromScale(0.620513, 0.535398)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.902655)}
								id={gameConstants.GAMEPASS_IDS["x2Cash"]}
								productType={Enum.InfoType.GamePass}
								gamepassController={props.gamepassController}
								size={UDim2.fromScale(0.851282, 0.212389)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.5, 0.522124)}
								Size={UDim2.fromScale(0.8, 0.137168)}
								Text={"BEST VALUE!"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"BEST VALUE!"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.65)}
									Size={UDim2.fromScale(1, 1)}
									Text={"BEST VALUE!"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.240741, 0.957627)}
						productId={gameConstants.GAMEPASS_IDS["BiggerBackpack"]}
						productType={Enum.InfoType.GamePass}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://130792509691367"}
							key={"BiggerBackpack"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.862832} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(1, 0.115044)}
								Text={"Bigger Backpack!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://87717382502330"}
								key={"GpIcon"}
								Position={UDim2.fromScale(0.5, 0.10177)}
								Size={UDim2.fromScale(0.620513, 0.535398)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.902655)}
								size={UDim2.fromScale(0.851282, 0.212389)}
								id={gameConstants.GAMEPASS_IDS["BiggerBackpack"]}
								gamepassController={props.gamepassController}
								productType={Enum.InfoType.GamePass}
							/>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.240741, 0.957627)}
						productId={gameConstants.GAMEPASS_IDS["x2Strength"]}
						productType={Enum.InfoType.GamePass}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://130792509691367"}
							key={"2xStrength"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.862832} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.110619)}
								Text={"x2 Strength!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://80922635457414"}
								key={"GpIcon"}
								Position={UDim2.fromScale(0.5, 0.10177)}
								Size={UDim2.fromScale(0.620513, 0.535398)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.902655)}
								size={UDim2.fromScale(0.851282, 0.212389)}
								id={gameConstants.GAMEPASS_IDS["x2Strength"]}
								gamepassController={props.gamepassController}
								productType={Enum.InfoType.GamePass}
							/>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.240741, 0.957627)}
						productId={gameConstants.GAMEPASS_IDS["x2Luck"]}
						productType={Enum.InfoType.GamePass}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://130792509691367"}
							key={"2xLuck"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.862832} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"x2 Luck!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://92359869214726"}
								key={"GpIcon"}
								Position={UDim2.fromScale(0.5, 0.10177)}
								Size={UDim2.fromScale(0.620513, 0.535398)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.902655)}
								size={UDim2.fromScale(0.851282, 0.212389)}
								id={gameConstants.GAMEPASS_IDS["x2Luck"]}
								gamepassController={props.gamepassController}
								productType={Enum.InfoType.GamePass}
							/>
						</imagelabel>
					</AnimatedProductButton>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={11}
					key={"SpaceAfterGpRow1"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={12}
					key={"GpRow2"}
					Position={UDim2.fromScale(0.0423729, 1.47543)}
					Size={UDim2.fromScale(0.972881, 0.706646)}
				>
					<AnimatedProductButton
						size={UDim2.fromScale(1, 0.957627)}
						productId={gameConstants.GAMEPASS_IDS["SellEverywhere"]}
						productType={Enum.InfoType.GamePass}
					>
						<imagelabel
							key={"ImageLabel"}
							BackgroundTransparency={1}
							Image={"rbxassetid://131864456242379"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.58407} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.824626, -0.0353982)}
								Size={UDim2.fromScale(0.276675, 0.137168)}
								Text={"MOST PURCHASED!"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.503289, 0.5)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"MOST PURCHASED!"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.503289, 0.649999)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"MOST PURCHASED!"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(DESC_PX)}
									// TextScaled={true}
								/>
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://115427840029171"}
								key={"GpIcon"}
								Position={UDim2.fromScale(0.038, 0.48)}
								Size={UDim2.fromScale(0.203704, 0.730088)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.470113, 0.296368)}
								Size={UDim2.fromScale(0.4, 0.287611)}
								Text={"Sell  Anywhere!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.SemiBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Description"}
								Position={UDim2.fromScale(0.521219, 0.465076)}
								RichText={true}
								Size={UDim2.fromScale(0.502469, 0.115044)}
								Text={"Get the ability to sell anywhere on the map."}
								TextColor3={Color3.fromRGB(27, 37, 76)}
								TextSize={px(DESC_PX)}
								// TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={105}
							/>

							<BuyButton
								position={UDim2.fromScale(0.97037, 0.867257)}
								size={UDim2.fromScale(0.204938, 0.212389)}
								anchorPoint={new Vector2(1, 1)}
								id={gameConstants.GAMEPASS_IDS["SellEverywhere"]}
								gamepassController={props.gamepassController}
								productType={Enum.InfoType.GamePass}
							/>
						</imagelabel>
					</AnimatedProductButton>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={13}
					key={"SpaceAfterGpRow3"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={14}
					key={"CurrencySection"}
					Size={UDim2.fromScale(0.960452, 0.101408)}
					ref={LABEL_REFS.currency}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://110919132587472"}
						key={"Design"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 0.111111)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={212.5} />
					</imagelabel>

					<textlabel
						key={"TextLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.123465, 0.999479)}
						Text={"Currency"}
						TextColor3={Color3.fromRGB(60, 80, 138)}
						TextSize={px(PRODUCT_NAME_PX)}
						// TextScaled={true}
						ZIndex={105}
					/>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={15}
					key={"SpaceAfterCurrency"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={16}
					key={"CurrRow1"}
					Position={UDim2.fromScale(0.0423729, 0.723867)}
					Size={UDim2.fromScale(0.972881, 0.706646)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.01, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<AnimatedProductButton
						size={UDim2.fromScale(0.33, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["15k Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"1"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.15044} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"Bag  Of  Cash"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(2.5)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.509649, 0.0476549)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 0.75)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.89)}
								size={UDim2.fromScale(0.849219, 0.201142)}
								id={gameConstants.DEVPRODUCT_IDS["15k Money Pack"]}
								productType={Enum.InfoType.Product}
								gamepassController={props.gamepassController}
								anchorPoint={new Vector2(0.5, 1)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Amount"}
								Position={UDim2.fromScale(0.5, 0.138)}
								Size={UDim2.fromScale(0.795953, 0.11364)}
								Text={"+15,000"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.33, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["40k Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"1"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.15044} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"Crate  Of  Cash"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(2.5)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.509649, 0.0476549)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 0.75)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.89)}
								size={UDim2.fromScale(0.849219, 0.201142)}
								id={gameConstants.DEVPRODUCT_IDS["40k Money Pack"]}
								productType={Enum.InfoType.Product}
								gamepassController={props.gamepassController}
								anchorPoint={new Vector2(0.5, 1)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Amount"}
								Position={UDim2.fromScale(0.5, 0.138)}
								Size={UDim2.fromScale(0.795953, 0.11364)}
								Text={"+40,000"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.33, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["75k Medium Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"1"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.15044} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"Chest  Of  Cash"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(2.5)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.509649, 0.0476549)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 0.75)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.89)}
								size={UDim2.fromScale(0.849219, 0.201142)}
								id={gameConstants.DEVPRODUCT_IDS["75k Medium Money Pack"]}
								productType={Enum.InfoType.Product}
								gamepassController={props.gamepassController}
								anchorPoint={new Vector2(0.5, 1)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Amount"}
								Position={UDim2.fromScale(0.5, 0.138)}
								Size={UDim2.fromScale(0.795953, 0.11364)}
								Text={"+75,000"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.5, 0.522124)}
								Size={UDim2.fromScale(0.8, 0.137168)}
								Text={"10% EXTRA"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"10% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.65)}
									Size={UDim2.fromScale(1, 1)}
									Text={"10% EXTRA"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={17}
					key={"SpaceAfterCurrRow1"}
					Size={UDim2.fromScale(1, 0.03)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={18}
					key={"CurrRow2"}
					Position={UDim2.fromScale(0.0423729, 0.723867)}
					Size={UDim2.fromScale(0.972881, 0.706646)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.01, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<AnimatedProductButton
						size={UDim2.fromScale(0.45, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["250k Big Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"2"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.15044} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"Vault  Of  Cash"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(2.5)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.509649, 0.0476549)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 0.75)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.89)}
								size={UDim2.fromScale(0.849219, 0.201142)}
								id={gameConstants.DEVPRODUCT_IDS["250k Big Money Pack"]}
								productType={Enum.InfoType.Product}
								gamepassController={props.gamepassController}
								anchorPoint={new Vector2(0.5, 1)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Amount"}
								Position={UDim2.fromScale(0.5, 0.138)}
								Size={UDim2.fromScale(0.795953, 0.11364)}
								Text={"+250,000"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.5, 0.522124)}
								Size={UDim2.fromScale(0.8, 0.137168)}
								Text={"15% EXTRA"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"15% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.65)}
									Size={UDim2.fromScale(1, 1)}
									Text={"15% EXTRA"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.45, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["1M Massive Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"3"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.15044} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.025)}
								Size={UDim2.fromScale(0.9, 0.115044)}
								Text={"Fortune  Of  Cash"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(2.5)} />
							</textlabel>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.509649, 0.0476549)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1, 0.75)}
							/>

							<BuyButton
								position={UDim2.fromScale(0.5, 0.89)}
								size={UDim2.fromScale(0.849219, 0.201142)}
								id={gameConstants.DEVPRODUCT_IDS["1M Massive Money Pack"]}
								gamepassController={props.gamepassController}
								productType={Enum.InfoType.Product}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Amount"}
								Position={UDim2.fromScale(0.5, 0.138)}
								Size={UDim2.fromScale(0.795953, 0.11364)}
								Text={"+1,000,000"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.5, 0.522124)}
								Size={UDim2.fromScale(0.8, 0.137168)}
								Text={"20% EXTRA"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(PRODUCT_NAME_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									Text={"20% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.5, 0.65)}
									Size={UDim2.fromScale(1, 1)}
									Text={"20% EXTRA"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
								/>
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={19}
					key={"SpaceAfterCurrRow2"}
					Size={UDim2.fromScale(1, 0.0422535)}
				/>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={20}
					key={"CurrRow3"}
					Position={UDim2.fromScale(0.0423729, 1.47543)}
					Size={UDim2.fromScale(0.972881, 0.706646)}
				>
					<AnimatedProductButton
						size={UDim2.fromScale(1, 0.957627)}
						productId={gameConstants.DEVPRODUCT_IDS["2.5M Pirate's Treasure"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							key={"ImageLabel"}
							BackgroundTransparency={1}
							Image={"rbxassetid://110877994052410"}
							Size={UDim2.fromScale(1, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.58407} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"BestValue"}
								Position={UDim2.fromScale(0.852792, -0.0353983)}
								Size={UDim2.fromScale(0.220342, 0.137168)}
								Text={"BEST VALUE"}
								TextColor3={Color3.fromRGB(116, 48, 13)}
								TextSize={px(SUBTITLE_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(4)} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.503289, 0.5)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"BEST VALUE"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(SUBTITLE_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
												new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
											])
										}
									/>
								</textlabel>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={
										new Font(
											"rbxassetid://11702779409",
											Enum.FontWeight.ExtraBold,
											Enum.FontStyle.Normal,
										)
									}
									key={"BestValue"}
									Position={UDim2.fromScale(0.503289, 0.649999)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"BEST VALUE"}
									TextColor3={Color3.fromRGB(116, 48, 13)}
									TextSize={px(SUBTITLE_PX)}
									// TextScaled={true}
								/>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.SemiBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Description"}
								Position={UDim2.fromScale(0.478517, 0.503813)}
								RichText={true}
								Size={UDim2.fromScale(0.335765, 0.192518)}
								Text={"+2,500,000 MONEY"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(SUBTITLE_PX)}
								// TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={1.8} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
									Rotation={90}
								/>
							</textlabel>

							<BuyButton
								position={UDim2.fromScale(0.97037, 0.867257)}
								size={UDim2.fromScale(0.204938, 0.212389)}
								id={gameConstants.DEVPRODUCT_IDS["2.5M Pirate's Treasure"]}
								productType={Enum.InfoType.Product}
								anchorPoint={new Vector2(1, 1)}
								gamepassController={props.gamepassController}
							/>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://100095947000779"}
								key={"CurrIcon"}
								Position={UDim2.fromScale(0.159588, 0.0226788)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.309168, 0.883299)}
							/>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font(
										"rbxassetid://11702779409",
										Enum.FontWeight.ExtraBold,
										Enum.FontStyle.Normal,
									)
								}
								key={"Title"}
								Position={UDim2.fromScale(0.522106, 0.296368)}
								Size={UDim2.fromScale(0.417901, 0.249631)}
								Text={"PIRATE’S TREASURE"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(TITLE_PX)}
								// TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(4)} />
							</textlabel>
						</imagelabel>
					</AnimatedProductButton>
				</frame>
			</scrollingframe>
		</frame>
	);
};
