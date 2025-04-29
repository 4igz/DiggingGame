//!optimize 2
import { useCamera, useDebounceState, useEventListener } from "@rbxts/pretty-react-hooks";
import { useEffect, useMemo } from "@rbxts/react";

const BASE_RESOLUTION = new Vector2(1280, 832);
const MIN_SCALE = 0.1;
const DOMINANT_AXIS = 0.5;

/**
 * Calculates the appropriate scale factor based on the current viewport size
 */
function calculateScale(viewport: Vector2): number {
	const width = math.log(viewport.X / BASE_RESOLUTION.X, 2);
	const height = math.log(viewport.Y / BASE_RESOLUTION.Y, 2);
	const centered = width + (height - width) * DOMINANT_AXIS;

	return math.max(2 ** centered, MIN_SCALE);
}

/**
 * Hook that returns a function to scale SliceScale values based on viewport size
 */
export function useSliceScale(): (baseScale: number) => number {
	const camera = useCamera();

	const [scale, setScale] = useDebounceState(calculateScale(camera.ViewportSize), {
		wait: 0.2,
		leading: true,
	});

	useEventListener(camera.GetPropertyChangedSignal("ViewportSize"), () => {
		setScale(calculateScale(camera.ViewportSize));
	});

	useEffect(() => {
		task.delay(0.5, () => {
			setScale(calculateScale(camera.ViewportSize));
		});
	}, []);

	return useMemo(() => {
		return (baseScale: number) => baseScale * scale;
	}, [scale]);
}

/**
 * Simplified hook for SliceCenter that prevents gaps without requiring image size
 */
export function useSliceCenter() {
	const camera = useCamera();

	const [scale, setScale] = useDebounceState(calculateScale(camera.ViewportSize), {
		wait: 0.2,
		leading: true,
	});

	useEventListener(camera.GetPropertyChangedSignal("ViewportSize"), () => {
		setScale(calculateScale(camera.ViewportSize));
	});

	useEffect(() => {
		task.delay(0.5, () => {
			setScale(calculateScale(camera.ViewportSize));
		});
	}, []);

	return useMemo(() => {
		const api = {
			/**
			 * Enhanced pixel-perfect scaler for SliceCenter that ensures borders meet perfectly,
			 * especially for rounded corners
			 *
			 * @param baseRect The original SliceCenter rect
			 * @param options Optional configuration for fine-tuning
			 * @returns A scaled Rect with perfect border alignment
			 */
			pixelPerfect: (
				baseRect: Rect,
				options: {
					/**
					 * Extra padding to ensure borders overlap slightly (prevents hairline gaps)
					 * @default 0.5
					 */
					overlapFactor?: number;

					/**
					 * Whether to ensure even-numbered dimensions (helps with certain UI elements)
					 * @default false
					 */
					ensureEvenDimensions?: boolean;

					/**
					 * Whether this is a rounded UI element (applies special corner handling)
					 * @default true
					 */
					isRounded?: boolean;

					/**
					 * Minimum border thickness to ensure visibility
					 * @default 1
					 */
					minBorderThickness?: number;
				} = {},
			): Rect => {
				const {
					overlapFactor = 0.5,
					ensureEvenDimensions = false,
					isRounded = true,
					minBorderThickness = 1,
				} = options;

				// Calculate the original dimensions
				const originalWidth = baseRect.Max.X - baseRect.Min.X;
				const originalHeight = baseRect.Max.Y - baseRect.Min.Y;

				// Calculate scaled values with slight overlap to prevent gaps
				let scaledMinX = baseRect.Min.X * scale;
				let scaledMinY = baseRect.Min.Y * scale;
				let scaledMaxX = baseRect.Max.X * scale;
				let scaledMaxY = baseRect.Max.Y * scale;

				// For rounded corners, we need to be extra careful with the border dimensions
				if (isRounded) {
					// Ensure minimum border thickness
					scaledMinX = math.max(scaledMinX, minBorderThickness);
					scaledMinY = math.max(scaledMinY, minBorderThickness);

					// Apply special rounding for borders to ensure they meet perfectly
					// Floor for min values (inner edges) with a slight adjustment to ensure overlap
					scaledMinX = math.floor(scaledMinX - overlapFactor);
					scaledMinY = math.floor(scaledMinY - overlapFactor);

					// Ceil for max values (outer edges) with a slight adjustment to ensure overlap
					scaledMaxX = math.ceil(scaledMaxX + overlapFactor);
					scaledMaxY = math.ceil(scaledMaxY + overlapFactor);
				} else {
					// For non-rounded elements, standard pixel-perfect rounding works well
					scaledMinX = math.floor(scaledMinX);
					scaledMinY = math.floor(scaledMinY);
					scaledMaxX = math.ceil(scaledMaxX);
					scaledMaxY = math.ceil(scaledMaxY);
				}

				// Calculate the scaled dimensions
				let scaledWidth = scaledMaxX - scaledMinX;
				let scaledHeight = scaledMaxY - scaledMinY;

				// Ensure even dimensions if requested (helps with certain UI elements)
				if (ensureEvenDimensions) {
					if (scaledWidth % 2 !== 0) {
						scaledMaxX += 1;
						scaledWidth += 1;
					}

					if (scaledHeight % 2 !== 0) {
						scaledMaxY += 1;
						scaledHeight += 1;
					}
				}

				// Preserve aspect ratio of the center region
				const originalAspectRatio = originalWidth / originalHeight;
				const scaledAspectRatio = scaledWidth / scaledHeight;

				// If the aspect ratio has changed significantly, adjust to preserve it
				if (math.abs(originalAspectRatio - scaledAspectRatio) > 0.01) {
					if (scaledAspectRatio > originalAspectRatio) {
						// Too wide, increase height
						const targetHeight = scaledWidth / originalAspectRatio;
						scaledMaxY = scaledMinY + targetHeight;
					} else {
						// Too tall, increase width
						const targetWidth = scaledHeight * originalAspectRatio;
						scaledMaxX = scaledMinX + targetWidth;
					}
				}

				// Create the final rect with all adjustments applied
				return new Rect(scaledMinX, scaledMinY, scaledMaxX, scaledMaxY);
			},

			/**
			 * Scales the SliceCenter rect with consistent rounding to prevent gaps
			 *
			 * @param baseRect The original SliceCenter rect
			 */
			scale: (baseRect: Rect): Rect => {
				// Calculate the width and height of the center region
				const centerWidth = baseRect.Max.X - baseRect.Min.X;
				const centerHeight = baseRect.Max.Y - baseRect.Min.Y;

				// Scale with consistent rounding
				const scaledMinX = math.round(baseRect.Min.X * scale);
				const scaledMinY = math.round(baseRect.Min.Y * scale);

				// Calculate max values based on scaled center dimensions
				// This ensures the center piece has the correct proportions
				const scaledMaxX = scaledMinX + math.round(centerWidth * scale);
				const scaledMaxY = scaledMinY + math.round(centerHeight * scale);

				return new Rect(scaledMinX, scaledMinY, scaledMaxX, scaledMaxY);
			},

			/**
			 * Ensures borders are thick enough by applying a minimum size
			 *
			 * @param baseRect The original SliceCenter rect
			 * @param minBorderSize Minimum border size (default: 8)
			 */
			border: (baseRect: Rect, borderScale: number = 1): Rect => {
				// Calculate the original dimensions
				const width = baseRect.Max.X - baseRect.Min.X;
				const height = baseRect.Max.Y - baseRect.Min.Y;

				// Scale the borders (the Min values represent border thickness)
				const scaledMinX = math.round(baseRect.Min.X * scale * borderScale);
				const scaledMinY = math.round(baseRect.Min.Y * scale * borderScale);

				// Keep the center dimensions proportional to the original
				return new Rect(scaledMinX, scaledMinY, scaledMinX + width, scaledMinY + height);
			},

			/**
			 * Keeps the original SliceCenter and relies on SliceScale for scaling
			 */
			original: (baseRect: Rect): Rect => {
				return baseRect;
			},

			thinPerfect: (
				baseRect: Rect,
				borderThickness: number = 0.5,
				options: {
					overlapFactor?: number;
					ensureEvenDimensions?: boolean;
					isRounded?: boolean;
				} = {},
			): Rect => {
				const { overlapFactor = 0.4, ensureEvenDimensions = true, isRounded = true } = options;

				// First create a rect with thinner borders
				const originalWidth = baseRect.Max.X - baseRect.Min.X;
				const originalHeight = baseRect.Max.Y - baseRect.Min.Y;

				// Calculate new border sizes
				const newMinX = math.round(baseRect.Min.X * borderThickness);
				const newMinY = math.round(baseRect.Min.Y * borderThickness);

				// Keep the center region the same size
				const newMaxX = newMinX + originalWidth;
				const newMaxY = newMinY + originalHeight;

				// Create the thinned rect
				const thinnedRect = new Rect(newMinX, newMinY, newMaxX, newMaxY);

				// Now apply pixel-perfect scaling
				// Calculate scaled values with slight overlap to prevent gaps
				let scaledMinX = thinnedRect.Min.X * scale;
				let scaledMinY = thinnedRect.Min.Y * scale;
				let scaledMaxX = thinnedRect.Max.X * scale;
				let scaledMaxY = thinnedRect.Max.Y * scale;

				// For rounded corners, we need to be extra careful with the border dimensions
				if (isRounded) {
					// Apply special rounding for borders to ensure they meet perfectly
					scaledMinX = math.floor(scaledMinX - overlapFactor);
					scaledMinY = math.floor(scaledMinY - overlapFactor);
					scaledMaxX = math.ceil(scaledMaxX + overlapFactor);
					scaledMaxY = math.ceil(scaledMaxY + overlapFactor);
				} else {
					// For non-rounded elements, standard pixel-perfect rounding works well
					scaledMinX = math.floor(scaledMinX);
					scaledMinY = math.floor(scaledMinY);
					scaledMaxX = math.ceil(scaledMaxX);
					scaledMaxY = math.ceil(scaledMaxY);
				}

				// Calculate the scaled dimensions
				let scaledWidth = scaledMaxX - scaledMinX;
				let scaledHeight = scaledMaxY - scaledMinY;

				// Ensure even dimensions if requested
				if (ensureEvenDimensions) {
					if (scaledWidth % 2 !== 0) {
						scaledMaxX += 1;
					}

					if (scaledHeight % 2 !== 0) {
						scaledMaxY += 1;
					}
				}

				// Create the final rect with all adjustments applied
				return new Rect(scaledMinX, scaledMinY, scaledMaxX, scaledMaxY);
			},

			/**
			 * Expands the center region while keeping borders thin
			 */
			expandCenter: (
				baseRect: Rect,
				options: {
					borderThickness?: number;
					overlapFactor?: number;
					ensureEvenDimensions?: boolean;
					existingSliceScale?: number;
				} = {},
			): Rect => {
				const {
					borderThickness = 0.5, // Target border thickness as fraction of original
					overlapFactor = 0.3, // Reduced overlap for thinner borders
					ensureEvenDimensions = true,
					existingSliceScale = 1,
				} = options;

				// Adjust for existing SliceScale
				const effectiveScale = scale / existingSliceScale;

				// Calculate the original dimensions
				const originalLeftBorder = baseRect.Min.X;
				const originalTopBorder = baseRect.Min.Y;
				const originalRightBorder = baseRect.Width - baseRect.Max.X;
				const originalBottomBorder = baseRect.Height - baseRect.Max.Y;

				// Scale down the border thickness
				const scaledLeftBorder = math.max(math.round(originalLeftBorder * borderThickness * effectiveScale), 1);
				const scaledTopBorder = math.max(math.round(originalTopBorder * borderThickness * effectiveScale), 1);
				const scaledRightBorder = math.max(
					math.round(originalRightBorder * borderThickness * effectiveScale),
					1,
				);
				const scaledBottomBorder = math.max(
					math.round(originalBottomBorder * borderThickness * effectiveScale),
					1,
				);

				// Calculate the total scaled dimensions
				const totalWidth = baseRect.Width * effectiveScale;
				const totalHeight = baseRect.Height * effectiveScale;

				// Calculate the new center region by expanding it
				const newMinX = scaledLeftBorder;
				const newMinY = scaledTopBorder;
				const newMaxX = totalWidth - scaledRightBorder;
				const newMaxY = totalHeight - scaledBottomBorder;

				// Apply pixel-perfect adjustments to prevent gaps
				let adjustedMinX = math.floor(newMinX - overlapFactor);
				let adjustedMinY = math.floor(newMinY - overlapFactor);
				let adjustedMaxX = math.ceil(newMaxX + overlapFactor);
				let adjustedMaxY = math.ceil(newMaxY + overlapFactor);

				// Ensure even dimensions if requested
				if (ensureEvenDimensions) {
					const width = adjustedMaxX - adjustedMinX;
					const height = adjustedMaxY - adjustedMinY;

					if (width % 2 !== 0) {
						adjustedMaxX += 1;
					}

					if (height % 2 !== 0) {
						adjustedMaxY += 1;
					}
				}

				return new Rect(adjustedMinX, adjustedMinY, adjustedMaxX, adjustedMaxY);
			},
		};

		// Default behavior when called as a function
		return api;
	}, [scale]);
}
