export function hsvToRgb(h: number, s: number, v: number): Color3 {
	let c = v * s;
	let x = c * (1 - math.abs(((h / 60) % 2) - 1));
	let m = v - c;
	let r = 0,
		g = 0,
		b = 0;

	if (h >= 0 && h < 60) {
		(r = c), (g = x), (b = 0);
	} else if (h >= 60 && h < 120) {
		(r = x), (g = c), (b = 0);
	} else if (h >= 120 && h < 180) {
		(r = 0), (g = c), (b = x);
	} else if (h >= 180 && h < 240) {
		(r = 0), (g = x), (b = c);
	} else if (h >= 240 && h < 300) {
		(r = x), (g = 0), (b = c);
	} else if (h >= 300 && h < 360) {
		(r = c), (g = 0), (b = x);
	}

	return Color3.fromRGB(math.round((r + m) * 255), math.round((g + m) * 255), math.round((b + m) * 255));
}

export function redToGreen(t: number): Color3 {
	t = math.clamp(t, 0, 1);

	const hue = t * 120;

	return hsvToRgb(hue, 1, 1);
}

export function greenToRed(t: number): Color3 {
	t = math.clamp(t, 0, 1);

	const hue = 120 - t * 120;

	return hsvToRgb(hue, 1, 1);
}

export function whiteToRed(t: number, redSaturation: number = 1): Color3 {
	t = math.clamp(t, 0, 1);
	redSaturation = math.clamp(redSaturation, 0, 1);

	const saturation = t * redSaturation;
	const value = 1;

	return hsvToRgb(0, saturation, value);
}
