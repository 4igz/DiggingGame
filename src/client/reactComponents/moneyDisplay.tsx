import React from "@rbxts/react";
import { useMotion } from "client/hooks/useMotion";
import { Events } from "client/network";
import { springs } from "client/utils/springs";
import EternityNum from "shared/util/eternityNum";

interface MoneyDisplayProps {
	amount?: string;
}

export const MoneyDisplay = (props: MoneyDisplayProps) => {
	const [money, setMoney] = React.useState(props.amount ?? "0");
	const [moneyTextScale, setScale] = useMotion(0.7);

	React.useEffect(() => {
		const connection = Events.updateMoney.connect((newAmount) => {
			const newAmountNum = EternityNum.fromString(newAmount);
			const startAmount = EternityNum.fromString(money);

			const diff = EternityNum.sub(newAmountNum, startAmount);
			const steps = 30;
			const stepAmount = EternityNum.div(diff, EternityNum.fromNumber(steps));

			let currentStep = 0;

			const update = () => {
				if (currentStep >= steps) {
					setMoney(newAmount); // Finalize the amount
					setScale.spring(0.7, springs.bubbly);
					return;
				}

				const newStepAmount = EternityNum.add(
					startAmount,
					EternityNum.mul(stepAmount, EternityNum.fromNumber(currentStep)),
				);
				setMoney(EternityNum.toString(newStepAmount));

				const maxFactor = 2; // Maximum scaling at 2x the current money
				const minFactor = 0.1; // Scale starts at this proportion

				// Calculate the proportion relative to startAmount
				const proportion = math.abs(
					EternityNum.toNumber(diff) / math.max(1, EternityNum.toNumber(startAmount)),
				);

				// Map proportion directly to scale
				const minScale = 0.7; // Scale when proportion is 0.1
				const maxScale = 1.5; // Scale when proportion is 2.0

				// Interpolate between minScale and maxScale
				let scale = 0;
				if (proportion <= minFactor) {
					scale = minScale; // Ensure scale is exactly 0.7 when proportion is 0.1
				} else {
					const normalizedProportion = math.min(1, (proportion - minFactor) / (maxFactor - minFactor));
					scale = minScale + normalizedProportion * (maxScale - minScale);
				}

				setScale.spring(scale, springs.responsive);

				currentStep++;
				task.delay(0.03, update);
			};

			update();
		});

		return () => {
			connection.Disconnect();
		};
	}, [money]);

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={0}
			key={"Cash"}
			Position={UDim2.fromScale(0.965, 0.95)}
			AnchorPoint={new Vector2(1, 1)}
			Size={UDim2.fromScale(0.143, 0.0822)}
		>
			<uicorner key={"UICorner"} CornerRadius={new UDim(10, 0)} />

			<textlabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				FontFace={
					new Font(
						"rbxasset://fonts/families/ComicNeueAngular.json",
						Enum.FontWeight.Bold,
						Enum.FontStyle.Normal,
					)
				}
				key={"Amount"}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={moneyTextScale.map((v) => {
					return UDim2.fromScale(1, v);
				})}
				Text={EternityNum.short(EternityNum.fromString(money))}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextWrapped={true}
			>
				<uistroke key={"UIStroke"} Color={Color3.fromRGB(0, 98, 13)} Thickness={3} />
			</textlabel>

			<uigradient
				key={"UIGradient"}
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(0, 147, 22)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(0, 182, 24)),
					])
				}
				Rotation={-90}
			/>

			<imagelabel
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(0, 0, 0)}
				BorderSizePixel={0}
				Image={"rbxassetid://130520870188449"}
				key={"WalletIcon"}
				Position={UDim2.fromScale(-0.15, -0.411)}
				Rotation={-15}
				ScaleType={Enum.ScaleType.Fit}
				Size={UDim2.fromScale(0.491, 1.2)}
			/>

			<uistroke key={"UIStroke"} Color={Color3.fromRGB(0, 48, 6)} Thickness={3} />
		</frame>
	);
};
