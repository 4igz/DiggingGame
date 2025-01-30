// minV and maxV helper functions
function minV(a: Vector3, b: Vector3): Vector3 {
	return new Vector3(math.min(a.X, b.X), math.min(a.Y, b.Y), math.min(a.Z, b.Z));
}

function maxV(a: Vector3, b: Vector3): Vector3 {
	return new Vector3(math.max(a.X, b.X), math.max(a.Y, b.Y), math.max(a.Z, b.Z));
}

/**
 * Finds the total "collidable extents" of a character model by considering
 * only the CanCollide BaseParts. Returns a Vector3 representing the overall
 * bounding size of those collidable parts relative to the character's
 * PrimaryPart coordinate space.
 *
 * @param character The character model (or any Model) you want to analyze.
 * @returns A Vector3 of the bounding size, or undefined if invalid (e.g., no collidable parts).
 */
export function getCollidableExtentsSize(character?: Model): Vector3 | undefined {
	// Early return if the model or its PrimaryPart is missing.
	if (!character || !character.PrimaryPart) {
		return undefined;
	}

	const toLocalCFrame = character.PrimaryPart.CFrame.Inverse();
	let min = new Vector3(math.huge, math.huge, math.huge);
	let max = new Vector3(-math.huge, -math.huge, -math.huge);

	// Check every descendant for "BasePart" with CanCollide == true
	for (const descendant of character.GetDescendants()) {
		if (descendant.IsA("BasePart") && descendant.CanCollide) {
			// Transform this part into the PrimaryPart's local space
			const localCFrame = toLocalCFrame.mul(descendant.CFrame);

			// We only need half-size for bounding corner calculations
			const halfSize = descendant.Size.div(new Vector3(2, 2, 2));
			const { X: x, Y: y, Z: z } = halfSize;

			// Define the local corners (vertices) of this part
			const vertices = [
				new Vector3(x, y, z),
				new Vector3(x, y, -z),
				new Vector3(x, -y, z),
				new Vector3(x, -y, -z),
				new Vector3(-x, y, z),
				new Vector3(-x, y, -z),
				new Vector3(-x, -y, z),
				new Vector3(-x, -y, -z),
			];

			// Transform each vertex into the PrimaryPart's local space
			// and update our min/max extents.
			for (const vertex of vertices) {
				const v = localCFrame.mul(vertex);
				min = minV(min, v);
				max = maxV(max, v);
			}
		}
	}

	// The final extents vector is the size difference between max and min.
	const r = max.sub(min);
	// If this difference is nonsensical (negative in some dimension), return undefined
	if (r.X < 0 || r.Y < 0 || r.Z < 0) {
		return undefined;
	}

	return r;
}

