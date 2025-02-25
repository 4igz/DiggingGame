//!optimize 2
//!native
// EternityNum.d.ts

/**
 * Represents an EternityNum object, capable of handling very large numbers.
 */
type EN = {
	/** The sign of the number (-1 for negative, 0 for zero, 1 for positive). */
	Sign: number;

	/** The layer of magnitude (e.g., exponential layer). */
	Layer: number;

	/** The exponent or value at the current layer. */
	Exp: number;
};

/**
 * EternityNum is a library to handle extremely large numbers up to `10↑↑2^1024`.
 * It provides a variety of operations, conversions, and utilities for such numbers.
 */
interface EternityNum {
	// CHECK FUNCTIONS

	/**
	 * Checks if the given EternityNum is NaN.
	 * @param value - The EternityNum to check.
	 * @returns True if the number is NaN, false otherwise.
	 */
	IsNaN: (value: EN) => boolean;

	/**
	 * Checks if the given EternityNum is infinite.
	 * @param value - The EternityNum to check.
	 * @returns True if the number is infinite, false otherwise.
	 */
	IsInf: (value: EN) => boolean;

	/**
	 * Checks if the given EternityNum is zero.
	 * @param value - The EternityNum to check.
	 * @returns True if the number is zero, false otherwise.
	 */
	IsZero: (value: EN) => boolean;

	// CONVERT FUNCTIONS

	/**
	 * Creates a new EternityNum object with the specified sign, layer, and exponent.
	 * @param Sign - The sign of the number (-1, 0, or 1).
	 * @param Layer - The magnitude layer of the number.
	 * @param Exp - The exponent at the current layer.
	 * @returns A corrected EternityNum object.
	 */
	new (Sign: number, Layer: number, Exp: number): EN;

	/**
	 * Converts a regular number into an EternityNum.
	 * @param value - The number to convert.
	 * @returns The converted EternityNum.
	 */
	fromNumber: (value: number) => EN;

	/**
	 * Converts a string representation of a number into an EternityNum.
	 * @param value - The string to convert.
	 * @returns The converted EternityNum.
	 */
	fromString: (value: string) => EN;

	/**
	 * Converts scientific notation (e.g., "XeY") into an EternityNum.
	 * @param value - The scientific notation string.
	 * @returns The converted EternityNum.
	 */
	fromScientific: (value: string) => EN;

	/**
	 * Converts the default string format (e.g., "X;Y") into an EternityNum.
	 * @param value - The default string format.
	 * @returns The converted EternityNum.
	 */
	fromDefaultStringFormat: (value: string) => EN;

	/**
	 * Converts any valid input (number, string, table) into an EternityNum.
	 * @param value - The value to convert.
	 * @returns The converted EternityNum.
	 */
	convert: (value: any) => EN;

	/**
	 * Converts an EternityNum back into a regular number.
	 * @param value - The EternityNum to convert.
	 * @returns The converted number.
	 */
	toNumber: (value: EN) => number;

	/**
	 * Converts an EternityNum into a string in the default format ("X;Y").
	 * @param value - The EternityNum to convert.
	 * @returns The formatted string.
	 */
	toString: (value: EN) => string;

	/**
	 * Converts an EternityNum into scientific notation ("XeY").
	 * @param value - The EternityNum to convert.
	 * @returns The scientific notation string.
	 */
	toScientific: (value: EN) => string;

	/**
	 * Converts an EternityNum into layer notation ("E(x)y").
	 * @param value - The EternityNum to convert.
	 * @param digits - The number of significant digits to include.
	 * @returns The layer notation string.
	 */
	toLayerNotation: (value: EN, digits?: number) => string;

	/**
	 * Converts an EternityNum into a suffix-based notation (e.g., "1K", "1M").
	 * @param value - The EternityNum to convert.
	 * @param digits - The number of significant digits to include.
	 * @returns The suffix string.
	 */
	toSuffix: (value: EN, digits?: number) => string;

	/**
	 * Converts an EternityNum into a short, human-readable format.
	 * @param value - The EternityNum to convert.
	 * @param digits - The number of significant digits to include.
	 * @returns The short string representation.
	 */
	short: (value: EN, digits?: number) => string;

	// BOOLEAN FUNCTIONS

	/**
	 * Checks if two EternityNums are equal.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns True if the numbers are equal, false otherwise.
	 */
	eq: (value1: EN, value2: EN) => boolean;

	/**
	 * Checks if the first EternityNum is less than the second.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns True if value1 < value2, false otherwise.
	 */
	le: (value1: EN, value2: EN) => boolean;

	/**
	 * Checks if the first EternityNum is greater than the second.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns True if value1 > value2, false otherwise.
	 */
	me: (value1: EN, value2: EN) => boolean;

	/**
	 * Checks if the first EternityNum is less than or equal to the second.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns True if value1 <= value2, false otherwise.
	 */
	leeq: (value1: EN, value2: EN) => boolean;

	/**
	 * Checks if the first EternityNum is greater than or equal to the second.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns True if value1 >= value2, false otherwise.
	 */
	meeq: (value1: EN, value2: EN) => boolean;

	/**
	 * Checks if an EternityNum is within the range [min, max].
	 * @param value - The EternityNum to check.
	 * @param min - The minimum value.
	 * @param max - The maximum value.
	 * @returns True if min <= value <= max, false otherwise.
	 */
	between: (value: EN, min: EN, max: EN) => boolean;

	// SINGLE OPERATIONS

	/**
	 * Returns the absolute value of the EternityNum.
	 * @param value - The EternityNum to operate on.
	 * @returns The absolute value.
	 */
	abs: (value: EN) => EN;

	/**
	 * Negates the EternityNum (multiplies by -1).
	 * @param value - The EternityNum to negate.
	 * @returns The negated value.
	 */
	neg: (value: EN) => EN;

	/**
	 * Calculates the reciprocal (1 / value) of the EternityNum.
	 * @param value - The EternityNum to invert.
	 * @returns The reciprocal.
	 */
	recip: (value: EN) => EN;

	/**
	 * Calculates the base-10 logarithm of the EternityNum.
	 * @param value - The EternityNum to log.
	 * @returns The logarithm.
	 */
	log10: (value: EN) => EN;

	/**
	 * Calculates the absolute base-10 logarithm of the EternityNum.
	 * @param value - The EternityNum to log.
	 * @returns The absolute logarithm.
	 */
	abslog10: (value: EN) => EN;

	/**
	 * Calculates e^value for the EternityNum.
	 * @param value - The EternityNum to exponentiate.
	 * @returns The result of e^value.
	 */
	exp: (value: EN) => EN;

	/**
	 * Calculates 10^value for the EternityNum.
	 * @param value - The EternityNum to exponentiate.
	 * @returns The result of 10^value.
	 */
	pow10: (value: EN) => EN;

	/**
	 * Calculates the square root of the EternityNum.
	 * @param value - The EternityNum to square root.
	 * @returns The square root.
	 */
	sqrt: (value: EN) => EN;

	/**
	 * Calculates the gamma function (related to factorial) of the EternityNum.
	 * @param value - The EternityNum to compute gamma for.
	 * @returns The gamma value.
	 */
	gamma: (value: EN) => EN;

	/**
	 * Calculates the factorial of the EternityNum.
	 * @param value - The EternityNum to factorialize.
	 * @returns The factorial.
	 */
	fact: (value: EN) => EN;

	// RANDOM FUNCTIONS

	/**
	 * Generates a random EternityNum between the given min and max values.
	 * @param min - The minimum value.
	 * @param max - The maximum value.
	 * @returns A random EternityNum in the range [min, max].
	 */
	rand: (min: EN, max: EN) => EN;

	/**
	 * Generates a random EternityNum between the given min and max values, using exponential distribution.
	 * @param min - The minimum value.
	 * @param max - The maximum value.
	 * @returns A random EternityNum in the range [min, max].
	 */
	exporand: (min: EN, max: EN) => EN;

	// BINARY OPERATIONS

	/**
	 * Adds two EternityNums.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns The sum of the two EternityNums.
	 */
	add: (value1: EN, value2: EN) => EN;

	/**
	 * Subtracts the second EternityNum from the first.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns The result of value1 - value2.
	 */
	sub: (value1: EN, value2: EN) => EN;

	/**
	 * Multiplies two EternityNums.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns The product of the two EternityNums.
	 */
	mul: (value1: EN, value2: EN) => EN;

	/**
	 * Divides the first EternityNum by the second.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns The result of value1 / value2.
	 */
	div: (value1: EN, value2: EN) => EN;

	/**
	 * Raises the first EternityNum to the power of the second.
	 * @param value1 - The base EternityNum.
	 * @param value2 - The exponent EternityNum.
	 * @returns The result of value1 ^ value2.
	 */
	pow: (value1: EN, value2: EN) => EN;

	/**
	 * Calculates the logarithm of the EternityNum with the given base.
	 * If the base is not provided, the natural logarithm is calculated.
	 * @param value - The EternityNum to log.
	 * @param base - The logarithmic base (optional).
	 * @returns The logarithm of the EternityNum.
	 */
	log: (value: EN, base?: EN) => EN;

	/**
	 * Calculates the nth root of the first EternityNum.
	 * @param value1 - The base EternityNum.
	 * @param value2 - The root (n).
	 * @returns The nth root of the first EternityNum.
	 */
	root: (value1: EN, value2: EN) => EN;

	// COMPARISON FUNCTIONS

	/**
	 * Compares two EternityNums.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns 0 if they are equal, 1 if value1 > value2, and -1 if value1 < value2.
	 */
	cmp: (value1: EN, value2: EN) => number;

	/**
	 * Compares the absolute values of two EternityNums.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns 0 if equal, 1 if |value1| > |value2|, -1 if |value1| < |value2|.
	 */
	cmpAbs: (value1: EN, value2: EN) => number;

	/**
	 * Returns the EternityNum with the larger absolute value.
	 * @param value1 - The first EternityNum.
	 * @param value2 - The second EternityNum.
	 * @returns The EternityNum with the larger absolute value.
	 */
	maxAbs: (value1: EN, value2: EN) => EN;

	// LEADERBOARD ENCODE/DECODE

	/**
	 * Encodes an EternityNum for storage in an OrderedDataStore.
	 * @param value - The EternityNum to encode.
	 * @returns The encoded number.
	 */
	lbencode: (value: EN) => number;

	/**
	 * Decodes a number from an OrderedDataStore back into an EternityNum.
	 * @param value - The encoded number.
	 * @returns The decoded EternityNum.
	 */
	lbdecode: (value: number) => EN;

	// INTERNAL CORRECTIONS

	/**
	 * Corrects an EternityNum, normalizing its values to adhere to internal rules.
	 * @param value - The EternityNum to correct.
	 * @returns The corrected EternityNum.
	 */
	correct: (value: EN) => EN;

	// SHIFT FUNCTION

	/**
	 * Shifts an EternityNum's value by a given number of digits.
	 * @param value - The EternityNum to shift.
	 * @param digits - The number of digits to shift.
	 * @returns The shifted EternityNum.
	 */
	shift: (value: EN, digits: number) => EN;
}

declare const EternityNum: EternityNum;
export = EternityNum;
