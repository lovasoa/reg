/**
 * Returns an array of all the integers in the inclusive range [min, max]
 */
export function range(min, max) {
    if (max == null) {
        min = 0;
        max = min;
    }
    if (max < min) return [];
    const size = max - min + 1;
    const result = new Array(size);
    for (let i = 0; i < size; i++) result[i] = min + i;
    return result;
}