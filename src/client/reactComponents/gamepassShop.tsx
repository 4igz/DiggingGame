//!optimize 2
import React, { Binding, createRef, useEffect, useState } from "@rbxts/react";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { MarketplaceService, Players, SoundService, TweenService, UserInputService } from "@rbxts/services";
import { formatItemName, formatShortTime, formatTime, shortenNumber } from "shared/util/nameUtil";
import { Events, Functions } from "client/network";
import { usePx } from "client/hooks/usePx";
import { GamepassController } from "client/controllers/gamepassController";
import { AnimatedButton, BuyButton } from "./buttons";
import { limitedOffer } from "shared/config/limitedOffer";
import { getRewardImage } from "shared/util/rewardUtil";
import SpriteClip from "@rbxts/spriteclip";
import { highestLimitedOfferPack } from "client/atoms/rewardAtoms";
import { Signals } from "shared/signals";
import { subscribe } from "@rbxts/charm";
import { mLuckPotionsAtom, mStrengthPotionsAtom } from "client/atoms/inventoryAtoms";
import { Item } from "shared/networkTypes";
import { potionConfig } from "shared/config/potionConfig";
import { TooltipStats } from "./tooltips";

const MAX_IMAGE_ROTATION = 15;

// Text sizes
const PRODUCT_NAME_PX = 24;
const SUBTITLE_PX = 32;
const TITLE_PX = 43;
const TAB_PX = 23;
const DESC_PX = 24;

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
					textSize={35}
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
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={
								new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)
							}
							key={"OP"}
							Position={UDim2.fromScale(0.5, 0.475)}
							Size={UDim2.fromScale(1, 1)}
							Text={"OP"}
							TextColor3={new Color3(1, 1, 1)}
							// TextScaled={true}
							TextSize={px(TITLE_PX)}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
	position?: UDim2 | Binding<UDim2>;
	anchorPoint?: Vector2;
	scales?: NumberRange;
	layoutOrder?: number;
	children?: React.ReactNode;
	zindex?: number;
	predicate?: () => boolean;
	backgroundTransparency?: number;
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
				backgroundTransparency={props.backgroundTransparency ?? 1}
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

export const GamepassShop = (props: GamepassShopProps) => {
	const [visible, setVisible] = React.useState(false);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [serverLuckTimer, setServerLuckTimer] = React.useState(0);
	const [imageRotation, setImageRotation] = useMotion(0);
	const [limitedTimeLeft, setLimitedTimeLeft] = useState(60 * 60);
	const [mLuckPotions, setMLuckPotions] = useState(mLuckPotionsAtom());
	const [mStrengthPotions, setMStrengthPotions] = useState(mStrengthPotionsAtom());
	const [enteredCode, setEnteredCode] = useState("");
	const [packNum, setPackNum] = useState(0);
	const [packHoverState, setPackHoverState] = useState(0);

	const px = usePx();

	const menuRef = React.createRef<Frame>();
	const scrollingFrameRef = React.createRef<ScrollingFrame>();

	const LABEL_REFS = {
		featured: React.createRef<Frame>(),
		gamepasses: React.createRef<Frame>(),
		currency: React.createRef<Frame>(),
		potions: React.createRef<Frame>(),
		codes: React.createRef<Frame>(),
	};

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.55), springs.responsive);
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

		subscribe(highestLimitedOfferPack, (packNum) => {
			setPackNum(packNum);
		});

		Functions.getClaimedLimitedOfferPack().then((packNum) => {
			highestLimitedOfferPack(packNum);
		});

		Events.updateClaimedLimitedOfferPack.connect((packNum) => {
			highestLimitedOfferPack(packNum);
		});

		subscribe(mLuckPotionsAtom, (newV) => {
			setMLuckPotions(newV);
		});
		subscribe(mStrengthPotionsAtom, (newV) => {
			setMStrengthPotions(newV);
		});

		const updatePotionCounts = (inv: Array<Item>) => {
			const luckPotions = inv.reduce((acc, item) => {
				if (item.name === "M.Luck Potion") {
					return acc + 1;
				}
				return acc;
			}, 0);
			const strengthPotions = inv.reduce((acc, item) => {
				if (item.name === "M.Strength Potion") {
					return acc + 1;
				}
				return acc;
			}, 0);

			if (luckPotions) {
				setMLuckPotions(luckPotions);
			}

			if (strengthPotions) {
				setMStrengthPotions(strengthPotions);
			}
		};

		Functions.getInventory("Potions").then(([_, inv]) => {
			if (inv) {
				updatePotionCounts(inv);
			}
		});

		Events.updateInventory.connect((inventoryType, [_, inv]) => {
			if (inventoryType === "Potions" && inv !== undefined) {
				updatePotionCounts(inv);
			}
		});

		Events.drankPotion.connect((potionName: keyof typeof potionConfig) => {
			switch (potionName) {
				case "M.Strength Potion": {
					setMStrengthPotions((prev) => --prev);
				}
				case "M.Luck Potion": {
					setMLuckPotions((prev) => --prev);
				}
			}
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
								TextSize={px(36)}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(2)} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(246, 231, 133)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(253, 174, 62)),
										])
									}
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
									key={"OP"}
									Position={UDim2.fromScale(0.5, 0.45)}
									Size={UDim2.fromScale(1, 1)}
									Text={"OP"}
									TextColor3={new Color3(1, 1, 1)}
									// TextScaled={true}
									TextSize={px(36)}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(2)} />

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

					<AnimatedButton
						layoutOrder={5}
						size={UDim2.fromScale(0.212, 0.873)}
						onClick={() => {
							scrollTo(LABEL_REFS.potions, scrollingFrameRef);
						}}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							Image={"rbxassetid://130116642788720"}
							key={"Money Cover"}
							Position={UDim2.fromScale(0.439156, 0.0511649)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.533004, 1.44078)}
							ZIndex={0}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

							<uigradient
								key={"UIGradient"}
								Rotation={90}
								Transparency={
									new NumberSequence([
										new NumberSequenceKeypoint(0, 0),
										new NumberSequenceKeypoint(0.675811, 0.0125),
										new NumberSequenceKeypoint(0.763092, 1),
										new NumberSequenceKeypoint(1, 1),
									])
								}
							/>
						</imagelabel>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://113483111922855"}
							key={".$Featured"}
							Position={UDim2.fromScale(0.481507, 0.793947)}
							Size={UDim2.fromScale(0.968776, 0.424912)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3.1} />

							<textlabel
								key={"TextLabel"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Position={UDim2.fromScale(0.497716, 0.487696)}
								Size={UDim2.fromScale(0.8, 0.5)}
								Text={"Potions"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(TAB_PX)}
								ZIndex={105}
							>
								<uistroke key={"UIStroke"} Thickness={px(3.5)} />
							</textlabel>
						</imagelabel>
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

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				key={"Side"}
				Position={UDim2.fromScale(1.07677, 0.750451)}
				Size={UDim2.fromScale(0.118072, 0.31603)}
			>
				<AnimatedButton
					key={"Codes"}
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.5, 0.285283)}
					size={UDim2.fromScale(0.837847, 0.411347)}
					onClick={() => {
						scrollTo(LABEL_REFS.codes, scrollingFrameRef);
					}}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.2} />

					<imagelabel
						Image={"rbxassetid://109250907266323"}
						ScaleType={Enum.ScaleType.Slice}
						SliceCenter={new Rect(112, 112, 112, 112)}
						SliceScale={0.18}
						Size={UDim2.fromScale(1, 1)}
					>
						<frame
							key={"Frame"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.05, 0)} />

							<uistroke key={"UIStroke"} Color={Color3.fromRGB(89, 192, 229)} Thickness={3.7} />

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={new Color3(1, 1, 1)}
								ClipsDescendants={true}
								Image={"rbxassetid://109250907266323"}
								ImageTransparency={1}
								key={"Background"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(0.95, 0.95)}
								SliceCenter={new Rect(112, 112, 112, 112)}
								SliceScale={0.18}
							>
								<frame
									BackgroundTransparency={1}
									LayoutOrder={2}
									key={"Buy Btn Frame"}
									Position={UDim2.fromScale(0.150808, 0.727252)}
									Size={UDim2.fromScale(0.671189, 0.172873)}
								/>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.2} />

								<uistroke key={"UIStroke"} Color={Color3.fromRGB(49, 49, 49)} Thickness={3.7} />

								<uicorner key={"UICorner"} CornerRadius={new UDim(0.05, 0)} />

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(71, 111, 255)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(139, 245, 255)),
										])
									}
									Rotation={90}
								/>

								<frame
									key={"Frame"}
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									ClipsDescendants={true}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={UDim2.fromScale(1, 1)}
									ZIndex={0}
								>
									<imagelabel
										key={"ImageLabel"}
										AnchorPoint={new Vector2(0.5, 0)}
										BackgroundTransparency={1}
										LayoutOrder={1}
										Position={UDim2.fromScale(0.5, 0.281)}
										ScaleType={Enum.ScaleType.Fit}
										Size={UDim2.fromScale(0.495497, 0.426886)}
										ZIndex={2}
									>
										<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

										<imagelabel
											key={"ImageLabel"}
											AnchorPoint={new Vector2(0.5, 0.5)}
											BackgroundTransparency={1}
											Image={"rbxassetid://74071025346978"}
											LayoutOrder={1}
											Position={UDim2.fromScale(0.5, 0.667)}
											ScaleType={Enum.ScaleType.Fit}
											Size={UDim2.fromScale(2.57515, 2.57515)}
											ZIndex={2}
										>
											<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

											<uigradient
												key={"UIGradient"}
												Rotation={90}
												Transparency={
													new NumberSequence([
														new NumberSequenceKeypoint(0, 1),
														new NumberSequenceKeypoint(0.412718, 0.00624996),
														new NumberSequenceKeypoint(0.690773, 0.03125),
														new NumberSequenceKeypoint(1, 1),
													])
												}
											/>
										</imagelabel>
									</imagelabel>

									<uicorner key={"UICorner"} />

									<imagelabel
										AnchorPoint={new Vector2(0.5, 0.5)}
										BackgroundTransparency={1}
										Image={"rbxassetid://75925897645631"}
										key={"background"}
										Position={UDim2.fromScale(0.513166, 0.934417)}
										ScaleType={Enum.ScaleType.Fit}
										Size={UDim2.fromScale(6.95726, 7.34175)}
										SliceCenter={new Rect(402, 139, 402, 139)}
									/>
								</frame>
							</imagelabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"PetName"}
								Position={UDim2.fromScale(0.320319, 0.0692563)}
								Size={UDim2.fromScale(0.855224, 0.43204)}
								Text={"CODES"}
								TextColor3={Color3.fromRGB(33, 88, 136)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(33, 88, 136)} Thickness={2.6} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
									key={"PetName"}
									Position={UDim2.fromScale(0.539029, 0.450001)}
									Size={UDim2.fromScale(1.07806, 1)}
									Text={"CODES"}
									TextColor3={new Color3(1, 1, 1)}
									TextScaled={true}
									TextXAlignment={Enum.TextXAlignment.Left}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(33, 88, 136)} Thickness={2.6} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(99, 195, 255)),
												new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
											])
										}
										Rotation={-90}
									/>
								</textlabel>
							</textlabel>
						</frame>
					</imagelabel>
				</AnimatedButton>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.1, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
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
					productId={
						packNum === 0
							? gameConstants.DEVPRODUCT_IDS["StarterPack"]
							: gameConstants.DEVPRODUCT_IDS["MediumPack"]
					}
					productType={Enum.InfoType.Product}
					visible={limitedTimeLeft > 0 && limitedOffer[packNum] !== undefined}
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
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
								Position={UDim2.fromScale(0.5, 0.45)}
								Size={UDim2.fromScale(1, 1.01798)}
								Text={"BEST VALUE!"}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(33)}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
							id={
								packNum === 0
									? gameConstants.DEVPRODUCT_IDS["StarterPack"]
									: gameConstants.DEVPRODUCT_IDS["MediumPack"]
							}
							gamepassController={props.gamepassController}
							productType={Enum.InfoType.Product}
							textSize={35}
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
							Text={formatShortTime(limitedTimeLeft)}
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
							<AnimatedButton
								anchorPoint={new Vector2(0, 0.5)}
								backgroundColor={Color3.fromRGB(215, 46, 57)}
								backgroundTransparency={0}
								key={"Circle"}
								position={UDim2.fromScale(0, 0.5)}
								size={UDim2.fromScale(0.266667, 1)}
								onHover={() => {
									setPackHoverState(1);
								}}
								onLeave={() => {
									setPackHoverState(0);
								}}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

								<TooltipStats
									reward={
										limitedOffer[math.min(highestLimitedOfferPack(), limitedOffer.size() - 1)][0] ??
										""
									}
									visible={packHoverState === 1}
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
									TextSize={px(40)}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
										Position={UDim2.fromScale(0.5, 0.475)}
										Size={UDim2.fromScale(1, 1)}
										Text={"OP"}
										TextColor3={new Color3(1, 1, 1)}
										TextSize={px(40)}
										ZIndex={2}
									>
										<uistroke
											key={"UIStroke"}
											Color={Color3.fromRGB(116, 48, 13)}
											Thickness={px(3)}
										/>

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
							</AnimatedButton>

							<AnimatedButton
								anchorPoint={new Vector2(0.5, 0.5)}
								backgroundTransparency={0}
								backgroundColor={Color3.fromRGB(215, 46, 57)}
								key={"Circle"}
								position={UDim2.fromScale(0.5, 0.5)}
								size={UDim2.fromScale(0.266667, 1)}
								onHover={() => {
									setPackHoverState(2);
								}}
								onLeave={() => {
									setPackHoverState(0);
								}}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(138, 0, 0)}
									Thickness={px(3)}
									Transparency={0.5}
								/>

								<TooltipStats
									reward={
										limitedOffer[math.min(highestLimitedOfferPack(), limitedOffer.size() - 1)][1] ??
										""
									}
									visible={packHoverState === 2}
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
									TextSize={px(40)}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
										Position={UDim2.fromScale(0.5, 0.475)}
										Size={UDim2.fromScale(1, 1)}
										Text={"OP"}
										TextColor3={new Color3(1, 1, 1)}
										TextSize={px(40)}
										ZIndex={2}
									>
										<uistroke
											key={"UIStroke"}
											Color={Color3.fromRGB(116, 48, 13)}
											Thickness={px(3)}
										/>

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
							</AnimatedButton>

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
							textSize={35}
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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.5, 0.45)}
									Size={UDim2.fromScale(1, 1)}
									Text={"BEST VALUE!"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
								Image={"rbxassetid://83893510515400"}
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
								TextSize={px(SUBTITLE_PX)}
								// TextScaled={true}
								ZIndex={2}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.503289, 0.425)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"MOST PURCHASED!"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(SUBTITLE_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
								TextSize={px(27)}
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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.5, 0.45)}
									Size={UDim2.fromScale(1, 1)}
									Text={"10% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
						size={UDim2.fromScale(0.488, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["250k Big Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"2"}
							Size={UDim2.fromScale(1, 1)}
						>
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
								TextSize={px(SUBTITLE_PX)}
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
								TextSize={px(TAB_PX)}
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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.5, 0.45)}
									Size={UDim2.fromScale(1, 1)}
									Text={"15% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
						</imagelabel>
					</AnimatedProductButton>

					<AnimatedProductButton
						size={UDim2.fromScale(0.488, 0.970591)}
						productId={gameConstants.DEVPRODUCT_IDS["1M Massive Money Pack"]}
						productType={Enum.InfoType.Product}
					>
						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://96471574450859"}
							key={"3"}
							Size={UDim2.fromScale(1, 1)}
						>
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
								TextSize={px(SUBTITLE_PX)}
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
								TextSize={px(TAB_PX)}
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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.5, 0.45)}
									Size={UDim2.fromScale(1, 1)}
									Text={"20% EXTRA"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(PRODUCT_NAME_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
									Position={UDim2.fromScale(0.503289, 0.45)}
									Size={UDim2.fromScale(0.993423, 1)}
									Text={"BEST VALUE"}
									TextColor3={new Color3(1, 1, 1)}
									TextSize={px(SUBTITLE_PX)}
									// TextScaled={true}
									ZIndex={2}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

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
				<frame
					BackgroundTransparency={1}
					LayoutOrder={21}
					key={"PotionSection"}
					Position={UDim2.fromScale(-3.51042e-8, 0.756935)}
					Size={UDim2.fromScale(1, 0.158736)}
					ref={LABEL_REFS.potions}
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
						Text={"Potions"}
						TextColor3={Color3.fromRGB(60, 80, 138)}
						TextSize={px(PRODUCT_NAME_PX)}
						ZIndex={105}
					/>
				</frame>
				<frame
					BackgroundTransparency={1}
					LayoutOrder={22}
					key={"Potions"}
					Position={UDim2.fromScale(-3.51042e-8, -0.127963)}
					Size={UDim2.fromScale(1, 0.933657)}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						LayoutOrder={2}
						key={"LuckPotions"}
						Position={UDim2.fromScale(0.5, 0.679281)}
						Size={UDim2.fromScale(1, 0)}
					>
						<frame
							key={"Frame"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<frame
								BackgroundTransparency={1}
								key={"Info"}
								Position={UDim2.fromScale(0.048, 0.355)}
								Size={UDim2.fromScale(0.904161, 0.476351)}
								ZIndex={10}
							>
								<frame
									AnchorPoint={new Vector2(0, 0.5)}
									BackgroundTransparency={1}
									key={"Price"}
									Position={UDim2.fromScale(-0.0382387, 0.325321)}
									Size={UDim2.fromScale(0.281349, 1.56167)}
								>
									<BuyButton
										id={gameConstants.DEVPRODUCT_IDS["LuckPot"]}
										productType={Enum.InfoType.Product}
										gamepassController={props.gamepassController}
										position={UDim2.fromScale(0.373846, 0.5)}
										size={UDim2.fromScale(0.747692, 0.551847)}
										active={true}
									/>

									<uilistlayout
										key={"UIListLayout"}
										Padding={new UDim(0.03, 0)}
										SortOrder={Enum.SortOrder.LayoutOrder}
										VerticalAlignment={Enum.VerticalAlignment.Center}
									/>

									<AnimatedButton
										anchorPoint={new Vector2(0.5, 0.5)}
										key={"Use"}
										position={UDim2.fromScale(0.373846, 0.5)}
										size={UDim2.fromScale(0.747692, 0.551847)}
										clickable={mLuckPotions > 0}
										onClick={() => {
											Events.drinkPotion("M.Luck Potion");
										}}
									>
										<imagelabel
											SliceCenter={new Rect(47, 94, 539, 94)}
											SliceScale={0.2}
											Size={UDim2.fromScale(1, 1)}
											Image={"rbxassetid://84185381946335"}
											ScaleType={"Slice"}
											BackgroundTransparency={1}
										>
											<frame
												AnchorPoint={new Vector2(0.5, 0.5)}
												BackgroundTransparency={1}
												key={"DiscountNumber"}
												Position={UDim2.fromScale(0.5, 0.492049)}
												Size={UDim2.fromScale(0.829412, 0.524099)}
											>
												<uilistlayout
													key={"UIListLayout"}
													FillDirection={Enum.FillDirection.Horizontal}
													HorizontalAlignment={Enum.HorizontalAlignment.Center}
													Padding={new UDim(0.05, 0)}
													SortOrder={Enum.SortOrder.LayoutOrder}
													VerticalAlignment={Enum.VerticalAlignment.Center}
												/>

												<textlabel
													key={"TextLabel"}
													AnchorPoint={new Vector2(0.5, 0.5)}
													AutomaticSize={Enum.AutomaticSize.X}
													BackgroundTransparency={1}
													FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
													Position={UDim2.fromScale(0.682417, 0.499999)}
													Size={UDim2.fromScale(0.837304, 1.09019)}
													Text={`USE (${mLuckPotions})`}
													TextColor3={new Color3(1, 1, 1)}
													TextScaled={true}
													ZIndex={10}
												>
													<uistroke
														key={"UIStroke"}
														Color={Color3.fromRGB(111, 85, 19)}
														Thickness={2.5}
													/>

													<localscript key={"LocalScript"} Disabled={true} Enabled={false} />
												</textlabel>
											</frame>

											<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3} />

											<uigradient
												key={"UIGradient"}
												Color={
													new ColorSequence([
														new ColorSequenceKeypoint(0, Color3.fromRGB(255, 220, 114)),
														new ColorSequenceKeypoint(1, Color3.fromRGB(255, 216, 19)),
													])
												}
												Rotation={80}
											/>
										</imagelabel>
									</AnimatedButton>
								</frame>
							</frame>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://75925897645631"}
								key={"background"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(1, 1)}
								SliceCenter={new Rect(402, 139, 402, 139)}
							>
								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
											new ColorSequenceKeypoint(0.211073, new Color3(1, 1, 1)),
											new ColorSequenceKeypoint(0.214533, Color3.fromRGB(114, 202, 136)),
											new ColorSequenceKeypoint(0.219723, Color3.fromRGB(114, 202, 136)),
											new ColorSequenceKeypoint(0.221453, Color3.fromRGB(181, 255, 165)),
											new ColorSequenceKeypoint(0.32872, Color3.fromRGB(181, 255, 165)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(102, 255, 75)),
										])
									}
									Rotation={5}
								/>
							</imagelabel>

							<canvasgroup
								BackgroundTransparency={1}
								key={"Overlay"}
								Position={UDim2.fromScale(0.0117185, 0.064753)}
								Size={UDim2.fromScale(0.978331, 0.878045)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(-0.431884, -1.09537)}
									Size={UDim2.fromScale(0.497101, 2.30842)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.299761, 0.114712)}
									Rotation={30}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.410019, 0.728058)}
									Rotation={-20}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.626495, 0.398109)}
									Rotation={10}
									Size={UDim2.fromScale(0.130555, 0.827386)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.773019, -0.233578)}
									Rotation={-10}
									Size={UDim2.fromScale(0.0996755, 0.631687)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.118677, 0.494343)}
									Rotation={10}
									Size={UDim2.fromScale(0.124474, 0.788846)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(-0.0322354, -0.203606)}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://83090706261147"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.533467, -0.279723)}
									Rotation={10210}
									Size={UDim2.fromScale(0.0994351, 0.630163)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>
							</canvasgroup>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"Title"}
								Position={UDim2.fromScale(0.518805, 0.273568)}
								Size={UDim2.fromScale(0.497406, 0.316703)}
								Text={"Luck Potions"}
								TextColor3={new Color3()}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(71, 71, 71)} Thickness={2.5} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
									key={"Title"}
									Position={UDim2.fromScale(0.5, 0.43)}
									Size={UDim2.fromScale(1, 1)}
									Text={"Luck Potions"}
									TextColor3={new Color3(1, 1, 1)}
									TextScaled={true}
									TextXAlignment={Enum.TextXAlignment.Left}
									ZIndex={10}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(71, 71, 71)} Thickness={2.5} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(43, 190, 55)),
												new ColorSequenceKeypoint(0.515571, Color3.fromRGB(183, 255, 178)),
												new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
											])
										}
										Rotation={-90}
									/>
								</textlabel>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"Title"}
								Position={UDim2.fromScale(0.496803, 0.576794)}
								Size={UDim2.fromScale(0.454013, 0.254452)}
								Text={"More luck for 10m!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(68, 68, 68)} Thickness={2.3} />
							</textlabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://83090706261147"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.783691, -0.140339)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.232795, 1.32409)}
								ZIndex={2}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

								<uigradient
									key={"UIGradient"}
									Rotation={90}
									Transparency={
										new NumberSequence([
											new NumberSequenceKeypoint(0, 0),
											new NumberSequenceKeypoint(0.708229, 0.025),
											new NumberSequenceKeypoint(0.832918, 1),
											new NumberSequenceKeypoint(1, 1),
										])
									}
								/>
							</imagelabel>
						</frame>
					</frame>

					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						LayoutOrder={2}
						key={"StrengthPotions"}
						Position={UDim2.fromScale(0.5, 0.679281)}
						Size={UDim2.fromScale(1, 0)}
					>
						<frame
							key={"Frame"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
						>
							<frame
								BackgroundTransparency={1}
								key={"Info"}
								Position={UDim2.fromScale(0.048, 0.355)}
								Size={UDim2.fromScale(0.904161, 0.476351)}
								ZIndex={10}
							>
								<frame
									AnchorPoint={new Vector2(0, 0.5)}
									BackgroundTransparency={1}
									key={"Price"}
									Position={UDim2.fromScale(-0.0382387, 0.325321)}
									Size={UDim2.fromScale(0.281349, 1.56167)}
								>
									<BuyButton
										id={gameConstants.DEVPRODUCT_IDS["StrengthPot"]}
										productType={Enum.InfoType.Product}
										gamepassController={props.gamepassController}
										position={UDim2.fromScale(0.373846, 0.5)}
										size={UDim2.fromScale(0.747692, 0.551847)}
										active={true}
										layoutOrder={0}
									/>

									<uilistlayout
										key={"UIListLayout"}
										Padding={new UDim(0.03, 0)}
										SortOrder={Enum.SortOrder.LayoutOrder}
										VerticalAlignment={Enum.VerticalAlignment.Center}
									/>

									<AnimatedButton
										anchorPoint={new Vector2(0.5, 0.5)}
										layoutOrder={1}
										key={"Use"}
										position={UDim2.fromScale(0.373846, 0.5)}
										size={UDim2.fromScale(0.747692, 0.551847)}
										clickable={mStrengthPotions > 0}
										onClick={() => {
											Events.drinkPotion("M.Strength Potion");
										}}
									>
										<imagelabel
											SliceCenter={new Rect(47, 94, 539, 94)}
											SliceScale={0.2}
											Size={UDim2.fromScale(1, 1)}
											Image={"rbxassetid://84185381946335"}
											ScaleType={"Slice"}
											BackgroundTransparency={1}
										>
											<frame
												AnchorPoint={new Vector2(0.5, 0.5)}
												BackgroundTransparency={1}
												key={"DiscountNumber"}
												Position={UDim2.fromScale(0.5, 0.492049)}
												Size={UDim2.fromScale(0.829412, 0.524099)}
											>
												<uilistlayout
													key={"UIListLayout"}
													FillDirection={Enum.FillDirection.Horizontal}
													HorizontalAlignment={Enum.HorizontalAlignment.Center}
													Padding={new UDim(0.05, 0)}
													SortOrder={Enum.SortOrder.LayoutOrder}
													VerticalAlignment={Enum.VerticalAlignment.Center}
												/>

												<textlabel
													key={"TextLabel"}
													AnchorPoint={new Vector2(0.5, 0.5)}
													AutomaticSize={Enum.AutomaticSize.X}
													BackgroundTransparency={1}
													FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
													Position={UDim2.fromScale(0.682417, 0.499999)}
													Size={UDim2.fromScale(0.837304, 1.09019)}
													Text={`USE (${mStrengthPotions})`}
													TextColor3={new Color3(1, 1, 1)}
													TextScaled={true}
													ZIndex={10}
												>
													<uistroke
														key={"UIStroke"}
														Color={Color3.fromRGB(111, 85, 19)}
														Thickness={2.5}
													/>

													<localscript key={"LocalScript"} Disabled={true} Enabled={false} />
												</textlabel>
											</frame>

											<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3} />

											<uigradient
												key={"UIGradient"}
												Color={
													new ColorSequence([
														new ColorSequenceKeypoint(0, Color3.fromRGB(255, 220, 114)),
														new ColorSequenceKeypoint(1, Color3.fromRGB(255, 216, 19)),
													])
												}
												Rotation={80}
											/>
										</imagelabel>
									</AnimatedButton>
								</frame>
							</frame>

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								Image={"rbxassetid://75925897645631"}
								key={"background"}
								Position={UDim2.fromScale(0.5, 0.5)}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(1, 1)}
								SliceCenter={new Rect(402, 139, 402, 139)}
							>
								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
											new ColorSequenceKeypoint(0.211073, new Color3(1, 1, 1)),
											new ColorSequenceKeypoint(0.214533, Color3.fromRGB(150, 97, 255)),
											new ColorSequenceKeypoint(0.219723, Color3.fromRGB(150, 97, 255)),
											new ColorSequenceKeypoint(0.221453, Color3.fromRGB(255, 179, 249)),
											new ColorSequenceKeypoint(0.33391, Color3.fromRGB(255, 179, 249)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(184, 61, 255)),
										])
									}
									Rotation={5}
								/>
							</imagelabel>

							<canvasgroup
								BackgroundTransparency={1}
								key={"Overlay"}
								Position={UDim2.fromScale(0.0117185, 0.064753)}
								Size={UDim2.fromScale(0.978331, 0.878045)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(-0.431884, -1.09537)}
									Size={UDim2.fromScale(0.497101, 2.30842)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.299761, 0.114712)}
									Rotation={30}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.410019, 0.728058)}
									Rotation={-20}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.626495, 0.398109)}
									Rotation={10}
									Size={UDim2.fromScale(0.130555, 0.827386)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.773019, -0.233578)}
									Rotation={-10}
									Size={UDim2.fromScale(0.0996755, 0.631687)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.118677, 0.494343)}
									Rotation={10}
									Size={UDim2.fromScale(0.124474, 0.788846)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(-0.0322354, -0.203606)}
									Size={UDim2.fromScale(0.110874, 0.496703)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundTransparency={1}
									Image={"rbxassetid://80631854554558"}
									ImageTransparency={0.8}
									key={"Money Cover"}
									Position={UDim2.fromScale(0.533467, -0.279723)}
									Rotation={10210}
									Size={UDim2.fromScale(0.0994351, 0.630163)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>
							</canvasgroup>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"Title"}
								Position={UDim2.fromScale(0.518805, 0.273568)}
								Size={UDim2.fromScale(0.497406, 0.316703)}
								Text={"Strength Potions"}
								TextColor3={new Color3()}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(71, 71, 71)} Thickness={2.5} />

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
									key={"Title"}
									Position={UDim2.fromScale(0.5, 0.43)}
									Size={UDim2.fromScale(1, 1)}
									Text={"Strength Potions"}
									TextColor3={new Color3(1, 1, 1)}
									TextScaled={true}
									TextXAlignment={Enum.TextXAlignment.Left}
									ZIndex={10}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(71, 71, 71)} Thickness={2.5} />

									<uigradient
										key={"UIGradient"}
										Color={
											new ColorSequence([
												new ColorSequenceKeypoint(0, Color3.fromRGB(111, 39, 255)),
												new ColorSequenceKeypoint(0.512111, Color3.fromRGB(250, 199, 255)),
												new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
											])
										}
										Rotation={-90}
									/>
								</textlabel>
							</textlabel>

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"Title"}
								Position={UDim2.fromScale(0.4836, 0.574013)}
								Size={UDim2.fromScale(0.427607, 0.24889)}
								Text={"More strength for 10m!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(68, 68, 68)} Thickness={2.3} />
							</textlabel>

							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://130116642788720"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.783691, -0.140339)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.232795, 1.32409)}
								ZIndex={2}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

								<uigradient
									key={"UIGradient"}
									Rotation={90}
									Transparency={
										new NumberSequence([
											new NumberSequenceKeypoint(0, 0),
											new NumberSequenceKeypoint(0.708229, 0.025),
											new NumberSequenceKeypoint(0.832918, 1),
											new NumberSequenceKeypoint(1, 1),
										])
									}
								/>
							</imagelabel>
						</frame>
					</frame>

					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						VerticalFlex={Enum.UIFlexAlignment.Fill}
						Wraps={true}
					/>
				</frame>

				<frame
					BackgroundTransparency={1}
					LayoutOrder={24}
					key={"Codes"}
					Position={UDim2.fromScale(-3.51042e-8, 0.756935)}
					Size={UDim2.fromScale(1, 0.158736)}
					ref={LABEL_REFS.codes}
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
						Text={"Codes"}
						TextColor3={Color3.fromRGB(60, 80, 138)}
						TextSize={px(22)}
						ZIndex={105}
					/>
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					LayoutOrder={25}
					key={"Codes"}
					Position={UDim2.fromScale(0.5, 0.643839)}
					Size={UDim2.fromScale(1, 0.712323)}
				>
					<frame
						key={"Frame"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
					>
						<frame
							BackgroundTransparency={1}
							key={"Info"}
							Position={UDim2.fromScale(0.048, 0.355)}
							Size={UDim2.fromScale(0.904161, 0.476351)}
							ZIndex={10}
						/>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://75925897645631"}
							key={"background"}
							Position={UDim2.fromScale(0.5, 0.5)}
							ScaleType={Enum.ScaleType.Slice}
							Size={UDim2.fromScale(1, 1)}
							SliceCenter={new Rect(402, 139, 402, 139)}
						>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(71, 111, 255)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(139, 245, 255)),
									])
								}
								Rotation={90}
							/>
						</imagelabel>

						<frame
							key={"Frame"}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							ClipsDescendants={true}
							Position={UDim2.fromScale(0.079, -0.932316)}
							Size={UDim2.fromScale(0.264531, 3.75172)}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
							key={"Title"}
							Position={UDim2.fromScale(0.5, 0.84)}
							Size={UDim2.fromScale(0.87563, 0.207925)}
							Text={"Join our Community in social links for exclusive OP Codes!"}
							TextColor3={Color3.fromRGB(61, 61, 61)}
							TextScaled={true}
							ZIndex={5}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(61, 61, 61)} Thickness={px(1.5)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.45)}
								Size={UDim2.fromScale(1, 1)}
								Text={"Join our Community in social links for exclusive OP Codes!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								ZIndex={5}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(61, 61, 61)} Thickness={px(1.5)} />
							</textlabel>
						</textlabel>

						<AnimatedButton
							onClick={() => {
								if (enteredCode === "") {
									Signals.invalidAction.Fire("Enter a code first!");
									return;
								}
								Events.verifyCode(enteredCode);
							}}
							size={UDim2.fromScale(0.325, 0.3)}
							position={UDim2.fromScale(0.765, 0.45)}
							anchorPoint={new Vector2(0.5, 0)}
						>
							<imagelabel
								BackgroundTransparency={1}
								Image={"rbxassetid://92239062767450"}
								key={"ApplyButton"}
								ScaleType={Enum.ScaleType.Slice}
								Size={UDim2.fromScale(1, 1)}
								SliceCenter={new Rect(47, 94, 539, 94)}
								ZIndex={2}
							>
								<frame
									AnchorPoint={new Vector2(0.5, 0.5)}
									BackgroundTransparency={1}
									key={"Discount Number"}
									Position={UDim2.fromScale(0.5, 0.492049)}
									Size={UDim2.fromScale(0.829412, 0.524099)}
								>
									<uilistlayout
										key={"UIListLayout"}
										FillDirection={Enum.FillDirection.Horizontal}
										HorizontalAlignment={Enum.HorizontalAlignment.Center}
										Padding={new UDim(0.05, 0)}
										SortOrder={Enum.SortOrder.LayoutOrder}
										VerticalAlignment={Enum.VerticalAlignment.Center}
									/>

									<textlabel
										AnchorPoint={new Vector2(0.5, 0.5)}
										AutomaticSize={Enum.AutomaticSize.X}
										BackgroundTransparency={1}
										FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
										key={"Timer"}
										Position={UDim2.fromScale(0.573305, 0.500001)}
										Size={UDim2.fromScale(0.490753, 1.09019)}
										Text={"Verify"}
										TextColor3={new Color3(1, 1, 1)}
										// TextScaled={true}
										TextSize={px(30)}
										ZIndex={10}
									>
										<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 66, 34)} Thickness={2.5} />
									</textlabel>
								</frame>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={2.9} />
							</imagelabel>
						</AnimatedButton>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://84185381946335"}
							key={"TextBoxBackground"}
							Position={UDim2.fromScale(0.5074, 0.172461)}
							ScaleType={Enum.ScaleType.Slice}
							Size={UDim2.fromScale(0.476607, 0.26199)}
							SliceCenter={new Rect(434, 120, 434, 120)}
							SliceScale={0.2}
							ZIndex={5}
						>
							<textbox
								key={"TextBox"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
								PlaceholderColor3={Color3.fromRGB(16, 16, 16)}
								Position={UDim2.fromScale(0.5, 0.48461)}
								Size={UDim2.fromScale(0.887032, 0.622156)}
								Text={""}
								TextColor3={Color3.fromRGB(16, 16, 16)}
								TextScaled={true}
								PlaceholderText={"Enter Code"}
								TextTransparency={0.4}
								ZIndex={5}
								Event={{
									FocusLost: (box, enterPressed) => {
										setEnteredCode(box.Text);

										if (enterPressed) {
											if (box.Text === "") {
												Signals.invalidAction.Fire("Enter a code first!");
												return;
											}
											Events.verifyCode(box.Text);
										}
									},
								}}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(0.2, 0)} />
							</textbox>

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(201, 255, 237)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(139, 245, 255)),
									])
								}
								Rotation={90}
							/>
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://94467002753149"}
							key={"Money Cover"}
							Position={UDim2.fromScale(0.0355239, -0.162013)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.401657, 1.00502)}
							ZIndex={2}
						>
							<uigradient
								key={"UIGradient"}
								Rotation={90}
								Transparency={
									new NumberSequence([
										new NumberSequenceKeypoint(0, 0),
										new NumberSequenceKeypoint(0.653367, 0),
										new NumberSequenceKeypoint(1, 1),
									])
								}
							/>
						</imagelabel>

						<imagelabel
							BackgroundTransparency={1}
							Image={"rbxassetid://127815852198424"}
							ImageTransparency={0.3}
							key={"Money Cover"}
							Position={UDim2.fromScale(-0.0111411, -0.154216)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.492551, 1.1792)}
						>
							<uigradient
								key={"UIGradient"}
								Rotation={90}
								Transparency={
									new NumberSequence([
										new NumberSequenceKeypoint(0, 0),
										new NumberSequenceKeypoint(0.376559, 0.5375),
										new NumberSequenceKeypoint(1, 1),
									])
								}
							/>
						</imagelabel>
					</frame>
				</frame>
			</scrollingframe>
		</frame>
	);
};
