//!optimize 2
import React, { createRef } from "@rbxts/react";
import { AnimatedButton, ExitButton } from "./inventory";
import { UiController } from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import { useMotion } from "client/hooks/useMotion";
import { springs } from "client/utils/springs";
import { MarketplaceService, Players, ReplicatedStorage } from "@rbxts/services";
import { getDevProduct } from "shared/config/devproducts";
import { separateWithCommas } from "shared/util/nameUtil";
import { getDeveloperProductInfo } from "shared/util/monetizationUtil";
import { ProductType } from "shared/config/shopConfig";
import SpriteClip from "@rbxts/spriteclip";
import { Events, Functions } from "client/network";

interface BuyButtonProps {
	position: UDim2;
	size?: UDim2;
	price?: string;
	layoutOrder?: number;
	id: number;
	isDiscounted?: boolean;
	discountedPrice?: number;
	productType: Enum.InfoType.Product | Enum.InfoType.GamePass;
	anchorPoint?: Vector2;
}

const BuyButton = (props: BuyButtonProps) => {
	const [marketplaceInfo, setMarketplaceInfo] = React.useState<
		DeveloperProductInfo | GamePassProductInfo | undefined
	>();

	React.useEffect(() => {
		getDeveloperProductInfo(props.id, props.productType).then((info) => {
			setMarketplaceInfo(info);
		});
	}, [props.id]);

	return (
		<frame
			Position={props.position ?? UDim2.fromScale(0.0883, 0.739)}
			LayoutOrder={props.layoutOrder ?? 5000}
			Size={props.size ?? UDim2.fromScale(0.854, 0.245)}
			BackgroundTransparency={1}
			AnchorPoint={props.anchorPoint ?? new Vector2(0.5, 0.5)}
		>
			<uilistlayout
				key={"UIListLayout"}
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Discount"}
				Position={UDim2.fromScale(0, 0.551)}
				Size={UDim2.fromScale(0.487, 0.534)}
				Visible={props.isDiscounted ?? false}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Discount Number"}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://109786676685899"}
						key={"Robux"}
						Position={UDim2.fromScale(0.166, -0.0645)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.252, 1.19)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Amount"}
						Position={UDim2.fromScale(0.65, 0.5)}
						Size={UDim2.fromScale(0.396, 1)}
						Text={tostring(props.discountedPrice) ?? "1000"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Right}
						ZIndex={10}
					>
						<uistroke key={"UIStroke"} Color={Color3.fromRGB(91, 10, 13)} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingLeft={new UDim(0.0735, 0)}
							PaddingRight={new UDim(0.0735, 0)}
						/>
					</textlabel>
				</frame>

				<frame
					BackgroundColor3={Color3.fromRGB(170, 19, 22)}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Cross"}
					Position={UDim2.fromScale(0.172, 0.519)}
					Rotation={-7}
					Size={UDim2.fromScale(0.68, 0.0323)}
				>
					<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 65, 34)} />
				</frame>
			</frame>

			<frame
				Size={UDim2.fromScale(0.904, 1.07)}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
			>
				<imagelabel
					Size={UDim2.fromScale(1, 1)}
					Position={UDim2.fromScale(0.5, 0.5)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://92239062767450"}
					key={"Buy Btn"}
					ScaleType={Enum.ScaleType.Slice}
					SliceCenter={new Rect(47, 94, 539, 94)}
				>
					<frame
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Discount Number"}
						Position={UDim2.fromScale(0.5, 0.492)}
						Size={UDim2.fromScale(0.829, 0.524)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.075, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>

						<imagelabel
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://75287275007438"}
							key={"Robux"}
							Position={UDim2.fromScale(0.0126, 0.129)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(0.224, 1)}
						>
							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
						</imagelabel>

						<textlabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							AutomaticSize={Enum.AutomaticSize.X}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
							key={"Price"}
							Position={UDim2.fromScale(0.534, 0.5)}
							Size={UDim2.fromScale(0.129, 0.98)}
							Text={props.price ?? tostring(marketplaceInfo?.PriceInRobux) ?? "Priceless"}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							ZIndex={10}
						>
							<uistroke key={"UIStroke"} Color={Color3.fromRGB(8, 66, 34)} Thickness={3} />
						</textlabel>
					</frame>
				</imagelabel>
			</frame>
		</frame>
	);
};

interface CashProductProps {
	id: number;
	title: string;
	icon: string;
	layoutOrder: number;
}

const CashProduct = (props: CashProductProps) => {
	const dpInfo = getDevProduct(props.id);

	return (
		<AnimatedProductButton
			position={UDim2.fromScale(0.105, -2.46e-7)}
			size={UDim2.fromScale(0.324, 2.12)}
			scales={new NumberRange(0.98, 1.02)}
			layoutOrder={props.layoutOrder}
			productId={props.id}
			productType={ProductType.DevProduct}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://96012479019515"}
				key={"Background"}
				Position={UDim2.fromScale(0.496, 0.494)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.991, 0.989)}
			>
				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.0915, 0.0549)}
					Size={UDim2.fromScale(0.817, 0.121)}
					Text={props.title ?? "Buy Cash"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding
						key={"UIPadding"}
						PaddingBottom={new UDim(0.0571, 0)}
						PaddingLeft={new UDim(0.105, 0)}
						PaddingRight={new UDim(0.105, 0)}
						PaddingTop={new UDim(0.0571, 0)}
					/>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={5.76} />
				</textlabel>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Cash Info"}
					Position={UDim2.fromScale(0.0583, 0.233)}
					Size={UDim2.fromScale(0.883, 0.692)}
				>
					<imagelabel
						key={"ImageLabel"}
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={props.icon ?? "rbxassetid://82377284011764"}
						LayoutOrder={1}
						Position={UDim2.fromScale(0.501, 0.446)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.821, 0.679)}
					/>

					<textlabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Title"}
						Position={UDim2.fromScale(0.0915, 0.0439)}
						Size={UDim2.fromScale(0.817, 0.171)}
						Text={`$${separateWithCommas(dpInfo?.cashReward ?? "1000")}`}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke key={"UIStroke"} Thickness={3} />

						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0148, 0)}
							PaddingLeft={new UDim(0.168, 0)}
							PaddingRight={new UDim(0.168, 0)}
							PaddingTop={new UDim(0.0148, 0)}
						/>
					</textlabel>

					<BuyButton
						id={props.id}
						layoutOrder={2}
						position={UDim2.fromScale(0.5, 0.8)}
						anchorPoint={new Vector2(0.5, 0.5)}
						productType={Enum.InfoType.Product}
					/>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.09} />
				</frame>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.85} />
		</AnimatedProductButton>
	);
};

interface MoreDiggingProduct {
	runAnimation: boolean;
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

	React.useEffect(() => {
		if (props.runAnimation) {
			animation.Adornee = animationRef.current;
			animation.Play();

			Functions.getMultiDigLevel().then((level) => {
				setDigLevel(level);
			}).catch((e)=>{
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
			position={UDim2.fromScale(0.5, 0.56)}
			size={UDim2.fromScale(0.961, 0.588)}
			layoutOrder={3}
			productType={ProductType.DevProduct}
			productId={2683148761}
			predicate={() => {
				return digLevel < gameConstants.MAX_MULTIDIG_LEVEL;
			}}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://90053451030140"}
				key={"background"}
				Position={UDim2.fromScale(0.5, 0.503)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1.01)}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Top"}
				Position={UDim2.fromScale(0.238, 0.132)}
				Size={UDim2.fromScale(0.73, 0.224)}
				ZIndex={10}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalFlex={Enum.UIFlexAlignment.SpaceBetween}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.295, 0.823)}
					Size={UDim2.fromScale(0.589, 1.65)}
					Text={"Add 1+ shovel to every dig!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} />
				</textlabel>

				<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.01, 0)} />

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Timer"}
					Position={UDim2.fromScale(0.806, 0.5)}
					Size={UDim2.fromScale(0.388, 1)}
					Text={"24:00:00"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					Visible={false}
					TextXAlignment={Enum.TextXAlignment.Right}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Info"}
				Position={UDim2.fromScale(0.048, 0.355)}
				Size={UDim2.fromScale(0.904, 0.476)}
				ZIndex={10}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"PackageInfo"}
					Position={UDim2.fromScale(-0.0271, -0.37)}
					Size={UDim2.fromScale(0.201, 1.37)}
				>
					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={gameConstants.MULTI_DIG_ANIMATION_SPRITESHEET}
						key={"Animated Dig"}
						ref={animationRef}
						Position={UDim2.fromScale(0.555, 0.476)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(1, 1.07)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />

						<uistroke key={"UIStroke"} Color={Color3.fromRGB(0, 166, 116)} Thickness={4} />
					</imagelabel>
				</frame>

				<BuyButton
					position={UDim2.fromScale(0.88, 0.7)}
					id={2683148761}
					layoutOrder={2}
					size={UDim2.fromScale(0.258, 0.58)}
					productType={Enum.InfoType.Product}
				/>
			</frame>

			{/* Styling */}
			<canvasgroup
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Overlay"}
				Position={UDim2.fromScale(0.0117, 0.0589)}
				Size={UDim2.fromScale(0.978, 0.851)}
			>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

				<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.34} />

				<canvasgroup
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					GroupTransparency={0.84}
					key={"Overlay"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
				>
					<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(-0.0474, -0.227)}
						Size={UDim2.fromScale(0.188, 0.818)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.867, 0.427)}
						Size={UDim2.fromScale(0.188, 0.818)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.603, 0.664)}
						Rotation={-30}
						Size={UDim2.fromScale(0.113, 0.491)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.344, -0.323)}
						Rotation={71}
						Size={UDim2.fromScale(0.113, 0.491)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.157, 0.857)}
						Size={UDim2.fromScale(0.113, 0.491)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.197, -0.0859)}
						Rotation={71}
						Size={UDim2.fromScale(0.0609, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.407, 0.714)}
						Rotation={-30}
						Size={UDim2.fromScale(0.0609, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.563, 0.141)}
						Size={UDim2.fromScale(0.0609, 0.264)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.682, 0.343)}
						Rotation={73}
						Size={UDim2.fromScale(0.0609, 0.174)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.711, -0.168)}
						Rotation={-30}
						Size={UDim2.fromScale(0.0899, 0.39)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(-0.0237, 0.832)}
						Rotation={71}
						Size={UDim2.fromScale(0.0899, 0.39)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.34} />

					<imagelabel
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://101307691874432"}
						key={"Shovel"}
						Position={UDim2.fromScale(0.295, 0.394)}
						Rotation={73}
						Size={UDim2.fromScale(0.0609, 0.174)}
					>
						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</imagelabel>
				</canvasgroup>
			</canvasgroup>
		</AnimatedProductButton>
	);
};

const LimitedOffer = () => {
	return (
		<AnimatedProductButton
			position={UDim2.fromScale(0.5, 0.443)}
			size={UDim2.fromScale(0.961, 0.6)}
			scales={new NumberRange(0.975, 1.025)}
			layoutOrder={1}
			productType={ProductType.DevProduct}
			productId={1}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://125454463017246"}
				key={"background"}
				Position={UDim2.fromScale(0.5, 0.508)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(1, 1.02)}
			/>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Top"}
				Position={UDim2.fromScale(0.0252, 0.132)}
				Size={UDim2.fromScale(0.943, 0.224)}
			>
				<uilistlayout
					key={"UIListLayout"}
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalFlex={Enum.UIFlexAlignment.SpaceBetween}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.249, 0.5)}
					Size={UDim2.fromScale(0.499, 1)}
					Text={"Limited Offer!"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} />
				</textlabel>

				<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.01, 0)} />

				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Timer"}
					Position={UDim2.fromScale(0.249, 0.5)}
					Size={UDim2.fromScale(0.499, 1)}
					Text={"24:00:00"}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Right}
					ZIndex={10}
				>
					<uistroke key={"UIStroke"} Thickness={3} />
				</textlabel>
			</frame>

			<frame
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Info"}
				Position={UDim2.fromScale(0.048, 0.355)}
				Size={UDim2.fromScale(0.904, 0.476)}
			>
				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"PackageInfo"}
					Size={UDim2.fromScale(0.57, 1)}
				>
					<frame
						BackgroundColor3={Color3.fromRGB(170, 19, 22)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Item One"}
						Size={UDim2.fromScale(0.244, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://114369521200815"}
						key={"Plus"}
						Position={UDim2.fromScale(0.267, 0.49)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.091, 0.386)}
						ZIndex={10}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0947, 0)}
							PaddingLeft={new UDim(0.295, 0)}
							PaddingRight={new UDim(0.295, 0)}
							PaddingTop={new UDim(0.0947, 0)}
						/>
					</imagelabel>

					<frame
						BackgroundColor3={Color3.fromRGB(170, 19, 22)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Item Two"}
						Position={UDim2.fromScale(0.297, 0)}
						Size={UDim2.fromScale(0.244, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>

					<imagelabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						Image={"rbxassetid://114369521200815"}
						key={"Plus"}
						Position={UDim2.fromScale(0.559, 0.49)}
						ScaleType={Enum.ScaleType.Fit}
						Size={UDim2.fromScale(0.091, 0.386)}
						ZIndex={10}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0947, 0)}
							PaddingLeft={new UDim(0.295, 0)}
							PaddingRight={new UDim(0.295, 0)}
							PaddingTop={new UDim(0.0947, 0)}
						/>
					</imagelabel>

					<frame
						BackgroundColor3={Color3.fromRGB(170, 19, 22)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						key={"Item Three"}
						Position={UDim2.fromScale(0.579, 0)}
						Size={UDim2.fromScale(0.244, 1)}
					>
						<uicorner key={"UICorner"} CornerRadius={new UDim(1, 0)} />

						<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
					</frame>
				</frame>

				<BuyButton
					position={UDim2.fromScale(0.82, 0.5)}
					id={2683148761}
					layoutOrder={2}
					size={UDim2.fromScale(0.421, 0.58)}
					isDiscounted={true}
					discountedPrice={1299}
					productType={Enum.InfoType.Product}
				/>
			</frame>
		</AnimatedProductButton>
	);
};

interface CategoryProps {
	position: UDim2;
	size: UDim2;
	image: string;
	title: string;
	textSize: UDim2;
	padding: { left: UDim; right: UDim; top: UDim; bottom: UDim };
	scrollTo: (labelRef: React.RefObject<TextLabel>, scrollingRef: React.RefObject<ScrollingFrame>) => void;
	labelRef: React.RefObject<TextLabel>;
	scrollingRef: React.RefObject<ScrollingFrame>;
}

const CategoryButton = (category: CategoryProps) => {
	return (
		<AnimatedButton
			position={category.position}
			size={category.size}
			anchorPoint={new Vector2(0.5, 0.5)}
			onClick={() => category.scrollTo(category.labelRef, category.scrollingRef)}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Image={category.image}
				ScaleType={Enum.ScaleType.Fit}
			>
				<textlabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.458)}
					Size={category.textSize}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					Text={category.title}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke Thickness={3} />
					<uipadding
						PaddingBottom={category.padding.bottom}
						PaddingLeft={category.padding.left}
						PaddingRight={category.padding.right}
						PaddingTop={category.padding.top}
					/>
				</textlabel>
			</imagelabel>
		</AnimatedButton>
	);
};

export const scrollTo = (labelRef: React.RefObject<TextLabel>, scrollingRef: React.RefObject<ScrollingFrame>) => {
	const currentScrolling = scrollingRef.current;
	const currentLabel = labelRef.current;

	if (currentScrolling && currentLabel) {
		// Reset the CanvasPosition to 0, ensuring a clean starting point
		currentScrolling.CanvasPosition = new Vector2(0, 0);
		task.wait(); // Necessary wait to ensure the CanvasPosition is updated before scrolling.

		// Calculate the label's position within the canvas
		const labelOffset = currentLabel.AbsolutePosition.Y - currentScrolling.CanvasPosition.Y;

		// Calculate the desired CanvasPosition to center the label
		const centeredPosition = labelOffset - currentScrolling.AbsoluteSize.Y;

		// Clamp the position to ensure it stays within bounds
		const clampedPosition = math.clamp(
			centeredPosition,
			0,
			currentScrolling.AbsoluteCanvasSize.Y - currentScrolling.AbsoluteSize.Y,
		);

		// Set the CanvasPosition to the calculated clamped position
		currentScrolling.CanvasPosition = new Vector2(0, clampedPosition);
	}
};

interface AnimatedProductButtonProps {
	productId: number;
	productType: ProductType;
	size?: { X: { Scale: number }; Y: { Scale: number } };
	position?: UDim2;
	anchorPoint?: Vector2;
	scales?: NumberRange;
	layoutOrder?: number;
	children?: React.ReactNode;
	zindex?: number;
	predicate?: () => boolean;
}

export const AnimatedProductButton = (props: AnimatedProductButtonProps) => {
	return (
		<AnimatedButton
			size={props.size ? UDim2.fromScale(props.size.X.Scale, props.size.Y.Scale) : UDim2.fromScale(0.961, 0.588)}
			position={props.position}
			anchorPoint={props.anchorPoint}
			layoutOrder={props.layoutOrder ?? 0}
			zindex={props.zindex ?? 10}
			scales={props.scales}
			onClick={() => {
				// Prompt product purchase
				const canBuy = props.predicate ? props.predicate() : true;
				if (!canBuy) return;
				switch (props.productType) {
					case ProductType.GamePass:
						MarketplaceService.PromptGamePassPurchase(Players.LocalPlayer, props.productId);
					case ProductType.DevProduct:
						MarketplaceService.PromptProductPurchase(Players.LocalPlayer, props.productId);
				}
			}}
		>
			{React.Children.map(props.children, (child) => {
				return child;
			})}
		</AnimatedButton>
	);
};

interface GamepassButtonProps {
	gamepassId: number;
	gamepassName: string;
}

const GamepassButton = (props: GamepassButtonProps) => {
	return (
		<AnimatedProductButton
			position={UDim2.fromScale(0.105, -2.46e-7)}
			size={UDim2.fromScale(0.324, 2.12)}
			scales={new NumberRange(0.98, 1.02)}
			productType={ProductType.GamePass}
			productId={props.gamepassId}
		>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://116495925226068"}
				key={"Background"}
				Position={UDim2.fromScale(0.496, 0.494)}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.991, 0.989)}
			>
				<imagelabel
					key={"ImageLabel"}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://85733831609212"}
					LayoutOrder={1}
					Position={UDim2.fromScale(0.252, 0.281)}
					ScaleType={Enum.ScaleType.Fit}
					Size={UDim2.fromScale(0.495, 0.427)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
				</imagelabel>

				<textlabel
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					key={"Title"}
					Position={UDim2.fromScale(0.0929, 0.0989)}
					Size={UDim2.fromScale(0.817, 0.115)}
					Text={props.gamepassName}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextWrapped={true}
				>
					<uistroke key={"UIStroke"} Thickness={3} />

					<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.0984, 0)} PaddingRight={new UDim(0.0984, 0)} />
				</textlabel>

				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0.05, 0)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<BuyButton
					position={UDim2.fromScale(0.151, 0.727)}
					size={UDim2.fromScale(0.671, 0.173)}
					layoutOrder={2}
					id={props.gamepassId}
					productType={Enum.InfoType.GamePass}
				/>
			</imagelabel>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={0.85} />
		</AnimatedProductButton>
	);
};

interface GamepassShopProps {
	uiController: UiController;
	visible: boolean;
}

export const GamepassShopComponent = (props: GamepassShopProps) => {
	const [visible, setVisible] = React.useState(false);
	const [popInSz, popInMotion] = useMotion(UDim2.fromScale(0, 0));
	const [serverLuckTimer, setServerLuckTimer] = React.useState(0);
	const [serverLuck, setServerLuck] = React.useState(1);

	const menuRef = React.createRef<Frame>();
	const scrollingFrameRef = React.createRef<ScrollingFrame>();

	const LABEL_REFS = {
		featured: React.createRef<TextLabel>(),
		gamepasses: React.createRef<TextLabel>(),
		currency: React.createRef<TextLabel>(),
	};

	React.useEffect(() => {
		if (visible) {
			popInMotion.spring(UDim2.fromScale(0.849, 0.688), springs.responsive);

			const connection = Events.updateServerLuckMultiplier.connect((multiplier: number, time: number) => {
				setServerLuck(multiplier);
				setServerLuckTimer(time);
			});

			return () => {
				connection.Disconnect();
			};
		} else {
			popInMotion.immediate(UDim2.fromScale(0, 0));
		}
	}, [visible]);

	React.useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Shop Frame"}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={popInSz}
			ref={menuRef}
			Visible={visible}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"Shop Container"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(0.926, 0.857)}
				ZIndex={10}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://133515423550411"}
					key={"Background"}
					Position={UDim2.fromScale(0.5, 0.498)}
					ScaleType={Enum.ScaleType.Slice}
					Size={UDim2.fromScale(0.996, 1)}
					SliceCenter={new Rect(0.100000001, 0.100000001, 0.100000001, 0.100000001)}
				>
					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.66} />
				</imagelabel>

				<ExitButton
					uiController={props.uiController}
					uiName={gameConstants.GAMEPASS_SHOP_UI}
					menuRefToClose={menuRef}
					isMenuVisible={visible}
				/>

				<scrollingframe
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					// CanvasSize={new UDim2()}
					key={"Shop Scroll"}
					Position={UDim2.fromScale(0.0328, 0.24)}
					ScrollBarImageTransparency={1}
					Selectable={false}
					Size={UDim2.fromScale(0.937, 0.677)}
					ScrollBarThickness={0}
					ref={scrollingFrameRef}
					ClipsDescendants={true}
				>
					<uilistlayout
						key={"UIListLayout"}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0.05, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>

					<LimitedOffer />

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={6}
						key={"Cash"}
						Position={UDim2.fromScale(0.843, 0.0667)}
						Size={UDim2.fromScale(0.862, 0.133)}
						Text={"Cash"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={10}
						ref={LABEL_REFS.currency}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0909, 0)}
							PaddingLeft={new UDim(0.333, 0)}
							PaddingRight={new UDim(0.333, 0)}
							PaddingTop={new UDim(0.0909, 0)}
						/>

						<uistroke key={"UIStroke"} Thickness={4} />
					</textlabel>

					<AnimatedProductButton
						position={UDim2.fromScale(0.5, 0.56)}
						size={UDim2.fromScale(0.961, 0.588)}
						layoutOrder={2}
						productId={gameConstants.DEVPRODUCT_IDS.x2Luck}
						productType={ProductType.DevProduct}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://96502420337471"}
							key={"background"}
							Position={UDim2.fromScale(0.5, 0.503)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(1, 1.01)}
						/>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Top"}
							Position={UDim2.fromScale(0.0252, 0.132)}
							Size={UDim2.fromScale(0.943, 0.224)}
							ZIndex={10}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								HorizontalFlex={Enum.UIFlexAlignment.SpaceBetween}
								SortOrder={Enum.SortOrder.LayoutOrder}
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
								Position={UDim2.fromScale(0.249, 0.5)}
								Size={UDim2.fromScale(0.499, 1)}
								Text={"Multiply Server Luck!"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={3} />

								<uipadding key={"UIPadding"} />
							</textlabel>

							<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.01, 0)} />

							<textlabel
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								FontFace={
									new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								key={"Timer"}
								Position={UDim2.fromScale(0.752, 0.5)}
								Size={UDim2.fromScale(0.499, 1)}
								Text={string.format(
									"%02d:%02d:%02d",
									math.floor(serverLuckTimer / 3600),
									math.floor((serverLuckTimer % 3600) / 60),
									serverLuckTimer % 60,
								)}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Right}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={3} />
							</textlabel>
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Info"}
							Position={UDim2.fromScale(0.048, 0.355)}
							Size={UDim2.fromScale(0.904, 0.476)}
							ZIndex={10}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"PackageInfo"}
								Size={UDim2.fromScale(0.514, 1)}
							>
								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									AutomaticSize={Enum.AutomaticSize.X}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									FontFace={
										new Font(
											"rbxassetid://16658221428",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									key={"Current"}
									Position={UDim2.fromScale(0.165, 0.5)}
									Size={UDim2.fromScale(0.329, 0.728)}
									Text={"1x"}
									TextColor3={Color3.fromRGB(255, 255, 255)}
									TextScaled={true}
									TextWrapped={true}
									ZIndex={10}
								>
									<uistroke key={"UIStroke"} Thickness={4} />
								</textlabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://105860713661271"}
									LayoutOrder={1}
									key={"Arrow"}
									Position={UDim2.fromScale(0.246, 0.177)}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.174, 0.641)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									Padding={new UDim(0.025, 0)}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>

								<textlabel
									AnchorPoint={new Vector2(0.5, 0.5)}
									AutomaticSize={Enum.AutomaticSize.X}
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									FontFace={
										new Font(
											"rbxassetid://16658221428",
											Enum.FontWeight.Bold,
											Enum.FontStyle.Normal,
										)
									}
									LayoutOrder={2}
									key={"New"}
									Position={UDim2.fromScale(0.717, 0.5)}
									Size={UDim2.fromScale(0.329, 0.728)}
									Text={"2x"}
									TextColor3={Color3.fromRGB(255, 225, 0)}
									TextScaled={true}
									TextWrapped={true}
									ZIndex={10}
								>
									<uistroke key={"UIStroke"} Color={Color3.fromRGB(70, 44, 0)} Thickness={4} />
								</textlabel>
							</frame>

							<BuyButton
								id={gameConstants.DEVPRODUCT_IDS.x2Luck}
								position={UDim2.fromScale(0.76, 0.417)}
								size={UDim2.fromScale(0.258, 0.58)}
								productType={Enum.InfoType.Product}
								anchorPoint={new Vector2(0, 0)}
							/>
						</frame>

						<canvasgroup
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Overlay"}
							Position={UDim2.fromScale(0.0117, 0.0589)}
							Size={UDim2.fromScale(0.978, 0.851)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

							<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.34} />

							<canvasgroup
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								GroupTransparency={0.84}
								key={"Overlay"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(-0.0474, -0.227)}
									Size={UDim2.fromScale(0.188, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.867, 0.427)}
									Size={UDim2.fromScale(0.188, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.603, 0.664)}
									Size={UDim2.fromScale(0.113, 0.491)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.344, -0.323)}
									Size={UDim2.fromScale(0.113, 0.491)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.157, 0.857)}
									Size={UDim2.fromScale(0.113, 0.491)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.197, -0.0859)}
									Size={UDim2.fromScale(0.0609, 0.264)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.407, 0.714)}
									Size={UDim2.fromScale(0.0609, 0.264)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.563, 0.141)}
									Size={UDim2.fromScale(0.0609, 0.264)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.563, 0.141)}
									Size={UDim2.fromScale(0.0609, 0.264)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.711, -0.168)}
									Size={UDim2.fromScale(0.0899, 0.39)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://85733831609212"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(-0.0237, 0.832)}
									Size={UDim2.fromScale(0.0899, 0.39)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4.34} />
							</canvasgroup>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://85733831609212"}
								key={"Lucky Drop"}
								Position={UDim2.fromScale(0.453, 0.401)}
								Size={UDim2.fromScale(0.118, 0.513)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</canvasgroup>
					</AnimatedProductButton>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={4}
						key={"Gamepasses"}
						Position={UDim2.fromScale(0.843, 0.0667)}
						Size={UDim2.fromScale(0.862, 0.133)}
						Text={"Gamepasses"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={10}
						ref={LABEL_REFS.gamepasses}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0909, 0)}
							PaddingLeft={new UDim(0.333, 0)}
							PaddingRight={new UDim(0.333, 0)}
							PaddingTop={new UDim(0.0909, 0)}
						/>

						<uistroke key={"UIStroke"} Thickness={4} />
					</textlabel>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						LayoutOrder={5}
						key={"Gamepasses"}
						Position={UDim2.fromScale(0.0265, -0.819)}
						Size={UDim2.fromScale(0.947, 1.69)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.01, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							Wraps={true}
						/>

						<GamepassButton gamepassId={gameConstants.GAMEPASS_IDS.x2Cash} gamepassName={"x2 Cash!"} />
						{/* <GamepassButton gamepassId={gameConstants.GAMEPASS_IDS.x2Speed} gamepassName="x2 Speed!" /> */}
						<GamepassButton
							gamepassId={gameConstants.GAMEPASS_IDS.BiggerBackpack}
							gamepassName="Bigger Backpack!"
						/>
						<GamepassButton
							gamepassId={gameConstants.GAMEPASS_IDS.x2Strength}
							gamepassName="x2 Strength!"
						/>
						<GamepassButton
							gamepassId={gameConstants.GAMEPASS_IDS.SellEverywhere}
							gamepassName="Sell Everywhere!"
						/>
					</frame>

					<textlabel
						AnchorPoint={new Vector2(0.5, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Featured"}
						Position={UDim2.fromScale(0.843, 0.0667)}
						Size={UDim2.fromScale(0.862, 0.133)}
						Text={"Featured"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						ZIndex={10}
						ref={LABEL_REFS.featured}
					>
						<uipadding
							key={"UIPadding"}
							PaddingBottom={new UDim(0.0909, 0)}
							PaddingLeft={new UDim(0.333, 0)}
							PaddingRight={new UDim(0.333, 0)}
							PaddingTop={new UDim(0.0909, 0)}
						/>

						<uistroke key={"UIStroke"} Thickness={4} />
					</textlabel>

					<AnimatedProductButton
						position={UDim2.fromScale(0.5, 0.747)}
						size={UDim2.fromScale(0.961, 0.544)}
						layoutOrder={6}
						productType={ProductType.DevProduct}
						productId={gameConstants.DEVPRODUCT_IDS["1M Massive Money Pack"]}
					>
						<imagelabel
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							Image={"rbxassetid://108215122839008"}
							key={"background"}
							Position={UDim2.fromScale(0.5, 0.528)}
							ScaleType={Enum.ScaleType.Fit}
							Size={UDim2.fromScale(1, 1)}
						/>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Top"}
							Position={UDim2.fromScale(0.025, 0.22)}
							Size={UDim2.fromScale(0.943, 0.224)}
							ZIndex={10}
						>
							<uilistlayout
								key={"UIListLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								HorizontalFlex={Enum.UIFlexAlignment.SpaceBetween}
								SortOrder={Enum.SortOrder.LayoutOrder}
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
								Position={UDim2.fromScale(0.248, 0.61)}
								Size={UDim2.fromScale(0.499, 1)}
								Text={"$1,000,000 Cash!"}
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextWrapped={true}
								TextXAlignment={Enum.TextXAlignment.Left}
								ZIndex={10}
							>
								<uistroke key={"UIStroke"} Thickness={4} />

								<uipadding key={"UIPadding"} />
							</textlabel>

							<uipadding key={"UIPadding"} PaddingLeft={new UDim(0.01, 0)} />
						</frame>

						<frame
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Info"}
							Position={UDim2.fromScale(0.048, 0.355)}
							Size={UDim2.fromScale(0.904, 0.476)}
							ZIndex={10}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								key={"Price"}
								Position={UDim2.fromScale(0.735, 0.417)}
								Size={UDim2.fromScale(0.283, 0.58)}
							>
								<frame
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									key={"Buy Btn Frame"}
									Position={UDim2.fromScale(-0.0902, 0.00862)}
									Size={UDim2.fromScale(1, 1)}
								>
									<imagebutton
										AnchorPoint={new Vector2(0.5, 0.5)}
										BackgroundColor3={Color3.fromRGB(255, 255, 255)}
										BackgroundTransparency={1}
										BorderColor3={Color3.fromRGB(0, 0, 0)}
										BorderSizePixel={0}
										Image={"rbxassetid://92239062767450"}
										key={"Buy Btn"}
										Position={UDim2.fromScale(0.487, 0.5)}
										ScaleType={Enum.ScaleType.Slice}
										Size={UDim2.fromScale(0.849, 1.07)}
										SliceCenter={new Rect(47, 94, 539, 94)}
									>
										<frame
											AnchorPoint={new Vector2(0.5, 0.5)}
											BackgroundColor3={Color3.fromRGB(255, 255, 255)}
											BackgroundTransparency={1}
											BorderColor3={Color3.fromRGB(0, 0, 0)}
											BorderSizePixel={0}
											key={"Discount Number"}
											Position={UDim2.fromScale(0.5, 0.492)}
											Size={UDim2.fromScale(0.829, 0.524)}
										>
											<uilistlayout
												key={"UIListLayout"}
												FillDirection={Enum.FillDirection.Horizontal}
												HorizontalAlignment={Enum.HorizontalAlignment.Center}
												SortOrder={Enum.SortOrder.LayoutOrder}
												VerticalAlignment={Enum.VerticalAlignment.Center}
											/>

											<imagelabel
												BackgroundColor3={Color3.fromRGB(255, 255, 255)}
												BackgroundTransparency={1}
												BorderColor3={Color3.fromRGB(0, 0, 0)}
												BorderSizePixel={0}
												Image={"rbxassetid://114732216650363"}
												key={"Robux"}
												Position={UDim2.fromScale(0.0126, 0.129)}
												ScaleType={Enum.ScaleType.Fit}
												Size={UDim2.fromScale(0.227, 1)}
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
													new Font(
														"rbxassetid://16658221428",
														Enum.FontWeight.Bold,
														Enum.FontStyle.Normal,
													)
												}
												key={"Timer"}
												Position={UDim2.fromScale(0.656, 0.5)}
												Size={UDim2.fromScale(0.359, 1)}
												Text={"2999"}
												TextColor3={Color3.fromRGB(255, 255, 255)}
												TextScaled={true}
												TextWrapped={true}
												ZIndex={10}
											>
												<uistroke
													key={"UIStroke"}
													Color={Color3.fromRGB(8, 66, 34)}
													Thickness={3}
												/>
											</textlabel>
										</frame>
									</imagebutton>
								</frame>

								<uilistlayout
									key={"UIListLayout"}
									FillDirection={Enum.FillDirection.Horizontal}
									HorizontalAlignment={Enum.HorizontalAlignment.Right}
									SortOrder={Enum.SortOrder.LayoutOrder}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>
							</frame>
						</frame>

						<canvasgroup
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							BackgroundTransparency={1}
							BorderColor3={Color3.fromRGB(0, 0, 0)}
							BorderSizePixel={0}
							key={"Overlay"}
							Position={UDim2.fromScale(0.0117, 0.0911)}
							Size={UDim2.fromScale(0.978, 0.86)}
						>
							<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

							<canvasgroup
								AnchorPoint={new Vector2(0.5, 0.5)}
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								GroupTransparency={0.84}
								key={"Overlay"}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(1, 1)}
							>
								<uicorner key={"UICorner"} CornerRadius={new UDim(0.08, 0)} />

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(-0.0474, -0.227)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.188, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.849, 0.331)}
									Rotation={2}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.227, 1.02)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.344, -0.323)}
									Rotation={2}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.113, 0.491)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.157, 0.857)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.113, 0.491)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.197, -0.0859)}
									Rotation={5}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.0609, 0.264)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.271, 0.588)}
									Rotation={-11}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.0943, 0.424)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.563, 0.027)}
									Rotation={-14}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.109, 0.492)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.425, 0.279)}
									Rotation={20}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.107, 0.483)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.718, -0.196)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.114, 0.511)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(-0.0237, 0.832)}
									Rotation={-14}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.0899, 0.39)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.0851, 0.413)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.151, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.532, 0.635)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.151, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>

								<imagelabel
									BackgroundColor3={Color3.fromRGB(255, 255, 255)}
									BackgroundTransparency={1}
									BorderColor3={Color3.fromRGB(0, 0, 0)}
									BorderSizePixel={0}
									Image={"rbxassetid://112456131027742"}
									key={"Lucky Drop"}
									Position={UDim2.fromScale(0.913, -0.233)}
									Rotation={-17}
									ScaleType={Enum.ScaleType.Fit}
									Size={UDim2.fromScale(0.151, 0.818)}
								>
									<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
								</imagelabel>
							</canvasgroup>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(-0.432, -1.1)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.38, 0.217)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.558, 0.15)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.745, -0.261)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.175, 0.21)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(0.0116, 0.0218)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>

							<imagelabel
								BackgroundColor3={Color3.fromRGB(255, 255, 255)}
								BackgroundTransparency={1}
								BorderColor3={Color3.fromRGB(0, 0, 0)}
								BorderSizePixel={0}
								Image={"rbxassetid://80750357728790"}
								key={"Money Cover"}
								Position={UDim2.fromScale(-0.174, -0.261)}
								Size={UDim2.fromScale(0.497, 2.31)}
							>
								<uiaspectratioconstraint key={"UIAspectRatioConstraint"} />
							</imagelabel>
						</canvasgroup>
					</AnimatedProductButton>

					<frame
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						LayoutOrder={7}
						key={"Cash Products"}
						Position={UDim2.fromScale(0.0265, -0.687)}
						Size={UDim2.fromScale(0.947, 2.75)}
					>
						<uilistlayout
							key={"UIListLayout"}
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							Padding={new UDim(0.01, 0)}
							SortOrder={Enum.SortOrder.LayoutOrder}
							Wraps={true}
						/>

						<CashProduct
							layoutOrder={1}
							id={gameConstants.DEVPRODUCT_IDS["1k Money Pack"]}
							title="Tiny Cash!"
							icon="rbxassetid://82377284011764"
						/>
						<CashProduct
							layoutOrder={2}
							id={gameConstants.DEVPRODUCT_IDS["2.5k Money Pack"]}
							title="Small Cash!"
							icon="rbxassetid://89261366341053"
						/>
						<CashProduct
							layoutOrder={3}
							id={gameConstants.DEVPRODUCT_IDS["7.5k Money Pack"]}
							title="Medium Cash!"
							icon="rbxassetid://121228438692066"
						/>
						<CashProduct
							layoutOrder={4}
							id={gameConstants.DEVPRODUCT_IDS["15k Money Pack"]}
							title="Large Cash!"
							icon="rbxassetid://76204918792364"
						/>
						<CashProduct
							layoutOrder={5}
							id={gameConstants.DEVPRODUCT_IDS["40k Money Pack"]}
							title="Bigger Cash!"
							icon="rbxassetid://136338731838654"
						/>
						<CashProduct
							layoutOrder={6}
							id={gameConstants.DEVPRODUCT_IDS["75k Medium Money Pack"]}
							title="Massive Cash!"
							icon="rbxassetid://136338731838654"
						/>
						<CashProduct
							layoutOrder={7}
							id={gameConstants.DEVPRODUCT_IDS["250k Big Money Pack"]}
							title="Extreme Cash!"
							icon="rbxassetid://136338731838654"
						/>
						<CashProduct
							layoutOrder={8}
							id={gameConstants.DEVPRODUCT_IDS["1M Massive Money Pack"]}
							title="Crazy Cash!"
							icon="rbxassetid://136338731838654"
						/>
					</frame>

					<DigProduct runAnimation={visible} />
				</scrollingframe>

				<frame
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					key={"Categorie Btns"}
					Position={UDim2.fromScale(0.037, 0.0618)}
					Size={UDim2.fromScale(0.909, 0.136)}
				>
					<CategoryButton
						position={UDim2.fromScale(0.25, 0.5)}
						title="Featured"
						image="rbxassetid://110266677683163"
						size={UDim2.fromScale(0.243, 1)}
						textSize={UDim2.fromScale(0.6, 0.4)}
						padding={{
							left: new UDim(0.0761, 0),
							right: new UDim(0.0761, 0),
							top: new UDim(0.0117, 0),
							bottom: new UDim(0.0117, 0),
						}}
						scrollTo={scrollTo}
						labelRef={LABEL_REFS.featured}
						scrollingRef={scrollingFrameRef}
					/>
					<CategoryButton
						position={UDim2.fromScale(0.5, 0.5)}
						title="Gamepasses"
						image="rbxassetid://88060006178573"
						size={UDim2.fromScale(0.243, 1)}
						textSize={UDim2.fromScale(0.82, 0.4)}
						padding={{
							left: new UDim(0.0698, 0),
							right: new UDim(0.0698, 0),
							top: new UDim(0.0117, 0),
							bottom: new UDim(0.0117, 0),
						}}
						scrollTo={scrollTo}
						labelRef={LABEL_REFS.gamepasses}
						scrollingRef={scrollingFrameRef}
					/>
					<CategoryButton
						position={UDim2.fromScale(0.75, 0.5)}
						title="Currency"
						image="rbxassetid://129641532473595"
						size={UDim2.fromScale(0.243, 1)}
						textSize={UDim2.fromScale(0.825, 0.4)}
						padding={{
							left: new UDim(0.192, 0),
							right: new UDim(0.192, 0),
							top: new UDim(0.0117, 0),
							bottom: new UDim(0.0117, 0),
						}}
						scrollTo={scrollTo}
						labelRef={LABEL_REFS.currency}
						scrollingRef={scrollingFrameRef}
					/>

					<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={11.1} />
				</frame>
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={1.55} />
		</frame>
	);
};
