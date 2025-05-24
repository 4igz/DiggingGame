export function isVector3Valid(v: Vector3): boolean {
	return (
		typeOf(v) === "Vector3" &&
		v.X === v.X &&
		v.Y === v.Y &&
		v.Z === v.Z &&
		v.X !== undefined &&
		v.Y !== undefined &&
		v.Z !== undefined
	);
}

export function isCframeValid(cf: CFrame): boolean {
	const components = cf.GetComponents();
	for (const value of components) {
		if (typeOf(value) !== "number" || value !== value) {
			return false;
		}
	}
	return true;
}
