import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { springs } from "client/utils/springs";
import { AnimatedButton } from "./buttons";
import { Events, Functions } from "client/network";
import { AvatarEditorService, Players } from "@rbxts/services";
import { ExitButton } from "./inventory";
import UiController from "client/controllers/uiController";
import { gameConstants, REWARD_IMAGES } from "shared/gameConstants";
import groupReward from "shared/config/groupReward";
import { ItemType } from "shared/networkTypes";
import { usePx } from "client/hooks/usePx";
import { spaceWords } from "shared/util/nameUtil";

interface FreeRewardProps {
	visible: boolean;
	uiController: UiController;
}

const MAX_IMAGE_ROTATION = 15;

export const FreeReward = (props: FreeRewardProps) => {
	const [menuPos, setMenuPos] = useMotion(UDim2.fromScale(0.5, 0.6));
	const [visible, setVisible] = useState(props.visible);
	const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
	const [imageRotation, setImageRotation] = useMotion(0);

	const [hasClaimed, setHasClaimed] = useState(false);
	const px = usePx();

	const [rewardImage] = useState(
		REWARD_IMAGES[groupReward.rewardType] ??
			gameConstants.SHOP_CONFIGS[groupReward.rewardType as ItemType][groupReward.itemName!]?.itemImage ??
			undefined,
	);

	useEffect(() => {
		let currentRotation = imageRotation.getValue();
		const rotationThread = task.spawn(() => {
			while (true) {
				task.wait(1);
				currentRotation = currentRotation < MAX_IMAGE_ROTATION ? MAX_IMAGE_ROTATION : -MAX_IMAGE_ROTATION;
				setImageRotation.spring(currentRotation, springs.bubbly);
			}
		});

		return () => {
			task.cancel(rotationThread);
		};
	}, []);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (visible) {
			setMenuPos.spring(UDim2.fromScale(0.5, 0.5), springs.responsive);

			setHasJoinedGroup(Players.LocalPlayer.IsInGroup(game.CreatorId));

			Functions.getHasClaimedFreeReward().then((status) => {
				setHasClaimed(status);
			});

			AvatarEditorService.PromptSetFavorite(game.PlaceId, 1, true);
		} else {
			setMenuPos.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			key={"Container"}
			Position={menuPos}
			Size={UDim2.fromScale(0.55, 0.75)}
			Visible={visible}
			ZIndex={-5}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://134125895281772"}
				key={"Bg"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={-2}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://127513841052443"}
				key={"Icon"}
				Position={UDim2.fromScale(0.0073635, 0.0356735)}
				Rotation={imageRotation}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.196334, 0.307258)}
				ZIndex={2}
			/>

			<textlabel
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				key={"Title"}
				Position={UDim2.fromScale(0.125182, -0.0503847)}
				Size={UDim2.fromScale(0.437538, 0.138158)}
				Text={"Free Reward"}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				// TextSize={px(30)}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={4}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(23, 30, 52)} Thickness={px(3)} />

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
							new ColorSequenceKeypoint(0.384083, new Color3(1, 1, 1)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(114, 236, 255)),
						])
					}
					Rotation={90}
				/>
			</textlabel>

			<ExitButton
				uiController={props.uiController}
				uiName={gameConstants.FREE_REWARD_UI}
				isMenuVisible={visible}
			/>

			<imagelabel
				BackgroundTransparency={1}
				Image={"rbxassetid://103970377309616"}
				key={"DisplayLeft"}
				Position={UDim2.fromScale(0.0304927, 0.0764869)}
				Size={UDim2.fromScale(0.392544, 0.84375)}
				ZIndex={0}
			>
				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.0901011, 0.64842)}
					Size={UDim2.fromScale(0.819428, 0.1602)}
					Text={spaceWords(groupReward.itemName ?? groupReward.rewardType)}
					TextColor3={Color3.fromRGB(46, 46, 53)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.45)}
						Size={UDim2.fromScale(1, 1)}
						Text={spaceWords(groupReward.itemName ?? groupReward.rewardType)}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
					</textlabel>
				</textlabel>

				<textlabel
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Free"}
					Position={UDim2.fromScale(-0.0698906, 0.8)}
					Size={UDim2.fromScale(1.13921, 0.10357)}
					Text={"FREE!"}
					TextColor3={Color3.fromRGB(46, 46, 53)}
					TextScaled={true}
					ZIndex={2}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.5, 0.45)}
						Size={UDim2.fromScale(1, 1)}
						Text={"FREE!"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(253, 233, 13)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(235, 164, 49)),
								])
							}
							Rotation={90}
						/>
					</textlabel>
				</textlabel>

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(98, 225, 223)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(71, 122, 225)),
						])
					}
					Rotation={90}
				/>

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.697856} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://126282933753272"}
					key={"Border"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={0}
				/>

				<frame
					BackgroundTransparency={1}
					key={"petImage"}
					Position={UDim2.fromScale(0.173184, 0.116959)}
					Size={UDim2.fromScale(0.648045, 0.452242)}
				>
					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={rewardImage}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						ScaleType={"Fit"}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

						<uistroke
							key={"UIStroke"}
							Color={Color3.fromRGB(21, 49, 109)}
							Thickness={5}
							Transparency={0.8}
						/>
					</imagelabel>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Free"}
						Position={UDim2.fromScale(-0.128206, -0.079809)}
						Size={UDim2.fromScale(0.434835, 0.276406)}
						Text={"OP!"}
						TextColor3={Color3.fromRGB(46, 46, 53)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.510565, 0.45)}
							Size={UDim2.fromScale(1.02113, 1)}
							Text={"OP!"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(253, 233, 13)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(235, 164, 49)),
									])
								}
								Rotation={90}
							/>
						</textlabel>
					</textlabel>
				</frame>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.5} />

			<imagelabel
				BackgroundTransparency={1}
				Image={"rbxassetid://84909493980683"}
				key={"DisplayRight"}
				Position={UDim2.fromScale(0.4, 0.0894969)}
				Size={UDim2.fromScale(0.6, 0.820724)}
				ZIndex={-1}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1} />

				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://78314193960818"}
					key={"T"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
				/>

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(98, 225, 223)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(71, 122, 225)),
						])
					}
					Rotation={90}
				/>

				<AnimatedButton
					position={UDim2.fromScale(0.5, 0.85)}
					size={UDim2.fromScale(0.700375, 0.156313)}
					clickable={!hasClaimed}
					active={!hasClaimed}
					onClick={() => {
						if (!hasJoinedGroup) {
							setHasJoinedGroup(Players.LocalPlayer.IsInGroup(game.CreatorId));
							return;
						}
						Events.claimFreeReward();
						task.defer(() => {
							Functions.getHasClaimedFreeReward().then((status) => {
								setHasClaimed(status);
							});
						});
					}}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://134153726154849"}
						key={"Claim"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						ImageColor3={hasJoinedGroup && !hasClaimed ? new Color3(1, 1, 1) : Color3.fromRGB(87, 87, 87)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.79487} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.5, 0.475)}
							Size={UDim2.fromScale(0.819, 0.5)}
							Text={
								hasJoinedGroup
									? hasClaimed
										? "Already claimed!"
										: "Claim  for  free!"
									: "Complete all first!"
							}
							TextColor3={new Color3(1, 1, 1)}
							TextSize={px(30)}
							// TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
						</textlabel>
					</imagelabel>
				</AnimatedButton>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.SemiBold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.529963, 0.685755)}
					Size={UDim2.fromScale(0.819, 0.124483)}
					Text={"After finishing the task,  wait for 2 minutes to claim the reward"}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
					TextTransparency={0.5}
					ZIndex={2}
				/>

				<frame
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.8}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"Divider"}
					Position={UDim2.fromScale(0.011, 0.58)}
					Size={UDim2.fromScale(0.977528, 0.00400802)}
				/>

				<frame
					BackgroundColor3={new Color3()}
					BackgroundTransparency={0.8}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"Divider"}
					Position={UDim2.fromScale(0.011, 0.3)}
					Size={UDim2.fromScale(0.977528, 0.00400802)}
				/>

				<frame
					BackgroundTransparency={1}
					key={"One"}
					Position={UDim2.fromScale(0.0986383, 0.0791583)}
					Size={UDim2.fromScale(0.869913, 0.156071)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0.03, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://127513841052443"}
						key={"Icon"}
						Position={UDim2.fromScale(0.473635, 0.356499)}
						Rotation={-15.0155}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.143605, 0.781637)}
						ZIndex={2}
					/>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.143605, 0.218416)}
						Size={UDim2.fromScale(0.390422, 0.563168)}
						Text={"LIKE THE GAME"}
						TextColor3={Color3.fromRGB(46, 46, 53)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.5, 0.45)}
							Size={UDim2.fromScale(1, 1)}
							Text={"LIKE THE GAME"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
						</textlabel>
					</textlabel>
				</frame>

				<frame
					BackgroundTransparency={1}
					key={"Two"}
					Position={UDim2.fromScale(0.0986383, 0.365731)}
					Size={UDim2.fromScale(0.869913, 0.156071)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0.03, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://127513841052443"}
						key={"Icon"}
						Position={UDim2.fromScale(0.473635, 0.356499)}
						Rotation={-15.0155}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.143605, 0.781637)}
						ZIndex={2}
					/>

					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.173605, 0.218416)}
						Size={UDim2.fromScale(0.407828, 0.563168)}
						Text={"JOIN THE GROUP"}
						TextColor3={Color3.fromRGB(46, 46, 53)}
						TextScaled={true}
						ZIndex={2}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.50395, 0.45)}
							Size={UDim2.fromScale(1.0079, 1)}
							Text={"JOIN THE GROUP"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
						</textlabel>
					</textlabel>
				</frame>

				<frame
					BackgroundTransparency={1}
					key={"B1"}
					Position={UDim2.fromScale(0.617978, 0.0817738)}
					Size={UDim2.fromScale(0.35206, 0.136273)}
				>
					<imagelabel
						key={"ImageButton"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://131363717743371"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1)}
						ImageColor3={hasJoinedGroup ? new Color3(1, 1, 1) : Color3.fromRGB(170, 0, 0)}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.504, 0.52)}
							RichText={false}
							Size={UDim2.fromScale(0.96, 0.5)}
							Text={`${hasJoinedGroup ? "1" : "0"}/1`}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
						</textlabel>
					</imagelabel>
				</frame>

				<frame
					BackgroundTransparency={1}
					key={"B2"}
					Position={UDim2.fromScale(0.618, 0.366)}
					Size={UDim2.fromScale(0.35206, 0.136273)}
				>
					<imagelabel
						key={"ImageButton"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://131363717743371"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ImageColor3={hasJoinedGroup ? new Color3(1, 1, 1) : Color3.fromRGB(170, 0, 0)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1)}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Title"}
							Position={UDim2.fromScale(0.504, 0.52)}
							RichText={false}
							Size={UDim2.fromScale(0.96, 0.5)}
							Text={`${hasJoinedGroup ? "1" : "0"}/1`}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={2}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(46, 46, 53)} Thickness={px(3)} />
						</textlabel>
					</imagelabel>
				</frame>
			</imagelabel>
		</frame>
	);
};
