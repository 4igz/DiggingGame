export const spaceWords = (str: string) => {
	const [spaced] = str.gsub("(%l)(%u)", "%1 %2");
	return spaced;
};

export function separateWithCommas(num: number | string): string {
	const str = tostring(num);

	// Find if there's a decimal point
	const [decimalIndex] = string.find(str, ".", 1, true);

	let integerPart: string;
	let decimalPart: string | undefined;

	if (decimalIndex !== undefined) {
		// Extract integer part up to the decimal point
		integerPart = string.sub(str, 1, decimalIndex - 1);
		// Extract everything after the decimal point
		decimalPart = string.sub(str, decimalIndex + 1);
	} else {
		// No decimal point -> entire string is the integer part
		integerPart = str;
	}

	// Pattern to group every three digits (this will run repeatedly until no more replacements)
	const pattern = "^(-?%d+)(%d%d%d)";

	while (true) {
		const [formatted, count] = string.gsub(integerPart, pattern, "%1,%2");
		integerPart = formatted;
		if (count === 0) {
			// No more groups of three to replace
			break;
		}
	}

	// If we had a decimal part, reattach it
	if (decimalPart !== undefined) {
		return `${integerPart}.${decimalPart}`;
	} else {
		return integerPart;
	}
}

const units = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td"];
export function shortenNumber(num: number): string {
	let unitIndex = 0;

	while (num >= 1000 && unitIndex < units.size() - 1) {
		num /= 1000;
		unitIndex++;
	}

	return `${string.format("%0.1f", num)}${units[unitIndex]}`;
}

export function formatTime(timeLeft: number, format: string = "%02d:%02d:%02d"): string {
	const hours = math.floor(timeLeft / 3600);
	const minutes = math.floor((timeLeft % 3600) / 60);
	const seconds = timeLeft % 60;

	return string.format(format, hours, minutes, seconds);
}

export function formatShortTime(timeLeft: number): string {
	const hours = math.floor(timeLeft / 3600);
	const minutes = math.floor((timeLeft % 3600) / 60);
	const seconds = math.floor(timeLeft % 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	} else {
		return `${seconds}s`;
	}
}
