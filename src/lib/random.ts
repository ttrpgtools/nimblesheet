let values: Uint32Array | undefined;
const MAX = 512;
let count = MAX;
const LARGEST = 0x100000000;
const DEFAULT_STRING_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
const DEFAULT_STRING_POOL_LEN = DEFAULT_STRING_POOL.length;

/** Get a random integer in range [min, max) */
export function getRandomInt(min: number, max: number) {
	min = Math.floor(min);
	max = Math.floor(max);

	const range = max - min + 1;
	return getRandom(range) + min;
}

/** Get a random integer in range [0, upper) */
export function getRandom(upper: number) {
	if (values == null || count === 0) {
		values = new Uint32Array(MAX);
		crypto.getRandomValues(values);
		count = MAX;
	}
	count -= 1;
	const rnd = values[count] / LARGEST;
	return Math.floor(upper * rnd);
}

/**
 * Creates a random string of the provided length to use as IDs.
 * @param len Number of characters in the returned string
 * @returns A random, URL-safe string
 */
export function id(len = 8) {
	return Array.from(Array(len), () =>
		DEFAULT_STRING_POOL.charAt(getRandom(DEFAULT_STRING_POOL_LEN))
	).join('');
}

export function randomFromArray<T>(arr: T[]): T | undefined {
	if (!arr || arr.length === 0) return;
	return arr[getRandom(arr.length)];
}
