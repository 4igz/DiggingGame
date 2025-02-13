import { Workspace } from "@rbxts/services";

/**
 * Casts a ray downward from above the given position and returns the topmost Part and the hit Position.
 * Skips transparent parts until a non-transparent part is found.
 *
 * @param position The world position at which you want to find the topmost Part.
 * @param maxCheckHeight How high above the given position we start the ray.
 * @param rayLength How far downward the ray will travel.
 * @param raycastParams Optional RaycastParams to customize filtering, collision groups, etc.
 * @returns A tuple: [hitPart, hitPosition].
 *          - hitPart is the first non-fully transparent Part that the ray collides with (or undefined if none).
 *          - hitPosition is the Vector3 position of the ray intersection (or undefined if none).
 */
export function getTopmostPartAtPosition(
	position: Vector3,
	raycastParams?: RaycastParams,
	maxCheckHeight = 1000,
	rayLength = 5000,
): [Part | undefined, Vector3 | undefined] {
	const origin = new Vector3(position.X, position.Y + maxCheckHeight, position.Z);
	const direction = new Vector3(0, -rayLength, 0);
	const params = raycastParams ?? new RaycastParams();

	// Keep raycasting until we find a non-transparent part or hit nothing
	let currentOrigin = origin;
	while (true) {
		const raycastResult = Workspace.Raycast(currentOrigin, direction, params);

		if (!raycastResult) {
			return [undefined, undefined]; // No valid part found
		}

		const hitPart = raycastResult.Instance as Part;
		const hitPosition = raycastResult.Position;

		if (hitPart.Transparency < 1) {
			return [hitPart, hitPosition]; // Found a visible part
		}

		// Update the new origin slightly below the last hit position to continue checking
		currentOrigin = new Vector3(hitPosition.X, hitPosition.Y - 1, hitPosition.Z);
	}
}
