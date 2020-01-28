import { Grid } from "./grid.js";
import { Bounds } from "./bounds.js";

function nth_position(grid, n) {
    return {
        x: n / grid.size | 0,
        y: n % grid.size
    };
}

/**
 * @param {Grid} grid 
 */
function all_possible_moves(grid) {
    const { size } = grid;
    return new Bounds(size).range().flatMap(n => {
        const position = nth_position(grid, n);
        return grid.possible_moves_at(position)
            .map(value => ({ ...position, value }));
    })
}

/**
 * @param {Grid} grid 
 * @returns {Set<number>}
 */
function remaining_values(grid) {
    const possibilities = new Set; /// @type Set<number>
    for (const n of new Bounds(grid.size).range()) {
        const position = nth_position(grid, n);
        for (const value of grid.possible_moves_at(position)) {
            possibilities.add(value)
        }
    }
    return possibilities;
}

export function evaluate(grid) {
    let remaining = remaining_values(grid).size;
    const sign = (2 * (remaining % 2) - 1); // negative if we are losing
    return sign / (remaining + 1);
}