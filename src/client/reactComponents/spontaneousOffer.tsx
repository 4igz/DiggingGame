import React, { useEffect, useRef, useState } from "@rbxts/react";
import { ExitButton } from "./inventory";
import { gameConstants } from "shared/gameConstants";
import UiController from "client/controllers/uiController";
import { Players, RunService } from "@rbxts/services";
import { AnimatedButton } from "./buttons";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { Events, Functions } from "client/network";

// 😄😀😆😁😃😀😁 SPONTANEOUIS OFFFER 😱😱😱😱😱😱😱😱 ?? 😱
export const SpontaneousOffer = (props: { uiController: UiController; visible: boolean }) => {
	const [visible, setVisible] = useState(false);
	const [hasClaimed, setClaimed] = useState(true);
	const [menuPos, menuPosMotion] = useMotion(UDim2.fromScale(0.5, 0.6));
	const gradientRef = useRef<UIGradient>();

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		if (!gradientRef.current) return;
		if (visible && !hasClaimed) {
			menuPosMotion.spring(UDim2.fromScale(0.5, 0.5), springs.wobbly);

			const RAINBOW_SPEED = 0.5;

			const gradientRotationConnection = RunService.RenderStepped.Connect(() => {
				if (!gradientRef.current) {
					gradientRotationConnection.Disconnect();
					return;
				}
				const currentRotation = gradientRef.current.Rotation;
				if (currentRotation >= 360) {
					gradientRef.current.Rotation = 0;
				}
				gradientRef.current.Rotation += RAINBOW_SPEED;
			});

			return () => {
				gradientRotationConnection.Disconnect();
			};
		} else {
			menuPosMotion.immediate(UDim2.fromScale(0.5, 0.6));
			setVisible(false);
		}
	}, [visible, gradientRef.current, hasClaimed]);

	useEffect(() => {
		Functions.getClaimedSpontaneousOffer.invoke().then(setClaimed);
	}, []);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Visible={visible}>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://129264356116188"}
				key={"BG"}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.573452, 0.487164)}
				Position={menuPos}
			>
				<ExitButton
					uiName={gameConstants.SPONTANEOUS_OFFER_MENU}
					isMenuVisible={visible}
					uiController={props.uiController}
				/>
				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					key={"Seller Profile"}
					Position={UDim2.fromScale(0.0344549, 0.0593456)}
					Size={UDim2.fromScale(0.254727, 0.308206)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://101474809776872"}
						key={"Background"}
						Position={UDim2.fromScale(0.472812, 0.350702)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.708171, 1.0507)}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							Image={"rbxassetid://77754309050946"}
							key={"Profile"}
							Position={UDim2.fromScale(0.5, 0.461383)}
							Size={UDim2.fromScale(0.785714, 0.752632)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>
					</imagelabel>
				</frame>
				<textlabel
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundTransparency={1}
					FontFace={Font.fromEnum(Enum.Font.GothamBold)}
					key={"Header"}
					Position={UDim2.fromScale(0.139393, 0.0915312)}
					Size={UDim2.fromScale(0.784068, 0.0961341)}
					Text={`Thank you for playing, ${Players.LocalPlayer.Name}!`}
					TextColor3={Color3.fromRGB(17, 17, 17)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Left}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={Font.fromEnum(Enum.Font.GothamBold)}
						key={"Header"}
						Position={UDim2.fromScale(0.500885, 0.360715)}
						Size={UDim2.fromScale(1.00177, 1)}
						Text={`Thank you for playing, ${Players.LocalPlayer.Name}!`}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 17, 17)} Thickness={2} />
					</textlabel>

					<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 17, 17)} Thickness={2} />
				</textlabel>
				<AnimatedButton
					anchorPoint={new Vector2(0.5, 1)}
					key={"Claim"}
					position={UDim2.fromScale(0.5, 0.910597)}
					size={UDim2.fromScale(0.259394, 0.138574)}
					clickable={!hasClaimed}
					onClick={() => {
						Events.claimSpontaneousOffer(42);
					}}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://100601270697881"}
						key={"Button"}
						Position={UDim2.fromScale(0.5, 0.5)}
						ScaleType={Enum.ScaleType.Slice}
						Size={UDim2.fromScale(1, 1)}
						SliceCenter={new Rect(119, 81, 477, 561)}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.467742)}
							Size={UDim2.fromScale(0.775701, 0.564516)}
							Text={hasClaimed ? "CAN'T CLAIM" : "CLAIM"}
							TextColor3={Color3.fromRGB(17, 17, 17)}
							TextScaled={true}
						>
							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.427381)}
								Size={UDim2.fromScale(1, 1)}
								Text={hasClaimed ? "CAN'T CLAIM" : "CLAIM"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 17, 17)} Thickness={2} />
							</textlabel>

							<uistroke key={"UIStroke"} Color={Color3.fromRGB(17, 17, 17)} Thickness={2} />
						</textlabel>

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(0, 255, 30)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(13, 157, 0)),
								])
							}
							Rotation={94}
						/>
					</imagelabel>
				</AnimatedButton>

				<frame
					AnchorPoint={new Vector2(0.5, 1)}
					BackgroundTransparency={1}
					key={"Holder"}
					Position={UDim2.fromScale(0.5, 0.716157)}
					Size={UDim2.fromScale(1, 0.274913)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.0121212, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<frame BackgroundColor3={new Color3(1, 1, 1)} key={"Prize1"} Size={UDim2.fromScale(0.149091, 1)}>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.15, 0)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(37, 54, 103)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(37, 54, 103)),
								])
							}
						/>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							Image={"rbxassetid://105628174237609"}
							key={"Reward"}
							Position={UDim2.fromScale(0.497221, -0.0440082)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.906505, 0.967479)}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 1)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Counter"}
							Position={UDim2.fromScale(0.5, 0.96748)}
							Size={UDim2.fromScale(1, 0.162602)}
							Text={"Luck Potion"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
						>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(117, 255, 12)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 0)),
									])
								}
								Rotation={90}
							/>

							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(17, 17, 17)}
								LineJoinMode={Enum.LineJoinMode.Bevel}
							/>
						</textlabel>

						<uipadding key={"UIPadding"} PaddingLeft={new UDim(0, 2)} PaddingRight={new UDim(0, 2)} />
					</frame>

					<frame
						BackgroundColor3={new Color3(1, 1, 1)}
						LayoutOrder={2}
						key={"Prize2"}
						Size={UDim2.fromScale(0.149091, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.15, 0)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(37, 54, 103)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(37, 54, 103)),
								])
							}
						/>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							Image={"rbxassetid://93578557481868"}
							key={"Reward"}
							Position={UDim2.fromScale(0.497221, -0.0440082)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.906505, 0.967479)}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 1)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Counter"}
							Position={UDim2.fromScale(0.5, 0.96748)}
							Size={UDim2.fromScale(1, 0.162602)}
							Text={"Strength Potion"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
						>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(255, 149, 0)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(186, 62, 0)),
									])
								}
								Rotation={90}
							/>

							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(17, 17, 17)}
								LineJoinMode={Enum.LineJoinMode.Bevel}
							/>
						</textlabel>

						<uipadding key={"UIPadding"} PaddingLeft={new UDim(0, 2)} PaddingRight={new UDim(0, 2)} />
					</frame>

					<frame
						BackgroundColor3={new Color3(1, 1, 1)}
						LayoutOrder={1}
						key={"Prize3"}
						Size={UDim2.fromScale(0.149091, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.15, 0)} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(37, 54, 103)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(37, 54, 103)),
								])
							}
						/>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							Image={"rbxassetid://96446480715038"}
							key={"Reward"}
							Position={UDim2.fromScale(0.497221, -0.0440082)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.906505, 0.967479)}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 1)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Counter"}
							Position={UDim2.fromScale(0.5, 0.96748)}
							Size={UDim2.fromScale(1, 0.162602)}
							Text={"$2000"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
						>
							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(117, 255, 12)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 0)),
									])
								}
								Rotation={90}
							/>

							<uistroke
								key={"UIStroke"}
								Color={Color3.fromRGB(17, 17, 17)}
								LineJoinMode={Enum.LineJoinMode.Bevel}
							/>
						</textlabel>

						<uipadding key={"UIPadding"} PaddingLeft={new UDim(0, 2)} PaddingRight={new UDim(0, 2)} />
					</frame>
				</frame>

				<frame
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundTransparency={1}
					key={"Content"}
					Position={UDim2.fromScale(0.5, 0.169121)}
					Size={UDim2.fromScale(1, 0.268456)}
				>
					<uilistlayout
						key={"UIListLayout"}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<frame BackgroundTransparency={1} key={"Row"} Size={UDim2.fromScale(1, 0.308333)}>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
							Text={"We are very happy to see you are enjoying"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"We are very happy to see you are enjoying"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>
							</textlabel>
						</textlabel>
					</frame>

					<frame BackgroundTransparency={1} LayoutOrder={2} key={"Row"} Size={UDim2.fromScale(1, 0.308333)}>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(0.368485, 1)}
							Text={"our game! Only for"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"our game! Only for"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>
							</textlabel>
						</textlabel>

						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.00848485, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							LayoutOrder={2}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(0.356848, 1)}
							Text={"SPECIAL PLAYERS"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"SPECIAL PLAYERS"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(26, 232, 255)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(17, 180, 255)),
										])
									}
									Rotation={89}
								/>
							</textlabel>
						</textlabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							LayoutOrder={3}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(0.0707879, 1)}
							Text={"like"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"like"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>
							</textlabel>
						</textlabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							LayoutOrder={4}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(0.0853333, 1)}
							Text={"YOU"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"YOU"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>

								<uigradient
									key={"UIGradient"}
									Color={
										new ColorSequence([
											new ColorSequenceKeypoint(0, Color3.fromRGB(255, 207, 32)),
											new ColorSequenceKeypoint(1, Color3.fromRGB(255, 171, 26)),
										])
									}
									Rotation={90}
								/>
							</textlabel>
						</textlabel>
					</frame>

					<frame BackgroundTransparency={1} LayoutOrder={3} key={"Row"} Size={UDim2.fromScale(1, 0.308333)}>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={Font.fromEnum(Enum.Font.GothamBold)}
							key={"Txt"}
							Position={UDim2.fromScale(0.5, 0.5)}
							Size={UDim2.fromScale(1, 1)}
							Text={"we have a reward:"}
							TextColor3={new Color3()}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} LineJoinMode={Enum.LineJoinMode.Bevel} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundTransparency={1}
								FontFace={Font.fromEnum(Enum.Font.GothamBold)}
								key={"Txt"}
								Position={UDim2.fromScale(0.5, 0.418919)}
								Size={UDim2.fromScale(1, 1)}
								Text={"we have a reward:"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
							>
								<uistroke
									key={"UIStroke"}
									Color={Color3.fromRGB(17, 17, 17)}
									LineJoinMode={Enum.LineJoinMode.Bevel}
									Thickness={2}
								/>
							</textlabel>
						</textlabel>
					</frame>
				</frame>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.84564} />
			</imagelabel>

			<canvasgroup
				key={"CanvasGroup"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<frame
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"LeftStroke"}
					Position={UDim2.fromScale(0, 0.5)}
					Size={UDim2.fromScale(0.0104167, 1)}
				/>

				<frame
					AnchorPoint={new Vector2(1, 0.5)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"RightStroke"}
					Position={UDim2.fromScale(1, 0.5)}
					Size={UDim2.fromScale(0.0104167, 1)}
				/>

				<frame
					AnchorPoint={new Vector2(0.5, 1)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"TopStroke"}
					Position={UDim2.fromScale(0.5, 1)}
					Size={UDim2.fromScale(1, 0.0185357)}
				/>

				<frame
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"TopStroke"}
					Position={UDim2.fromScale(0.5, 0)}
					Size={UDim2.fromScale(1, 0.0185357)}
				/>

				<uigradient
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(223, 0, 0)),
							new ColorSequenceKeypoint(0.15, Color3.fromRGB(214, 91, 0)),
							new ColorSequenceKeypoint(0.31, Color3.fromRGB(233, 245, 0)),
							new ColorSequenceKeypoint(0.47, Color3.fromRGB(23, 255, 17)),
							new ColorSequenceKeypoint(0.64, Color3.fromRGB(29, 255, 255)),
							new ColorSequenceKeypoint(0.78, Color3.fromRGB(117, 128, 255)),
							new ColorSequenceKeypoint(0.93, Color3.fromRGB(202, 0, 253)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(202, 0, 253)),
						])
					}
					key={"Rainbow"}
					Rotation={30}
					ref={gradientRef}
				/>
			</canvasgroup>
		</frame>
	);
};
