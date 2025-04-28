//!optimize 2
import React, { useEffect, useState } from "@rbxts/react";

interface TypewriterBillboardProps {
	part: BasePart;
	text: string; // The text to typewrite
	typingSpeed?: number; // Characters per second (optional, default is 10)
	onFinish?: () => void; // Callback or functionality to run when the typewriter finishes
	resetTrigger?: number;
}

const TypewriterBillboard: React.FC<TypewriterBillboardProps> = (props) => {
	const [displayedText, setDisplayedText] = useState("");

	useEffect(() => {
		const totalCharacters = props.text.size();
		const typingSpeed = props.typingSpeed || 10; // Default 10 characters per second
		const interval = 1 / typingSpeed;
		let index = 0;

		const typewriterTask = task.spawn(() => {
			while (index < totalCharacters) {
				index++;
				setDisplayedText(props.text.sub(0, index));
				task.wait(interval);
			}
			task.defer(() => {
				props.onFinish?.();
			});
		});

		return () => {
			if (coroutine.status(typewriterTask) === "running") task.cancel(typewriterTask);
		};
	}, [props.text, props.typingSpeed, props.resetTrigger]);

	return (
		<billboardgui
			Adornee={props.part}
			Size={new UDim2(5, 0, 2, 0)}
			StudsOffset={new Vector3(0, 3, 0)}
			AlwaysOnTop={true}
		>
			<textlabel
				BackgroundTransparency={1}
				Size={new UDim2(1, 0, 1, 0)}
				Text={displayedText}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={24}
				TextScaled={false}
				Font={Enum.Font.GothamBold}
				RichText={true}
			/>
		</billboardgui>
	);
};

export default TypewriterBillboard;
