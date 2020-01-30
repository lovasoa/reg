import { Grid } from "./grid.js";
import * as Comlink from 'comlink';
import BitSet from "bitset";
import { Bounds } from "./bounds.js";

/**
 * @typedef { import("./grid").Move } Move
 */


/**
 * @param {Grid} grid 
 * @returns {Move[]}
 */
function all_possible_moves(grid) {
    const size = grid.size, position = { x: 0, y: 0 }, result = [];
    for (position.x = 0; position.x < size; position.x++) {
        for (position.y = 0; position.y < size; position.y++) {
            for (const value of (grid.possible_moves_at(position))) {
                result.push({ ...position, value })
            }
        }
    }
    return result;
}

/**
 * @param {Grid} grid 
 * @returns {BitSet}
 */
export function remaining_values(grid) {
    const size = grid.size;
    const bounds = new Bounds(size);
    const possibilities = new BitSet();
    const position = { x: 0, y: 0 };
    for (position.x = 0; position.x < size; position.x++) {
        for (position.y = 0; position.y < size; position.y++) {
            let min = bounds.min;
            let max = bounds.max;
            for (const value of grid.possible_moves_at(position, bounds)) {
                possibilities.set(value, 1);
            }
            do { bounds.min = min } while (possibilities.get(++min));
            do { bounds.max = max } while (possibilities.get(--max));
        }
    }
    return possibilities;
}

/**
 * @param {Grid} grid A state of the grid, potentially after several moves 
 * @returns {number} an evaluation of how much we would like our move to make the grid reach this state
 */
export function evaluate_grid(grid) {
    let remaining = remaining_values(grid).cardinality();
    if (remaining === 0) return Infinity; // The move terminates the game, nothing is better than that
    if (remaining === 1) return -Infinity; // The move leaves just one option. The adversary is going to win. Nothing is worse than that.
    return remaining - 2 * (remaining % 2); // An even number of remaining moves may be better ? 
}

/**
 * @template T
 * @param {Grid} grid 
 * @param {Move} move 
 * @param {(Grid)=>T} f Function to apply to the grid
 * @returns {T} The result of f(grid), with move applied to grid
 */
function with_move(grid, move, f) {
    const saved_value = grid.get(move);
    grid.set(move);
    const result = f(grid);
    grid.set({ ...move, value: saved_value }); // Reset the grid to its old value
    return result;
}

/**
 * @param {Grid} grid 
 * @param {number} depth How many moves in the future to take into account
 * @returns {{move:Move?, evaluation:number}}
 */
export function minimax(grid, depth) {
    return all_possible_moves(grid)
        .map(move => ({ move, evaluation: with_move(grid, move, evaluate_grid) }))
        .sort((a, b) => {
            let evalb = b.evaluation, evala = a.evaluation;
            return evalb === evala ? Math.random() - .5 : evalb - evala;
        })
        .slice(0, 16 + 16 * depth)
        .map(move => {
            if (depth > 0 && isFinite(move.evaluation)) {
                move.evaluation = -minimax(grid, depth - 1).evaluation;
            }
            return move;
        }).reduce(
            (m1, m2) => m1.evaluation > m2.evaluation ? m1 : m2,
            {
                /** @type {Move?} */
                move: null,
                evaluation: -Infinity
            }
        );
}

if (typeof Comlink.expose === "function") {
    Comlink.expose({
        minimax(grid_init, depth) {
            const grid = new Grid(grid_init);
            return minimax(grid, depth)
        }
    })
}
