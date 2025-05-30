import React, { useEffect, useState } from "@rbxts/react";
import { MarketplaceService, Players, SocialService } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";
import { AnimatedButton } from "./buttons";
import UiController from "client/controllers/uiController";
import { useMotion } from "@rbxts/pretty-react-hooks";
import { Signals } from "shared/signals";
import { PotionConfig, potionConfig, PotionKind } from "shared/config/potionConfig";
import { Events, Functions } from "client/network";
import { formatShortTime } from "shared/util/nameUtil";
import { springs } from "client/utils/springs";

interface PotionProps {
	cfg: PotionConfig;
	potionName: keyof typeof potionConfig;
	onComplete: () => void;
	timeLeft?: number;
	updateId?: number;
	paused?: boolean;
}

const PotionTimer = (props: PotionProps) => {
	const [timeLeft, setTimeLeft] = useState(props.timeLeft ?? props.cfg.duration);
	const [paused, setPaused] = useState(props.paused);

	const px = usePx();

	useEffect(() => {
		setPaused(props.paused);
	}, [props.paused]);

	useEffect(() => {
		setTimeLeft(props.timeLeft ?? props.cfg.duration);

		let running = true;

		const timer = async () => {
			while (running) {
				await Promise.delay(1);
				if (!paused) {
					// Only decrease timer if not paused
					setTimeLeft((prev) => {
						if (prev > 0) {
							return math.max(prev - 1, 0);
						} else {
							props.onComplete();
							return 0;
						}
					});
				}
			}
		};

		timer();

		return () => {
			running = false;
		};
	}, [props.timeLeft, props.updateId, paused]);

	return (
		<imagelabel
			Image={props.cfg.itemImage}
			BackgroundTransparency={1}
			Size={UDim2.fromScale(1, 1)}
			AnchorPoint={new Vector2(0, 1)}
			LayoutOrder={props.timeLeft}
			key={props.potionName}
			ScaleType={"Fit"}
			ZIndex={1}
			Visible={!props.paused}
		>
			<uiaspectratioconstraint AspectRatio={1} />

			<textlabel
				Text={formatShortTime(timeLeft)}
				FontFace={Font.fromEnum(Enum.Font.BuilderSansBold)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0, 1)}
				Position={UDim2.fromScale(0, 1)}
				Size={UDim2.fromScale(1, 0.3)}
				TextScaled={true}
				TextXAlignment={Enum.TextXAlignment.Center}
				TextColor3={new Color3(1, 1, 1)}
			>
				<uistroke Thickness={px(2)} />
			</textlabel>
		</imagelabel>
	);
};

interface BottomTipsProps {
	uiController: UiController;
}

const DEFAULT_POS = UDim2.fromScale(0.01, 0.99);
const CLOSED_POS = UDim2.fromScale(0.01, 1.15);

export const BottomTips = (props: BottomTipsProps) => {
	const [hoveringPremium, setHoveringPremium] = useState(false);
	const [hoveringFriend, setHoveringFriend] = useState(false);
	const [menuPos, menuPosMotion] = useMotion(DEFAULT_POS);
	const [currentPotions, setCurrentPotions] = useState(new Array<PotionProps>());
	const [visiblePotions, setVisiblePotions] = useState(new Array<PotionProps>());
	const [canInvite, setCanInvite] = useState(true);
	const [ingameFriends, setIngameFriends] = useState(0);

	const px = usePx();

	const updatePotions = (potions: (PotionConfig & { potionName: keyof typeof potionConfig; timeLeft: number })[]) => {
		let newPotions = potions.map((potion) => ({
			cfg: potionConfig[potion.potionName],
			potionName: potion.potionName,
			timeLeft: potion.timeLeft,
			onComplete: () => {
				removePotion(potion.potionName);
			},
		}));

		// Find highest multiplier for each kind
		const highestMultiplierByKind = new Map<PotionKind, number>();
		for (const p of newPotions) {
			if (
				!highestMultiplierByKind.has(p.cfg.kind) ||
				p.cfg.multiplier > (highestMultiplierByKind.get(p.cfg.kind) ?? 0)
			) {
				highestMultiplierByKind.set(p.cfg.kind, p.cfg.multiplier);
			}
		}

		// Mark lower multipliers as paused
		newPotions = newPotions.map((p) => ({
			...p,
			paused: p.cfg.multiplier < (highestMultiplierByKind.get(p.cfg.kind) ?? 0),
		}));

		setCurrentPotions(newPotions);
	};

	const removePotion = (potionName: keyof typeof potionConfig) => {
		setCurrentPotions((prev) => prev.filter((v) => v.potionName !== potionName));
	};

	useEffect(() => {
		Signals.menuOpened.Connect((isOpen) => {
			menuPosMotion.spring(isOpen ? CLOSED_POS : DEFAULT_POS, springs.responsive);
		});

		Functions.getActivePotions.invoke().then((potions) => {
			if (!potions) return;
			updatePotions(potions);
		});

		Events.updateActivePotions.connect((potions) => {
			updatePotions(potions);
		});

		if (!SocialService.CanSendGameInviteAsync(Players.LocalPlayer)) {
			setCanInvite(false);
		}

		const countFriendsIngame = () => {
			let pages = Players.GetFriendsAsync(Players.LocalPlayer.UserId);
			const friendIds: number[] = [];

			while (true) {
				pages.GetCurrentPage().forEach((fi) => friendIds.push(fi.Id));
				if (pages.IsFinished) break;
				pages.AdvanceToNextPageAsync();
			}

			let count = 0;

			for (const id of friendIds) {
				if (Players.GetPlayerByUserId(id)) {
					++count;
				}
			}

			setIngameFriends(count);
		};

		countFriendsIngame();

		Players.PlayerAdded.Connect(() => {
			countFriendsIngame();
		});

		Players.PlayerRemoving.Connect(() => {
			countFriendsIngame();
		});
	}, []);

	useEffect(() => {
		setVisiblePotions(
			currentPotions.filter((potion, _, arr) => {
				const highest = math.max(
					...arr.filter((p) => p.cfg.kind === potion.cfg.kind).map((p) => p.cfg.multiplier),
				);
				return potion.cfg.multiplier === highest && !potion.paused;
			}),
		);
	}, [currentPotions]);

	return (
		<frame
			AnchorPoint={new Vector2(0, 1)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Position={menuPos}
			Size={UDim2.fromScale(1, 0.1)}
			ZIndex={100}
			Visible={true}
		>
			<uilistlayout
				FillDirection={"Horizontal"}
				Padding={new UDim(0, 15)}
				VerticalAlignment={"Bottom"}
				SortOrder={"LayoutOrder"}
			/>

			<AnimatedButton
				layoutOrder={0}
				position={UDim2.fromScale(0, 1)}
				size={UDim2.fromScale(0.033, 1)}
				anchorPoint={new Vector2(0, 1)}
				onClick={() => {
					MarketplaceService.PromptPremiumPurchase(Players.LocalPlayer);
				}}
				onHover={() => {
					setHoveringPremium(true);
				}}
				onLeave={() => {
					setHoveringPremium(false);
				}}
			>
				<uiaspectratioconstraint AspectRatio={1} />
				<textlabel
					FontFace={Font.fromEnum(Enum.Font.Bangers)}
					key={"Premium"}
					Text={""}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
				>
					<uistroke key={"UIStroke"} Thickness={px(3.5)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"Timer"}
						Position={UDim2.fromScale(0.5, 0.84918)}
						Size={UDim2.fromScale(0.9, 0.401635)}
						Text={` +${Players.LocalPlayer.MembershipType === Enum.MembershipType.Premium ? "10" : "0"}%`}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
					>
						<uistroke
							key={"UIStroke"}
							Color={Color3.fromRGB(5, 35, 55)}
							LineJoinMode={Enum.LineJoinMode.Miter}
							Thickness={px(3)}
						/>

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
									new ColorSequenceKeypoint(0.223183, Color3.fromRGB(255, 237, 87)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(255, 139, 56)),
								])
							}
							Rotation={90}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						AutomaticSize={Enum.AutomaticSize.Y}
						BackgroundColor3={new Color3()}
						BackgroundTransparency={0.3}
						BorderColor3={Color3.fromRGB(27, 42, 53)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"ToolTip"}
						Position={UDim2.fromScale(3.82001, -0.59)}
						Size={UDim2.fromScale(7, 0.4)}
						Text={"Premium users get +10% money and +10% experience!"}
						TextColor3={new Color3(1, 1, 1)}
						// TextScaled={true}
						TextSize={px(15)}
						TextWrapped={true}
						TextTransparency={0.1}
						ZIndex={100}
						Visible={hoveringPremium}
					>
						<uistroke
							key={"UIStroke"}
							ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
							Thickness={px(10)}
							Transparency={0.3}
						/>
						<uistroke
							key={"UIStroke"}
							ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
							Thickness={px(2)}
							Transparency={0.3}
							Color={new Color3()}
						/>
					</textlabel>
				</textlabel>
			</AnimatedButton>

			<AnimatedButton
				layoutOrder={1}
				key={"Friends"}
				size={UDim2.fromScale(0.033, 1)}
				onClick={() => {
					if (canInvite) {
						SocialService.PromptGameInvite(Players.LocalPlayer);
					}
				}}
				onHover={() => {
					setHoveringFriend(true);
				}}
				onLeave={() => {
					setHoveringFriend(false);
				}}
				anchorPoint={new Vector2(0.5, 1)}
			>
				<uiaspectratioconstraint />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://99636606211613"}
					key={"IMG"}
					Position={UDim2.fromScale(0.5, 0.48)}
					Size={UDim2.fromScale(0.929516, 0.929516)}
				>
					<uiscale key={"UIScale"} />
				</imagelabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.3}
					BorderColor3={Color3.fromRGB(27, 42, 53)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"ToolTip"}
					Position={UDim2.fromScale(3.82001, -0.59)}
					Size={UDim2.fromScale(7, 0.4)}
					Text={"Gain +5% money and +5% experience for every friend that joins!"}
					TextColor3={new Color3(1, 1, 1)}
					// TextScaled={true}
					TextSize={px(12)}
					TextWrapped={true}
					TextTransparency={0.1}
					ZIndex={100}
					Visible={hoveringFriend}
				>
					<uistroke
						key={"UIStroke"}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
						Thickness={px(10)}
						Transparency={0.3}
					/>
					<uistroke
						key={"UIStroke"}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
						Thickness={px(2)}
						Transparency={0.3}
						Color={new Color3()}
					/>
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Timer"}
					Position={UDim2.fromScale(0.5, 0.84918)}
					Size={UDim2.fromScale(0.9, 0.401635)}
					Text={`+${math.min(15, 5 * ingameFriends)}%`}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<uistroke
						key={"UIStroke"}
						Color={Color3.fromRGB(5, 35, 55)}
						LineJoinMode={Enum.LineJoinMode.Miter}
						Thickness={px(3)}
					/>

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
								new ColorSequenceKeypoint(0.223183, Color3.fromRGB(255, 237, 87)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(255, 139, 56)),
							])
						}
						Rotation={90}
					/>
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"Plus"}
					Position={UDim2.fromScale(0.891626, 0.152336)}
					Size={UDim2.fromScale(0.67968, 0.67968)}
					Text={"+"}
					TextColor3={Color3.fromRGB(126, 255, 21)}
					TextScaled={true}
				>
					<uistroke
						key={"UIStroke"}
						Color={Color3.fromRGB(9, 55, 12)}
						LineJoinMode={Enum.LineJoinMode.Miter}
						Thickness={px(1)}
					/>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</textlabel>
			</AnimatedButton>

			<frame
				Size={UDim2.fromScale(0.1, 1)}
				AutomaticSize={"X"}
				BackgroundTransparency={1}
				LayoutOrder={2}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
			>
				<uilistlayout
					FillDirection={"Horizontal"}
					Padding={new UDim(0, px(10))}
					SortOrder={"LayoutOrder"}
					VerticalAlignment={"Bottom"}
				/>

				{visiblePotions.map((v) => {
					return (
						<PotionTimer
							cfg={v.cfg}
							potionName={v.potionName}
							timeLeft={v.timeLeft}
							onComplete={v.onComplete}
							updateId={v.updateId}
							paused={v.paused}
						/>
					);
				})}
			</frame>
		</frame>
	);
};
