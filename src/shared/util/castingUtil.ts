import { Workspace } from "@rbxts/services";

/**
 * Casts a ray downward from above the given position and returns the topmost Part and the hit Position.
 *
 * @param position The world position at which you want to find the topmost Part.
 * @param maxCheckHeight How high above the given position we start the ray.
 * @param rayLength How far downward the ray will travel.
 * @param raycastParams Optional RaycastParams to customize filtering, collision groups, etc.
 * @returns A tuple: [hitPart, hitPosition].
 *          - hitPart is the Part that the ray collided with (or undefined if none).
 *          - hitPosition is the Vector3 position of the ray intersection (or undefined if none).
 */
export function getTopmostPartAtPosition(
	position: Vector3,
	raycastParams?: RaycastParams,
	maxCheckHeight = 1000,
	rayLength = 5000,
): [Part | undefined, Vector3 | undefined] {
	// Starting point is directly above the provided position
	const origin = new Vector3(position.X, position.Y + maxCheckHeight, position.Z);

	// We cast the ray straight downward
	const direction = new Vector3(0, -rayLength, 0);

	// If custom RaycastParams weren't provided, create default ones.
	// You can configure FilterDescendantsInstances, CollisionGroup, etc. here.
	const params = raycastParams ?? new RaycastParams();

	// Perform the raycast
	const raycastResult = Workspace.Raycast(origin, direction, params);

	// If we hit something, return the part and the hit position
	if (raycastResult) {
		const hitPart = raycastResult.Instance as Part;
		const hitPosition = raycastResult.Position;
		return [hitPart, hitPosition];
	}

	// Otherwise return undefined
	return [undefined, undefined];
}
