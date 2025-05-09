import React, { useEffect, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { usePx } from "client/hooks/usePx";
import { Reward } from "shared/networkTypes";
import { shortenNumber } from "shared/util/nameUtil";
import { getRewardStats } from "shared/util/rewardUtil";

// Create a new component for cursor-following tooltips
interface CursorTooltipProps {
	children?: React.Element;
	visible: boolean;
	offset?: Vector2;
	zIndex?: number;
}

export const CursorTooltip = (props: CursorTooltipProps) => {
	const px = usePx();
	const [position, setPosition] = useState(UDim2.fromOffset(0, 0));
	const offset = props.offset ?? new Vector2(20, 20);
	const zIndex = props.zIndex ?? 10000;

	// Set up a global mouse tracking effect
	useEffect(() => {
		if (!props.visible) return;

		// Function to update position
		const updatePosition = (input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				const mousePos = UserInputService.GetMouseLocation();
				setPosition(UDim2.fromOffset(mousePos.X + offset.X, mousePos.Y + offset.Y));
			}
		};

		// Get initial position
		const mousePos = UserInputService.GetMouseLocation();
		setPosition(UDim2.fromOffset(mousePos.X + offset.X, mousePos.Y + offset.Y));

		// Connect to input changed event
		const connection = UserInputService.InputChanged.Connect(updatePosition);

		return () => {
			connection.Disconnect();
		};
	}, [props.visible, offset]);

	return (
		<screengui
			ResetOnSpawn={false}
			ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
			IgnoreGuiInset={true}
			DisplayOrder={10}
			Enabled={props.visible}
		>
			<frame
				AnchorPoint={new Vector2(0, 0)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundColor3={new Color3()}
				BackgroundTransparency={0.3}
				BorderColor3={Color3.fromRGB(27, 42, 53)}
				BorderSizePixel={0}
				Position={position}
				ZIndex={zIndex}
			>
				{props.children}

				<uistroke
					key={"UIStrokeBorder"}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Thickness={px(10)}
					Transparency={0.3}
				/>
				<uistroke
					key={"UIStrokeContextual"}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
					Thickness={px(2)}
					Transparency={0.3}
					Color={new Color3()}
				/>
				<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />
				<uipadding
					key={"UIPadding"}
					PaddingTop={new UDim(0.05, 0)}
					PaddingBottom={new UDim(0.05, 0)}
					PaddingLeft={new UDim(0.05, 0)}
					PaddingRight={new UDim(0.05, 0)}
				/>
			</frame>
		</screengui>
	);
};

// First, update the Tooltip component to focus on cursor following
interface TooltipProps {
	visible: boolean;
	zIndex?: number;
	children?: React.Element;
	offset?: Vector2;
}

export const Tooltip = (props: TooltipProps) => {
	const px = usePx();
	const zIndex = props.zIndex ?? 100;
	const [cursorPosition, setCursorPosition] = useState(UDim2.fromOffset(0, 0));
	const offset = props.offset ?? new Vector2(20, 20);

	// Set up cursor tracking when visible
	useEffect(() => {
		if (!props.visible) return;

		const connection = UserInputService.InputChanged.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				const mousePos = UserInputService.GetMouseLocation();
				setCursorPosition(UDim2.fromOffset(mousePos.X + offset.X, mousePos.Y + offset.Y));
			}
		});

		return () => {
			connection.Disconnect();
		};
	}, [props.visible, offset]);

	return (
		<frame
			AnchorPoint={new Vector2(0, 0)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundColor3={new Color3()}
			BackgroundTransparency={0.3}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			BorderSizePixel={0}
			key={"ToolTip"}
			Position={cursorPosition}
			Size={UDim2.fromScale(0.3, 0.2)}
			ZIndex={zIndex}
			Visible={props.visible}
		>
			{props.children}

			<uistroke
				key={"UIStrokeBorder"}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={px(10)}
				Transparency={0.3}
			/>
			<uistroke
				key={"UIStrokeContextual"}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Contextual}
				Thickness={px(2)}
				Transparency={0.3}
				Color={new Color3()}
			/>
			<uicorner key={"UICorner"} CornerRadius={new UDim(0.1, 0)} />
			<uipadding
				key={"UIPadding"}
				PaddingTop={new UDim(0.05, 0)}
				PaddingBottom={new UDim(0.05, 0)}
				PaddingLeft={new UDim(0.05, 0)}
				PaddingRight={new UDim(0.05, 0)}
			/>
		</frame>
	);
};

interface TooltipStatsProps {
	reward: Reward;
	visible: boolean;
	title?: string;
	offset?: Vector2;
}

export const TooltipStats = (props: TooltipStatsProps) => {
	const px = usePx();

	return (
		<CursorTooltip visible={props.visible} offset={props.offset}>
			<frame BackgroundTransparency={1} Size={UDim2.fromOffset(px(120), px(50))}>
				<uilistlayout
					key={"UIListLayout"}
					Padding={new UDim(0.05, 5)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					FillDirection={Enum.FillDirection.Vertical}
				/>

				{props.title !== undefined && (
					<textlabel
						BackgroundTransparency={1}
						FontFace={new Font("rbxassetid://16658221428", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
						Text={props.title}
						TextColor3={new Color3(1, 1, 1)}
						TextSize={px(18)}
						Size={UDim2.fromScale(1, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						TextWrapped={true}
						LayoutOrder={1}
					/>
				)}

				<frame
					BackgroundTransparency={1}
					Size={UDim2.fromScale(1, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					LayoutOrder={2}
				>
					<uilistlayout key={"StatsLayout"} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />

					{getRewardStats(props.reward).map((stat, index) => (
						<frame
							key={stat.key}
							BackgroundTransparency={1}
							Size={UDim2.fromScale(1, 0)}
							AutomaticSize={Enum.AutomaticSize.Y}
							LayoutOrder={index}
						>
							<uilistlayout
								key={"RowLayout"}
								FillDirection={Enum.FillDirection.Horizontal}
								Padding={new UDim(0.05, 10)}
								VerticalAlignment={Enum.VerticalAlignment.Center}
							/>

							<imagelabel
								BackgroundTransparency={1}
								Image={stat.icon ?? "rbxassetid://85733831609212"}
								Size={UDim2.fromOffset(32, 32)}
								ScaleType={Enum.ScaleType.Fit}
							/>

							<textlabel
								BackgroundTransparency={1}
								FontFace={
									new Font("rbxassetid://11702779409", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
								}
								Text={`x${shortenNumber(tonumber(stat.value) ?? 0)}`}
								TextColor3={new Color3(1, 1, 1)}
								TextSize={px(24)}
								Size={UDim2.fromScale(0, 1)}
								AutomaticSize={Enum.AutomaticSize.X}
								TextXAlignment={Enum.TextXAlignment.Left}
							>
								<uistroke key={"UIStroke"} Thickness={px(1.5)} />
							</textlabel>
						</frame>
					))}
				</frame>
			</frame>
		</CursorTooltip>
	);
};
