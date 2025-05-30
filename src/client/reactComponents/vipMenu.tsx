import React, { useEffect, useState } from "@rbxts/react";
import { ExitButton } from "./inventory";
import { gameConstants } from "shared/gameConstants";
import UiController from "client/controllers/uiController";
import { BuyButton } from "./buttons";
import { GamepassController } from "client/controllers/gamepassController";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { getPlayerPlatform } from "shared/util/crossPlatformUtil";
import { usePx } from "client/hooks/usePx";
import { Events } from "client/network";

export const VipMenu = (props: {
	visible: boolean;
	uiController: UiController;
	gamepassController: GamepassController;
}) => {
	const [visible, setVisible] = useState(false);
	const [menuPos, posMotion] = useMotion(UDim2.fromScale(0.5, 0.6));

	const px = usePx();

	useEffect(() => {
		if (visible) {
			posMotion.spring(UDim2.fromScale(0.5, 0.45), springs.responsive);
		} else {
			posMotion.immediate(UDim2.fromScale(0.5, 0.6));
		}
	}, [visible]);

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	useEffect(() => {
		Events.updateOwnedGamepasses.connect((ownedGps) => {
			if (ownedGps.get("VIP") === true) {
				if (props.uiController.currentOpenUi === gameConstants.VIP_MENU) {
					props.uiController.closeCurrentOpenMenu();
				}
			}
		});
	}, []);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image={"rbxassetid://89658146022715"}
			key={"VIP"}
			Position={menuPos}
			ScaleType={Enum.ScaleType.Slice}
			Size={UDim2.fromScale(0.55, 0.55)}
			SliceCenter={new Rect(402, 139, 402, 139)}
			SliceScale={0.7}
			Visible={visible}
		>
			<uiscale key={"MobileScaling"} Scale={getPlayerPlatform() === "Mobile" ? 1.5 : 1.25} />

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.95} />

			<BuyButton
				position={UDim2.fromScale(0.491, 0.903)}
				anchorPoint={new Vector2(0.5, 0.5)}
				id={gameConstants.GAMEPASS_IDS.VIP}
				gamepassController={props.gamepassController}
				productType={Enum.InfoType.GamePass}
				size={UDim2.fromScale(0.5, 0.15)}
				active={true}
				zindex={15}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				AutoLocalize={false}
				BackgroundTransparency={1}
				Image={"rbxassetid://131652004317764"}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.7, 0.8)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.179004, 0.3)}
				ZIndex={100}
			/>

			<ExitButton uiName={gameConstants.VIP_MENU} isMenuVisible={visible} uiController={props.uiController} />

			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				LayoutOrder={2}
				key={"Inner"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.02, 0)} />
			</frame>

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(255, 241, 89)),
						new ColorSequenceKeypoint(0.49654, new Color3(1, 1, 1)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(255, 159, 25)),
					])
				}
				Rotation={90}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://91946808805915"}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.49819, 0.0846286)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.37117, 0.339669)}
				ZIndex={5}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.829558, 0.830803)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.154783, 0.154783)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(0.769745, 0.902351)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.097641, 0.0976409)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					ImageTransparency={0.2}
					Position={UDim2.fromScale(0.141191, 0.345594)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.139223, 0.139224)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(1.16088, 0.50785)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.13062, 0.13062)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(1.08089, 0.15566)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.201628, 0.201628)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(1.15504, 0.251968)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.138729, 0.13873)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(-0.209405, 0.517341)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.201628, 0.201628)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<imagelabel
					key={"ImageLabel"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://116607654900413"}
					Position={UDim2.fromScale(-0.158523, 0.402809)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.131594, 0.131594)}
					ZIndex={20}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://127815852198424"}
				ImageTransparency={0.3}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.5, 0.014)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.589877, 0.560383)}
			>
				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

				<uigradient
					key={"UIGradient"}
					Rotation={90}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 0),
							new NumberSequenceKeypoint(0.839152, 0),
							new NumberSequenceKeypoint(1, 0.4),
						])
					}
				/>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://75925897645631"}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.500777, 0.416746)}
				ScaleType={Enum.ScaleType.Slice}
				Size={UDim2.fromScale(0.828639, 0.396046)}
				SliceCenter={new Rect(402, 139, 402, 139)}
				SliceScale={2}
			>
				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(14, 77, 194)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(17, 126, 221)),
						])
					}
					Rotation={90}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 0),
							new NumberSequenceKeypoint(0.839152, 0),
							new NumberSequenceKeypoint(1, 0.4),
						])
					}
				/>

				<frame
					key={"Frame"}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.508, 0.505)}
					Size={UDim2.fromScale(0.953043, 0.895703)}
				>
					<uilistlayout
						key={"UIListLayout"}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<frame
						key={"Frame"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Position={UDim2.fromScale(0.508246, 0.161784)}
						Size={UDim2.fromScale(1.01649, 0.323569)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.05, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							key={"Money Cover"}
							Position={UDim2.fromScale(0.121975, 0.182867)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.24395, 1.025)}
							ZIndex={5}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://96446480715038"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.61576, -0.111037)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(1.28594, 1.20452)}
								ZIndex={5}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</imagelabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutoLocalize={false}
							BackgroundTransparency={1}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							LayoutOrder={2}
							key={"Title"}
							Position={UDim2.fromScale(0.639139, 0.5)}
							Size={UDim2.fromScale(0.737453, 0.578876)}
							Text={"+50% Money!"}
							TextColor3={new Color3()}
							TextScaled={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								AutoLocalize={false}
								BackgroundTransparency={1}
								FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={"+50% Money!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />
							</textlabel>
						</textlabel>
					</frame>

					<frame
						key={"Frame"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Position={UDim2.fromScale(0.508246, 0.161784)}
						Size={UDim2.fromScale(1.01649, 0.323569)}
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
							AutoLocalize={false}
							BackgroundTransparency={1}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							LayoutOrder={2}
							key={"Title"}
							Position={UDim2.fromScale(0.639139, 0.5)}
							Size={UDim2.fromScale(0.737453, 0.578876)}
							Text={"+50% Experience!"}
							TextColor3={new Color3()}
							TextScaled={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								AutoLocalize={false}
								BackgroundTransparency={1}
								FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={"+50% Experience!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />
							</textlabel>
						</textlabel>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							key={"Money Cover"}
							Position={UDim2.fromScale(0.121975, 0.182867)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.24395, 1.025)}
							ZIndex={5}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://105806277189798"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.620238, -0.040703)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.995646, 0.995647)}
								ZIndex={5}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</imagelabel>
					</frame>

					<frame
						key={"Frame"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Position={UDim2.fromScale(0.508246, 0.161784)}
						Size={UDim2.fromScale(1.01649, 0.323569)}
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
							AutoLocalize={false}
							BackgroundTransparency={1}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							LayoutOrder={2}
							key={"Title"}
							Position={UDim2.fromScale(0.620638, 0.5)}
							Size={UDim2.fromScale(0.700452, 0.578876)}
							Text={"Fast Movement Speed!"}
							TextColor3={new Color3()}
							TextScaled={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								AutoLocalize={false}
								BackgroundTransparency={1}
								FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
								key={"Title"}
								Position={UDim2.fromScale(0.5, 0.43)}
								Size={UDim2.fromScale(1, 1)}
								Text={"Fast Movement Speed!"}
								TextColor3={new Color3(1, 1, 1)}
								TextScaled={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Color={Color3.fromRGB(40, 20, 79)} Thickness={px(1.5)} />
							</textlabel>
						</textlabel>

						<imagelabel
							AnchorPoint={new Vector2(0.5, 0)}
							BackgroundTransparency={1}
							key={"Money Cover"}
							Position={UDim2.fromScale(0.121975, 0.182867)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.24395, 1.025)}
							ZIndex={5}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />

							<imagelabel
								AnchorPoint={new Vector2(0.5, 0)}
								BackgroundTransparency={1}
								Image={"rbxassetid://111103026349586"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.607447, -0.0112862)}
								ScaleType={Enum.ScaleType.Fit}
								Size={UDim2.fromScale(0.970063, 0.970062)}
								ZIndex={5}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</imagelabel>
					</frame>
				</frame>
			</imagelabel>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://79009855020104"}
				key={"Title"}
				Position={UDim2.fromScale(0.500777, -0.159048)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(2.11166, 0.358632)}
				SliceCenter={new Rect(402, 139, 402, 139)}
				SliceScale={2}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					ImageTransparency={1}
					key={"Title"}
					Position={UDim2.fromScale(0.541138, 0.501833)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(0.346327, 0.263752)}
					SliceCenter={new Rect(197, 189, 223, 206)}
					SliceScale={0.14}
					ZIndex={5}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0.055, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
				</imagelabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
					LayoutOrder={2}
					key={"Amount"}
					Position={UDim2.fromScale(0.5, 0.474)}
					Size={UDim2.fromScale(0.345414, 0.2083)}
					Text={"VIP!"}
					TextColor3={Color3.fromRGB(30, 30, 30)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(106, 70, 28)} Thickness={px(2)} />

					<uitextsizeconstraint key={"UITextSizeConstraint"} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						AutomaticSize={Enum.AutomaticSize.X}
						BackgroundTransparency={1}
						FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
						LayoutOrder={2}
						key={"Amount"}
						Position={UDim2.fromScale(0.5, 0.43)}
						Size={UDim2.fromScale(1, 1)}
						Text={"VIP!"}
						TextColor3={new Color3(1, 1, 1)}
						TextScaled={true}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(106, 70, 28)} Thickness={px(2)} />

						<uitextsizeconstraint key={"UITextSizeConstraint"} />
					</textlabel>
				</textlabel>
			</imagelabel>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://111022131848689"}
				ImageTransparency={0.2}
				Position={UDim2.fromScale(0.286945, 0.00463494)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.121623, 0.102868)}
				ZIndex={10}
			/>

			<imagelabel
				key={"ImageLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image={"rbxassetid://111022131848689"}
				ImageTransparency={0.2}
				Position={UDim2.fromScale(0.689206, 0.00463494)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.121623, 0.102868)}
				ZIndex={10}
			/>

			<imagelabel
				AnchorPoint={new Vector2(0.5, 0)}
				AutoLocalize={false}
				BackgroundTransparency={1}
				Image={"rbxassetid://91065358228971"}
				key={"Money Cover"}
				Position={UDim2.fromScale(0.0755734, 0.812791)}
				Size={UDim2.fromScale(0.317067, 0.25273)}
				ZIndex={5}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
					LayoutOrder={2}
					key={"Amount"}
					Position={UDim2.fromScale(0.499049, 0.412786)}
					Size={UDim2.fromScale(0.550363, 0.257727)}
					Text={"50%"}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(135, 47, 50)} Thickness={px(1.5)} />

					<uitextsizeconstraint key={"UITextSizeConstraint"} />
				</textlabel>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
					LayoutOrder={2}
					key={"Amount"}
					Position={UDim2.fromScale(0.499202, 0.633363)}
					Size={UDim2.fromScale(0.459463, 0.212705)}
					Text={"OFF"}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(135, 47, 50)} Thickness={px(1.5)} />

					<uitextsizeconstraint key={"UITextSizeConstraint"} />
				</textlabel>

				<uigradient
					key={"UIGradient"}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(184, 0, 3)),
							new ColorSequenceKeypoint(1, new Color3(1, 1, 1)),
						])
					}
					Rotation={90}
				/>
			</imagelabel>

			{/* <AnimatedButton backgroundTransparency={1} key={"VIP"} size={UDim2.fromScale(0.44, 0.139)}>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image={"rbxassetid://92239062767450"}
					Interactable={false}
					key={"BuyButton"}
					Position={UDim2.fromScale(0.5, 0.5)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(1, 1)}
					SliceCenter={new Rect(40, 86, 544, 87)}
					SliceScale={0.3}
				>
					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
						key={"Label"}
						Position={UDim2.fromScale(0.5, 0.5)}
						Size={UDim2.fromScale(0.877044, 0.568647)}
						Text={" 799"}
						TextColor3={Color3.fromRGB(1, 75, 33)}
						TextScaled={true}
					>
						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							key={"Label"}
							Position={UDim2.fromScale(0.5, 0.45)}
							Size={UDim2.fromScale(1, 1)}
							Text={" 799"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={2.5} />
						</textlabel>

						<uistroke key={"UIStroke"} Color={Color3.fromRGB(1, 75, 33)} Thickness={2.5} />
					</textlabel>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={3} />

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0)}
						AutoLocalize={false}
						BackgroundTransparency={1}
						Image={"rbxassetid://131652004317764"}
						key={"Money Cover"}
						Position={UDim2.fromScale(0.918, 0.55)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.379004, 0.512969)}
						ZIndex={5}
					/>
				</imagelabel>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					key={"Owned"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Visible={false}
					ZIndex={10}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						Image={"rbxassetid://114978900536475"}
						key={"Check"}
						Position={UDim2.fromScale(0.322335, 0.327741)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.358137, 1.2268)}
						SliceCenter={new Rect(100, 259, 901, 259)}
					/>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
						key={"Title"}
						Position={UDim2.fromScale(0.607239, 0.483516)}
						Size={UDim2.fromScale(0.73743, 0.73743)}
						Text={"Owned!"}
						TextColor3={new Color3()}
						TextScaled={true}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Thickness={2.3} />

						<uigradient
							key={"UIGradient"}
							Color={
								new ColorSequence([
									new ColorSequenceKeypoint(0, Color3.fromRGB(135, 255, 108)),
									new ColorSequenceKeypoint(0.513841, Color3.fromRGB(148, 255, 131)),
									new ColorSequenceKeypoint(1, Color3.fromRGB(19, 152, 52)),
								])
							}
							Rotation={90}
						/>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							FontFace={new Font("rbxasset://fonts/families/FredokaOne.json")}
							key={"Title"}
							Position={UDim2.fromScale(0.5, 0.42)}
							Size={UDim2.fromScale(1, 1)}
							Text={"Owned!"}
							TextColor3={new Color3(1, 1, 1)}
							TextScaled={true}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Thickness={2.3} />

							<uigradient
								key={"UIGradient"}
								Color={
									new ColorSequence([
										new ColorSequenceKeypoint(0, Color3.fromRGB(135, 255, 108)),
										new ColorSequenceKeypoint(0.513841, Color3.fromRGB(148, 255, 131)),
										new ColorSequenceKeypoint(1, Color3.fromRGB(19, 152, 52)),
									])
								}
								Rotation={90}
							/>
						</textlabel>
					</textlabel>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.2} />
				</frame>
			</AnimatedButton> */}
		</imagelabel>
	);
};
