/**
 * Returns an array of all the integers between 0 and max
 */
export function range(max) {
    return Array(max).fill().map((_, i) => i);
}