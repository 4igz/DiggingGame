import React, { useEffect, useRef, useState } from "@rbxts/react";
import { usePx } from "client/hooks/usePx";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { useSliceScale } from "client/hooks/useSlice";
import { AnimatedButton } from "./buttons";
import { Events } from "client/network";
import { Signals } from "shared/signals";
import { MarketplaceService, Players } from "@rbxts/services";
import { canClaimedTimedReward } from "client/atoms/uiAtoms";

const REQUIRED_TIME_MINUTES = gameConstants.TIMED_REWARD_WAIT_TIME;

export const FreeTimedRewardMenu = (props: { uiController: UiController; visible: boolean }) => {
	const [visible, setVisible] = useState(false);
	const [popInPos, popInMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [minutes, setMinutes] = useState(3);
	const px = usePx();
	const scaledSlice = useSliceScale();

	useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.5, 0.475), springs.responsive);

			const connection = Events.claimedTimedReward.connect(() => {
				props.uiController.closeCurrentOpenMenu();
			});

			return () => {
				connection.Disconnect();
			};
		} else {
			popInMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		const thread = task.spawn(() => {
			if (minutes < REQUIRED_TIME_MINUTES) {
				task.wait(60);
				setMinutes((prev) => ++prev);
			} else {
				canClaimedTimedReward(true);
				Signals.actionPopup.Fire("Pack ready!");
			}
		});

		return () => {
			task.cancel(thread);
		};
	}, [minutes]);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image={"rbxassetid://14530877101"}
			ImageColor3={Color3.fromRGB(0, 85, 127)}
			key={"FreePack"}
			Position={popInPos}
			ScaleType={Enum.ScaleType.Slice}
			Size={UDim2.fromScale(0.536, 0.603)}
			SliceCenter={new Rect(206, 162, 218, 207)}
			SliceScale={scaledSlice(0.16)}
			Visible={visible}
		>
			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.7} />
			<uiscale key={"UIScale"} />

			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"MenuText"}
				Position={UDim2.fromScale(0.832886, 0.730208)}
				Size={UDim2.fromScale(0.103596, 0.0911497)}
				Text={"OR"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				ZIndex={5}
			>
				<uistroke key={"UIStroke"} Thickness={px(3)} />
			</textlabel>

			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"MenuText"}
				Position={UDim2.fromScale(0.236963, 0.847734)}
				Size={UDim2.fromScale(0.239653, 0.113611)}
				Text={"FREE"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				ZIndex={5}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(31, 31, 31)} Thickness={px(3)} />
			</textlabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://13456230901"}
				ImageColor3={Color3.fromRGB(6, 72, 255)}
				key={"imageBurst11"}
				Position={UDim2.fromScale(0.219597, 0.423571)}
				Size={UDim2.fromScale(0.395187, 0.671818)}
				ZIndex={2}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
			</imagelabel>

			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"MenuText"}
				Position={UDim2.fromScale(0.231871, 0.747038)}
				Size={UDim2.fromScale(0.219484, 0.10405)}
				Text={"699R$"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				ZIndex={5}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={px(3)} />

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(12, 255, 40)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(123, 255, 83)),
						])
					}
					Rotation={90}
				/>
			</textlabel>

			<imagelabel
				BackgroundTransparency={1}
				Image={"rbxassetid://77934386944359"}
				key={".6"}
				Position={UDim2.fromScale(0.0607565, 0.171885)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.349617, 0.487439)}
				ZIndex={11}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://105628174237609"}
				key={".$ImageLabel"}
				Position={UDim2.fromScale(0.185291, 0.372654)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.132058, 0.293411)}
				ZIndex={20}
			>
				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.945742, 0.748929)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.262258, 0.262258)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.0315809, 0.208903)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.209279, 0.209279)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.816955, 0.891513)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.175156, 0.175156)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://13456230901"}
				key={"imageBurst22"}
				Position={UDim2.fromScale(0.219597, 0.423571)}
				Rotation={5}
				Size={UDim2.fromScale(0.395187, 0.671818)}
				ZIndex={2}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
			</imagelabel>

			<textlabel
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)}
				key={"OP"}
				Position={UDim2.fromScale(-0.0280189, 0.119137)}
				Size={UDim2.fromScale(0.329027, 0.202027)}
				Text={"OP"}
				TextColor3={Color3.fromRGB(116, 48, 13)}
				TextSize={px(45)}
				ZIndex={20}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(116, 48, 13)} Thickness={px(3)} />

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)}
					key={"OP"}
					Position={UDim2.fromScale(0.5, 0.481157)}
					Size={UDim2.fromScale(1, 1.01232)}
					Text={"OP"}
					TextColor3={new Color3(1, 1, 1)}
					TextSize={px(45)}
					ZIndex={20}
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
				FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
				key={"MenuText"}
				Position={UDim2.fromScale(0.681989, 0.528376)}
				Size={UDim2.fromScale(0.551818, 0.0885697)}
				Text={"Don't Leave The Game!!"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				ZIndex={5}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={px(3)} />
			</textlabel>

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				key={"TopFrame"}
				Position={UDim2.fromScale(0.468243, 0.0101046)}
				Size={UDim2.fromScale(0.486486, 0.154791)}
				ZIndex={5}
			>
				<imagelabel
					Active={true}
					BackgroundTransparency={1}
					Image={"rbxassetid://104244100672277"}
					ImageColor3={Color3.fromRGB(56, 245, 232)}
					key={"Background"}
					Position={UDim2.fromScale(-0.418299, 0.0869478)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(0.923786, 0.9141)}
					SliceCenter={new Rect(111, 136, 519, 595)}
					SliceScale={scaledSlice(0.3)}
					ZIndex={4}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"MenuText"}
						Position={UDim2.fromScale(0.499507, 0.492276)}
						Size={UDim2.fromScale(0.741185, 0.741185)}
						Text={"Free OP Shovel Pack"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={5}
					>
						<uistroke key={"UIStroke"} Thickness={px(3.8)}>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(86, 46, 11)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(86, 46, 11)),
									])
								}
								Rotation={90}
							/>
						</uistroke>
					</textlabel>

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(103, 220, 255)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(187, 89, 204)),
							])
						}
						Rotation={180}
					/>
				</imagelabel>
			</frame>

			<imagelabel
				Active={true}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://104244100672277"}
				key={"TopFrame2"}
				Position={UDim2.fromScale(0.694529, 0.187)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.512, 0.257322)}
				SliceCenter={new Rect(83, 94, 523, 634)}
				SliceScale={scaledSlice(0.18)}
				ZIndex={5}
			>
				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.569999993, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://13468798448"}
					Position={UDim2.fromScale(0.109874, 0.489143)}
					Size={UDim2.fromScale(0.128413, 0.431325)}
					ZIndex={5}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />
				</imagelabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"MenuText"}
					Position={UDim2.fromScale(0.474761, -0.0514808)}
					Size={UDim2.fromScale(0.823026, 0.405913)}
					Text={`${REQUIRED_TIME_MINUTES - minutes} Minutes Remaining!`}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					ZIndex={5}
					Visible={minutes < REQUIRED_TIME_MINUTES}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={px(3)} />

					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(238, 255, 83)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(255, 151, 33)),
							])
						}
						Rotation={90}
					/>
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
					key={"MenuText"}
					Position={UDim2.fromScale(0.384919, 0.489887)}
					Size={UDim2.fromScale(0.349946, 0.567489)}
					Text={`Play for ${REQUIRED_TIME_MINUTES} Minutes!`}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={5}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(34, 34, 34)} Thickness={px(3)} />
				</textlabel>

				<imagelabel
					BackgroundTransparency={1}
					Image={"rbxassetid://14530877101"}
					ImageColor3={Color3.fromRGB(132, 123, 123)}
					key={"Bar"}
					Position={UDim2.fromScale(0.613596, 0.309143)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(0.362, 0.384)}
					SliceCenter={new Rect(197, 189, 223, 206)}
					SliceScale={scaledSlice(0.2)}
					ZIndex={5}
				>
					<frame BackgroundTransparency={1} key={"M"} Size={UDim2.fromScale(1, 1)} ZIndex={10}>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.15, 0)} />
					</frame>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.GothamBlack)}
						key={"Amount"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 0.802)}
						Text={`${minutes}/${REQUIRED_TIME_MINUTES}`}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={9}
					>
						<uistroke key={"UIStroke"} Thickness={px(3)} />
					</textlabel>

					<imagelabel
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://14530877101"}
						ImageColor3={Color3.fromRGB(255, 238, 238)}
						key={"InBar"}
						Position={UDim2.fromScale(-0.00648686, 0.5)}
						ScaleType={Enum.ScaleType.Slice}
						Size={UDim2.fromScale(0, 1).Lerp(UDim2.fromScale(1, 1), minutes / REQUIRED_TIME_MINUTES)}
						SliceCenter={new Rect(197, 189, 223, 206)}
						SliceScale={scaledSlice(0.2)}
						ZIndex={7}
					>
						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(240, 197, 40)),
									new ColorSequenceKeypoint(0.384083, Color3.fromRGB(244, 205, 49)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 94)),
								])
							}
							Rotation={-90}
						/>
					</imagelabel>
				</imagelabel>

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(11, 88, 204)),
							new ColorSequenceKeypoint(0.0415225, Color3.fromRGB(11, 90, 205)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(42, 221, 234)),
						])
					}
					Rotation={180}
				/>
			</imagelabel>

			<AnimatedButton
				position={UDim2.fromScale(0.57, 0.8)}
				size={UDim2.fromScale(0.274787, 0.207277)}
				anchorPoint={new Vector2(0.5, 0.5)}
				onClick={() => {
					if (minutes >= REQUIRED_TIME_MINUTES) {
						Events.claimTimedReward();
					} else {
						Signals.invalidAction.Fire("Can't claim yet!");
					}
				}}
			>
				<imagelabel
					Size={UDim2.fromScale(1, 1)}
					Image={"rbxassetid://104244100672277"}
					SliceCenter={new Rect(88, 70, 557, 634)}
					ScaleType={Enum.ScaleType.Slice}
					SliceScale={scaledSlice(0.25)}
					BackgroundTransparency={1}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(61, 220, 3)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(74, 255, 240)),
							])
						}
						Rotation={90}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"Amount"}
						Position={UDim2.fromScale(0.512687, 0.493803)}
						Size={UDim2.fromScale(1.02588, 0.70634)}
						Text={"CLAIM FOR FREE!"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
					>
						<uistroke key={"UIStroke"} Thickness={px(2.5)} />
					</textlabel>
				</imagelabel>
			</AnimatedButton>

			<AnimatedButton
				size={UDim2.fromScale(0.213928, 0.0994694)}
				position={UDim2.fromScale(0.83, 0.85)}
				anchorPoint={new Vector2(0.5, 0.5)}
				onClick={() => {
					MarketplaceService.PromptProductPurchase(
						Players.LocalPlayer,
						gameConstants.DEVPRODUCT_IDS.CompleteTimedReward,
					);
				}}
			>
				<imagelabel
					BackgroundTransparency={1}
					Image={"rbxassetid://100601270697881"}
					Size={UDim2.fromScale(1, 1)}
					key={"Skip"}
					ScaleType={Enum.ScaleType.Slice}
					SliceCenter={new Rect(88, 90, 540, 609)}
					SliceScale={scaledSlice(0.4)}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, Color3.fromRGB(255, 6, 10)),
								new ColorSequenceKeypoint(1, Color3.fromRGB(195, 37, 39)),
							])
						}
						Rotation={90}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.FredokaOne)}
						key={"MenuText"}
						Position={UDim2.fromScale(0.573747, 0.450865)}
						Size={UDim2.fromScale(0.599884, 0.756865)}
						Text={"699"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={5}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(31, 31, 31)} Thickness={px(2)} />
					</textlabel>

					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://14543198745"}
						Position={UDim2.fromScale(0.287573, 0.439249)}
						Size={UDim2.fromScale(0.183849, 0.649339)}
						ZIndex={10}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</imagelabel>
			</AnimatedButton>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://13469027463"}
				ImageColor3={Color3.fromRGB(21, 116, 16)}
				Position={UDim2.fromScale(0.233235, 0.754209)}
				Size={UDim2.fromScale(0.165411, 0.0107571)}
				ZIndex={10}
			/>

			<uisizeconstraint key={"UISizeConstraint"} MinSize={new Vector2(240, 240)} />

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.FREE_TIMED_REWARD_MENU}
				isMenuVisible={visible}
			/>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://13468977126"}
				ImageColor3={Color3.fromRGB(133, 255, 67)}
				Position={UDim2.fromScale(0.0823194, 0.673314)}
				Rotation={-130}
				Size={UDim2.fromScale(0.118341, 0.171243)}
				ZIndex={10}
			/>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://14543228534"}
				Position={UDim2.fromScale(0.120224, 0.846842)}
				Size={UDim2.fromScale(0.0721326, 0.122625)}
				ZIndex={10}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
			</imagelabel>
		</imagelabel>
	);
};
