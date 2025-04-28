import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { Binding, useEffect, useState } from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { GamepassController } from "client/controllers/gamepassController";
import { usePx } from "client/hooks/usePx";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";
import { getDeveloperProductInfo } from "shared/util/monetizationUtil";

interface AnimatedButtonProps {
	size?: { X: { Scale: number }; Y: { Scale: number } };
	position?: UDim2 | Binding<UDim2>;
	anchorPoint?: Vector2;
	onClick?: () => void;
	onHover?: () => void;
	onLeave?: () => void;
	scales?: NumberRange;
	layoutOrder?: number;
	children?: React.ReactNode;
	zindex?: number;
	Ref?: React.Ref<Frame>;
	active?: boolean;
	selectable?: boolean;
	clickable?: boolean;
	visible?: boolean;
	errorText?: string;
	modal?: boolean;
	backgroundTransparency?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
	size = { X: { Scale: 1 }, Y: { Scale: 1 } },
	position = new UDim2(0.5, 0, 0.5, 0),
	anchorPoint = new Vector2(0.5, 0.5),
	onClick,
	onHover,
	onLeave,
	layoutOrder,
	scales,
	children,
	zindex,
	visible,
	selectable,
	clickable = true,
	errorText,
	Ref: ref,
	active = true,
	modal,
	backgroundTransparency = 1,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setPressed] = useState(false);
	const [scale, sizeMotion] = useMotion(1);
	const [MIN_SCALE, MAX_SCALE] = scales ? [scales.Min, scales.Max] : [0.95, 1.05];

	useEffect(() => {
		sizeMotion.spring(isHovered ? MAX_SCALE : 1, { tension: 300, friction: 20 });
	}, [isHovered]);

	useEffect(() => {
		sizeMotion.spring(isPressed ? MIN_SCALE : isHovered ? MAX_SCALE : 1, { tension: 300, friction: 20 });
	}, [isPressed]);

	return (
		<frame
			BackgroundTransparency={backgroundTransparency}
			Size={scale.map((s) => UDim2.fromScale(size.X.Scale * s, size.Y.Scale * s))}
			Position={position}
			AnchorPoint={anchorPoint}
			LayoutOrder={layoutOrder ?? 0}
			ZIndex={zindex ?? 10}
			ref={ref}
			Visible={visible}
			BackgroundColor3={new Color3(1, 1, 1)}
		>
			<imagebutton
				BackgroundTransparency={1}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={zindex ?? 10}
				Active={active}
				Selectable={selectable}
				Modal={modal}
				Event={{
					MouseEnter: () => {
						if (!active) return;
						onHover?.();
						setIsHovered(true);
					},
					MouseLeave: () => {
						if (!active) return;
						onLeave?.();
						setIsHovered(false);
					},
					SelectionGained: () => {
						if (!active) return;
						onHover?.();
						setIsHovered(true);
					},
					SelectionLost: () => {
						if (!active) return;
						onLeave?.();
						setIsHovered(false);
					},
					MouseButton1Click: () => {
						if (!active || !clickable) {
							if (errorText) {
								Signals.invalidAction.Fire(errorText);
							}
							return;
						}
						// Check for undefined, because we only want a pressing animation if a click event is defined
						if (onClick !== undefined) {
							setPressed(true);
							task.delay(0.1, () => {
								setPressed(false);
								setIsHovered(false);
							});
							onClick();
						}
					},
				}}
			></imagebutton>
			{React.Children.map(children, (child) => {
				return child;
			})}
		</frame>
	);
};

interface BuyButtonProps {
	position?: UDim2;
	size?: UDim2;
	price?: string;
	layoutOrder?: number;
	id: number;
	isDiscounted?: boolean;
	discountedPrice?: number;
	productType: Enum.InfoType.Product | Enum.InfoType.GamePass;
	anchorPoint?: Vector2;
	textSize?: number;
	gamepassController: GamepassController;
	active?: boolean;
}

export const BuyButton = (props: BuyButtonProps) => {
	const px = usePx();

	const [marketplaceInfo, setMarketplaceInfo] = React.useState<
		DeveloperProductInfo | GamePassProductInfo | undefined
	>();

	React.useEffect(() => {
		getDeveloperProductInfo(props.id, props.productType).then((info) => {
			setMarketplaceInfo(info);
		});
	}, [props.id]);

	const priceText = !props.isDiscounted
		? ` ${props.price ?? tostring(marketplaceInfo?.PriceInRobux) ?? "Priceless"}`
		: `<font color="rgb(255,0,0)"><s>${props.discountedPrice}</s></font>  ${
				props.price ?? tostring(marketplaceInfo?.PriceInRobux) ?? "Priceless"
		  }`;

	return (
		<AnimatedButton
			anchorPoint={props.anchorPoint ?? new Vector2(0.5, 1)}
			position={props.position ?? UDim2.fromScale(0.5, 0.902655)}
			size={props.size ?? UDim2.fromScale(0.851282, 0.212389)}
			active={props.active ?? false}
			onClick={() => {
				// TODO: Prompt refund point devproduct
				props.productType === Enum.InfoType.Product
					? MarketplaceService.PromptProductPurchase(Players.LocalPlayer, props.id)
					: MarketplaceService.PromptGamePassPurchase(Players.LocalPlayer, props.id);
			}}
		>
			<imagelabel
				key={"ImageButton"}
				BackgroundTransparency={1}
				Image={"rbxassetid://140291815990566"}
				Size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.02, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Amount"}
					Position={UDim2.fromScale(0.552466, 0.5)}
					Size={UDim2.fromScale(1, 0.806)}
					Text={
						props.productType === Enum.InfoType.GamePass
							? props.gamepassController.getOwnsGamepass(props.id)
								? "OWNED"
								: priceText
							: priceText
					}
					RichText={true}
					TextColor3={new Color3(1, 1, 1)}
					TextSize={px(props.textSize ?? px(27))}
					TextXAlignment={Enum.TextXAlignment.Center}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={px(2)} />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Amount"}
						Position={UDim2.fromScale(0.5, 0.48)}
						Size={UDim2.fromScale(1, 0.806)}
						Text={
							props.productType === Enum.InfoType.GamePass
								? props.gamepassController.getOwnsGamepass(props.id)
									? "OWNED"
									: priceText
								: priceText
						}
						RichText={true}
						TextColor3={new Color3(1, 1, 1)}
						TextSize={px(props.textSize ?? 27)}
						TextXAlignment={Enum.TextXAlignment.Center}
						ZIndex={9}
					>
						<uistroke key={"UIStroke"} Thickness={px(2)} />
					</textlabel>
				</textlabel>
			</imagelabel>
		</AnimatedButton>
	);
};
