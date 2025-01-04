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
	sampleDensity = 5, // Adjust density for precision
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
