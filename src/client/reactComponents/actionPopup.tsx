import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { usePx } from "client/hooks/usePx";
import { springs } from "client/utils/springs";

const POPUP_TIME = 3;

export interface ActionPopupProps {
	onComplete: () => void;
	text?: string;
	count?: number; // NEW: optional count parameter
}

export const ActionPopup = (props: ActionPopupProps) => {
	const [popupSize, setSizeMotion] = useMotion(UDim2.fromScale(0, 0));
	const popupText = "✅ " + (props.text ?? "Done!");
	const count = props.count ?? 1; // Use provided count or default to 1

	const px = usePx();

	useEffect(() => {
		// Animate the popup
		setSizeMotion.spring(UDim2.fromScale(0.233, 0.2), springs.bubbly);

		// Set a timer to close the popup
		const closeTimer = task.delay(POPUP_TIME, () => {
			setSizeMotion.onComplete(() => {
				// Call the onComplete callback from props
				props.onComplete();
			});
			setSizeMotion.spring(UDim2.fromScale(0, 0), springs.responsive);
		});

		// Clean up if component unmounts before animation completes
		return () => {
			task.cancel(closeTimer);
		};
	}, []);

	// Format the display text with counter if count > 1
	const displayText = count > 1 ? `${popupText} (x${count})` : popupText;

	return (
		<frame
			key={popupText}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Position={UDim2.fromScale(0.5, 0.75)}
			Size={popupSize}
		>
			<textlabel
				key={"TextLabel"}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				FontFace={
					new Font("rbxasset://fonts/families/FredokaOne.json", Enum.FontWeight.Bold, Enum.FontStyle.Normal)
				}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(4, 0.4)}
				Text={displayText}
				TextColor3={new Color3(0.2, 1, 0.24)}
				TextScaled={true}
				ZIndex={10}
			>
				<uistroke key={"UIStroke"} Thickness={px(3.4)} />

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundColor3={new Color3(1, 1, 1)}
					BorderColor3={new Color3()}
					BorderSizePixel={0}
					key={"Claim"}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1.5)}
					ZIndex={0}
				>
					<uigradient
						key={"UIGradient"}
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, new Color3(0.459, 0.459, 0.459)),
								new ColorSequenceKeypoint(1, new Color3(0.459, 0.459, 0.459)),
							])
						}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 1),
								new NumberSequenceKeypoint(0.501, 0.494),
								new NumberSequenceKeypoint(1, 1),
							])
						}
					/>

					<uistroke key={"UIStroke"} Color={new Color3(1, 1, 1)} Thickness={px(3)} Transparency={0.8}>
						<uigradient
							key={"UIGradient"}
							Transparency={
								new NumberSequence([
									new NumberSequenceKeypoint(0, 1),
									new NumberSequenceKeypoint(0.0362, 1),
									new NumberSequenceKeypoint(0.5, 0),
									new NumberSequenceKeypoint(0.951, 1),
									new NumberSequenceKeypoint(1, 1),
								])
							}
						/>
					</uistroke>
				</frame>
			</textlabel>
		</frame>
	);
};
