
/**
 * @typedef { import("bitset").BitSet } BitSet
 */

/**
 * Represents an exclusive range of integers ]min, max[
 */

export class Bounds {
    constructor(size) {
        this.min = 0;
        this.max = size * size + 1;
    }
    update_min(value) {
        if (value > this.min) this.min = value;
    }
    update_max(value) {
        if (value < this.max) this.max = value;
    }
    size() {
        return Math.max(0, this.max - this.min - 1);
    }
    has(value) {
        return this.min < value && this.max > value;
    }
    empty() {
        return this.min + 1 >= this.max;
    }
    /**
     * @param {BitSet?=} filter 
     * @returns {number[]} All the numbers inside the bounds that are absent not in filter
     */
    range(filter) {
        const size = this.size();
        const result = [];
        for (let i = 0; i < size; i++) {
            const value = 1 + this.min + i
            if (!filter || !filter.get(value)) result.push(value);
        }
        return result;
    }
}