/**
 * Finds the furthest point within a radius from a starting position across multiple parts.
 * Optimized by first checking if the part's center is within the radius.
 *
 * @param startingPosition - The position to measure distance from.
 * @param parts - The array of parts to check.
 * @param radius - The maximum radius to include points.
 * @param sampleDensity - The number of samples per axis within the bounding box (higher = more accurate).
 * @returns The furthest point within the radius, or undefined if no valid point is found.
 */
export function findFurthestPointWithinRadius(
	startingPosition: Vector3,
	parts: Array<BasePart>,
	radius: number,
	sampleDensity = 30, // Adjust density for precision
): Vector3 | undefined {
	let furthestPoint: Vector3 | undefined = undefined;
	let maxDistance = 0;

	for (const part of parts) {
		const partCenter = part.Position;
		const partRadius = part.Size.Magnitude / 2; // Approximate the maximum possible distance to a corner

		// Skip parts whose entire bounding box is outside the radius
		const distanceToCenter = startingPosition.sub(partCenter).Magnitude;
		if (distanceToCenter > radius + partRadius) {
			continue;
		}

		// If the part's center is within the radius, sample points
		const size = part.Size;
		const cframe = part.CFrame;

		// Create a bunch of sample points within the areas within the radius and pick the furthest valid point
		for (let x = -size.X / 2; x <= size.X / 2; x += size.X / sampleDensity) {
			for (let z = -size.Z / 2; z <= size.Z / 2; z += size.Z / sampleDensity) {
				const samplePoint = cframe.PointToWorldSpace(new Vector3(x, 0, z));
				const distance = startingPosition.sub(samplePoint).Magnitude;

				// Check if the point is within the radius and is the furthest valid point
				if (distance <= radius && distance > maxDistance) {
					maxDistance = distance;
					furthestPoint = samplePoint;
				}
			}
		}
	}

	return furthestPoint;
}

// Same function as used on client and server to compute luck. Synced via ping and Workspace.GetServerTimeNow().
export function computeLuckValue(elapsedTime: number): number {
	const MAGNET_AT = 0.96;
	const FREQUENCY = 0.55;
	const MIN_LUCK = 0.15;

	const waveTime = (elapsedTime * FREQUENCY) % 1;

	// 1) Shift + scale from [-1..+1] to [0..1]
	const triangleValue = 1 - 2 * math.abs(waveTime - 0.5);
	// Now zeroToOne smoothly oscillates from 0 up to 1 and back down.

	// 2) Map [0..1] into [0.1..1].
	//    0.1 is the minimum, 1.0 is the maximum.
	let adjustedValue = MIN_LUCK + (1 - MIN_LUCK) * triangleValue;
	// adjustedValue now oscillates between 0.2 and 1.

	// 3) Optional "magnet" effect if we want to clamp any value above MAGNET_AT up to 1.
	if (adjustedValue > MAGNET_AT) {
		adjustedValue = 1;
	}

	// Scale luck to 10
	return math.max(MIN_LUCK, adjustedValue * 10);
}
