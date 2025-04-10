//!optimize 2
import React, { useEffect } from "@rbxts/react";
import { SoundService } from "@rbxts/services";
import { Signals } from "shared/signals";
import { AnimatedButton } from "./buttons";

const areasSoundGroup = SoundService.WaitForChild("Areas") as SoundGroup;
const areasStartVolume = areasSoundGroup.Volume;

const mutedImage = "rbxassetid://105294387354233";
const playingImage = "rbxassetid://70506456828196";

export const VolumeMuteButton = () => {
	const [muted, setMuted] = React.useState(false);

	useEffect(() => {
		areasSoundGroup.Volume = muted ? 0 : areasStartVolume;
	}, [muted]);

	return (
		<AnimatedButton
			size={UDim2.fromScale(0.1, 0.1)}
			position={UDim2.fromScale(1, 1)}
			anchorPoint={new Vector2(1, 1)}
			onClick={() => {
				setMuted(!muted);
				if (!muted) {
					Signals.invalidAction.Fire("Muted music");
				} else {
					Signals.actionPopup.Fire("Now playing music");
				}
			}}
		>
			<imagelabel
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Image={muted ? mutedImage : playingImage}
			/>
			<uiaspectratioconstraint AspectRatio={1} />
		</AnimatedButton>
	);
};
