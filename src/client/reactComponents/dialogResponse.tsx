//!optimize 2
//!native
import Object from "@rbxts/object-utils";
import React from "@rbxts/react";
import { DialogResponse, QUEST_ACCEPT } from "shared/config/questConfig";

interface DialogResponseProps {
	options?: Record<DialogResponse, string>;
	onOptionSelected?: (optionIndex: DialogResponse) => DialogResponse;
	resetTrigger?: number;
}

export const DialogResponseComponent = (props: DialogResponseProps) => {
	const [selectedOption, setSelectedOption] = React.useState<DialogResponse | undefined>(undefined);
	const [options, setOptions] = React.useState<Record<DialogResponse, string> | undefined>();

	React.useEffect(() => {
		if (props.options) {
			setOptions(props.options);
			setSelectedOption(undefined);
		}
	}, [props.options, props.resetTrigger]);

	return (
		<frame
			BackgroundTransparency={1}
			Size={UDim2.fromScale(0.2, 0.2)}
			AnchorPoint={new Vector2(0, 0.5)}
			Position={UDim2.fromScale(0.6, 0.5)}
			Visible={selectedOption === undefined}
		>
			<uilistlayout FillDirection="Vertical" Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{options &&
				Object.entries(options).map(([responseType, message]) => {
					return (
						<textbutton
							Size={new UDim2(1, 0, 0.33, 0)}
							LayoutOrder={responseType === QUEST_ACCEPT ? 1 : responseType === "QUEST_DECLINE" ? 2 : 3}
							Text={message}
							TextScaled={true}
							BackgroundTransparency={0.5}
							BackgroundColor3={new Color3(0.23, 0.23, 0.23)}
							TextColor3={new Color3(1, 1, 1)}
							Event={{
								MouseButton1Click: () => {
									props.onOptionSelected?.(responseType);
									setSelectedOption(responseType);
								},
							}}
						/>
					);
				})}
		</frame>
	);
};
