/**
 * Creates a throttled interval function.
 * @param seconds The interval duration in seconds.
 * @returns A function that returns `true` if the interval has elapsed, `false` otherwise. Allows you to specify a discriminator for unique intervals.
 */
export function interval(seconds: number, cleanupInterval?: number): (id?: any) => boolean;
