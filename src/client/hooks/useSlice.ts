//!optimize 2
import { useCamera, useDebounceState, useEventListener } from "@rbxts/pretty-react-hooks";
import { useEffect, useMemo } from "@rbxts/react";
import { Players, StarterGui } from "@rbxts/services";

const screenGui = new Instance("ScreenGui", Players.LocalPlayer.WaitForChild("PlayerGui"));

export interface SliceScaleFunction {
	/**
	 * Returns the scaled SliceScale value based on the current viewport size.
	 */
	(originalScale: number): number;
	/**
	 * Returns the raw scale ratio without applying it to any value.
	 */
	ratio: () => number;
}

const BASE_RESOLUTION = new Vector2(1280, 832);

/**
 * Calculates the scale ratio based on the current viewport size
 */
function calculateSliceRatio() {
	return screenGui.AbsoluteSize.Y / BASE_RESOLUTION.Y;
}

/**
 * A React hook for Roblox that scales SliceScale values based on screen size
 * @returns A function to calculate the appropriate SliceScale for the current viewport
 */
export function useSliceScale(): SliceScaleFunction {
	const camera = useCamera();

	const [ratio, setRatio] = useDebounceState(calculateSliceRatio(), {
		wait: 0.2,
		leading: true,
	});

	useEventListener(screenGui.GetPropertyChangedSignal("AbsoluteSize"), () => {
		setRatio(calculateSliceRatio());
	});

	useEffect(() => {
		task.delay(0.5, () => {
			setRatio(calculateSliceRatio());
		});
	}, []);

	return useMemo(() => {
		const api = {
			ratio: () => ratio,
		};

		setmetatable(api, {
			__call: (_, originalScale) => (originalScale as number) * ratio,
		});

		return api as SliceScaleFunction;
	}, [ratio]);
}
