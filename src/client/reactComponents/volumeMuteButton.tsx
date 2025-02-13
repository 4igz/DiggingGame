import React, { useEffect } from "@rbxts/react";
import { AnimatedButton } from "./mainUi";
import { SoundService } from "@rbxts/services";

const areasSoundGroup = SoundService.WaitForChild("Areas") as SoundGroup;
const areasStartVolume = areasSoundGroup.Volume;

export const VolumeMuteButton = () => {
	const [muted, setMuted] = React.useState(false);

	useEffect(() => {
		areasSoundGroup.Volume = muted ? 0 : areasStartVolume;
	}, [muted]);

	return (
		<AnimatedButton
			size={UDim2.fromScale(0.1, 0.1)}
			position={new UDim2(1, -15, 1, -15)}
			anchorPoint={new Vector2(1, 1)}
			onClick={() => setMuted(!muted)}
		>
			<imagelabel
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Image={muted ? "rbxassetid://124146564458868" : "rbxassetid://80637397486717"}
			/>
			<uiaspectratioconstraint AspectRatio={1} />
		</AnimatedButton>
	);
};
