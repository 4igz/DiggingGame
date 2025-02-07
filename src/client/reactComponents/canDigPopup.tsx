import React, { useEffect } from "@rbxts/react";
import { Events } from "client/network";
import { Signals } from "shared/signals";

const Shovel = "rbxassetid://80703918143921";
const XShovel = "rbxassetid://79006133321536";
export = () => {
	const [visible, setVisible] = React.useState(false);
	const [digEnabled, setDigEnabled] = React.useState(false);

	useEffect(() => {
		Events.canDig.connect((canDig) => {
			setDigEnabled(canDig);
		});

		Signals.setCanDig.Connect((canDig) => {
			setDigEnabled(canDig);
		});

		Signals.setShovelEquipped.Connect((equipped) => {
			setVisible(equipped);
		});
	}, []);

	return (
		<imagelabel
			AnchorPoint={new Vector2(0, 1)}
			Position={UDim2.fromScale(0, 1)}
			Image={digEnabled ? Shovel : XShovel}
			Visible={visible}
			BackgroundTransparency={1}
		/>
	);
};
