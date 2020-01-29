import { Grid } from "./grid.js";
import * as Comlink from 'comlink';
import BitSet from "bitset";
import { Bounds } from "./bounds.js";

/**
 * @typedef { import("./grid").Move } Move
 */

function all_positions(size) {
    const res = new Array();
    for (let x = 0; x < size; x++)
        for (let y = 0; y < size; y++)
            res.push({ x, y });
    return res;
}

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
    const bounds = new Bounds(grid.size);
    const possibilities = new BitSet();
    for (const position of all_positions(grid.size)) {
        let min = bounds.min;
        let max = bounds.max;
        for (const value of grid.possible_moves_at(position, bounds)) {
            possibilities.set(value, 1);
        }
        do { bounds.min = min } while (possibilities.get(++min));
        do { bounds.max = max } while (possibilities.get(--max));
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
    if (remaining === 1) return -Infinity; // The move let's just one option. The adversary is going to win. Nothing is worse than that.
    return (-2 * (remaining % 2) + 1) / (remaining + 1); // An odd number of remaining moves may be better ? 
}

/**
 * @template T
 * @param {Grid} grid 
 * @param {Move} move 
 * @param {(Grid)=>T} f Function to apply to the grid
 * @returns {T} The result of f(grid), with move applied to grid
 */
function with_move(grid, move, f) {
    const saved_value = grid.get(move.x, move.y);
    grid.set(move.x, move.y, move.value);
    const result = f(grid);
    grid.set(move.x, move.y, saved_value); // Reset the grid to its old value
    return result;
}

/**
 * @param {Grid} grid 
 * @param {number} depth How many moves in the future to take into account
 * @returns {{move:Move?, evaluation:number}}
 */
export function minimax(grid, depth) {
    const evaluator = depth === 0
        ? evaluate_grid
        : g => -minimax(g, depth - 1).evaluation;

    const best = {
        /** @type {Move?} */
        move: null,
        evaluation: -Infinity
    };

    for (const move of all_possible_moves(grid)) {
        const evaluation = with_move(grid, move, evaluator);
        if (evaluation >= best.evaluation) {
            best.move = move;
            best.evaluation = evaluation;
            if (evaluation === Infinity) break; // Nothing can be better anyway
        }
    }
    return best;
}

if (typeof Comlink.expose === "function") {
    Comlink.expose({
        minimax(grid_init, depth) {
            const grid = new Grid(grid_init);
            return minimax(grid, depth)
        }
    })
}
