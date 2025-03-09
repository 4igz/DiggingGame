//!optimize 2
import Object from "@rbxts/object-utils";
import React from "@rbxts/react";
import { DialogResponse, QUEST_ACCEPT, QUEST_DECLINE } from "shared/config/questConfig";
import { AnimatedButton } from "./inventory";

interface DialogOptionProps {
	description: string;
	order: number;
	onClick: () => void;
}

const DialogOption = (props: DialogOptionProps) => {
	return (
		<AnimatedButton
			anchorPoint={new Vector2(0.5, 0)}
			key={"Option"}
			position={UDim2.fromScale(0.5, 0.616)}
			selectable={true}
			size={UDim2.fromScale(1, 0.5)}
			layoutOrder={props.order}
			onClick={props.onClick}
		>
			<imagelabel
				Image={"rbxassetid://93052669177101"}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				ScaleType={Enum.ScaleType.Slice}
				SliceCenter={new Rect(19, 15, 469, 71)}
				SliceScale={0.8}
			>
				<imagelabel
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 255, 255)}
					BackgroundTransparency={1}
					BorderColor3={Color3.fromRGB(0, 0, 0)}
					BorderSizePixel={0}
					Image={"rbxassetid://121290859696439"}
					key={"Shadow"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1.1, 1.1)}
					ZIndex={0}
				/>

				<folder key={"Option Elements"}>
					<textlabel
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						LayoutOrder={2}
						key={"Description"}
						Position={UDim2.fromScale(0.182, 0.463)}
						Size={UDim2.fromScale(0.785, 0.7)}
						Text={props.description}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					>
						<uistroke
							key={"UIStroke"}
							Enabled={false}
							LineJoinMode={Enum.LineJoinMode.Bevel}
							Thickness={2}
							Transparency={0.4}
						/>
					</textlabel>

					<textlabel
						AnchorPoint={new Vector2(0, 0.5)}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						BackgroundTransparency={1}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						key={"Number"}
						Position={UDim2.fromScale(0.042, 0.5)}
						Size={UDim2.fromScale(0.0519, 0.8)}
						Text={tostring(props.order)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<uistroke
							key={"UIStroke"}
							Enabled={false}
							LineJoinMode={Enum.LineJoinMode.Bevel}
							Thickness={2}
							Transparency={0.4}
						/>
					</textlabel>

					<uilistlayout
						key={"UIListLayout"}
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0, 8)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>

					<frame
						BackgroundColor3={Color3.fromRGB(37, 52, 99)}
						BorderColor3={Color3.fromRGB(0, 0, 0)}
						BorderSizePixel={0}
						LayoutOrder={1}
						key={"Divider"}
						Position={UDim2.fromScale(0.135, 0.15)}
						Size={new UDim2(0, 4, 0.7, 0)}
					/>
				</folder>

				<uipadding key={"UIPadding"} PaddingBottom={new UDim(0.05, 0)} />

				<uiscale key={"UIScale"} Scale={0.9} />
			</imagelabel>
		</AnimatedButton>
	);
};

interface DialogResponseProps {
	options?: Record<DialogResponse, string>;
	onOptionSelected?: (optionIndex?: DialogResponse) => DialogResponse;
	resetTrigger?: number;
}

export const DialogResponseComponent = (props: DialogResponseProps) => {
	const [selectedOption, setSelectedOption] = React.useState<DialogResponse | undefined>(undefined);
	const [options, setOptions] = React.useState<Record<DialogResponse, string> | undefined>(undefined);

	React.useEffect(() => {
		if (props.options) {
			setOptions(props.options);
			setSelectedOption(undefined);
		} else {
			props.onOptionSelected?.(undefined);
		}
	}, [props.options, props.resetTrigger]);

	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={1}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Options"}
			Position={UDim2.fromScale(0.5, 0.75)}
			Size={UDim2.fromScale(0.294, 0.198)}
			Visible={options !== undefined && selectedOption === undefined}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				key={"List"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					key={"UIListLayout"}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0, 5)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				{options &&
					Object.entries(options).map(([responseType, message]) => {
						return (
							<DialogOption
								description={message}
								order={responseType}
								onClick={() => {
									props.onOptionSelected?.(responseType);
									setSelectedOption(responseType);
								}}
							/>
						);
					})}
			</frame>

			<uiaspectratioconstraint key={"UIAspectRatioConstraint"} AspectRatio={4} />
		</frame>
	);
};
