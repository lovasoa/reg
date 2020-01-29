import { Grid } from "./grid.js";
import * as Comlink from 'comlink';

function all_positions(size) {
    const res = new Array();
    for (let x = 0; x < size; x++)
        for (let y = 0; y < size; y++)
            res.push({ x, y });
    return res;
}

/**
 * @param {Grid} grid 
 */
function all_possible_moves(grid) {
    return all_positions(grid.size).flatMap(position =>
        grid.possible_moves_at(position).map(value =>
            ({ ...position, value })))
}

/**
 * @param {Grid} grid 
 * @returns {Set<number>}
 */
function remaining_values(grid) {
    const possibilities = new Set; /// @type Set<number>
    for (const position of all_positions(grid.size)) {
        for (const value of grid.possible_moves_at(position)) {
            possibilities.add(value)
        }
    }
    return possibilities;
}

/**
 * @param {Grid} grid A state of the grid, potentially after several moves 
 * @returns {number} an evaluation of how much we would like our move to make the grid reach this state
 */
export function evaluate_grid(grid) {
    let remaining = remaining_values(grid).size;
    const sign = (-2 * (remaining % 2) + 1); // negative if we are losing
    return sign / (remaining + 1);
}

/**
 * @template T
 * @param {Grid} grid 
 * @param {{x:number,y:number,value:number}} move 
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
 * @returns {{move:{x:number, y:number, value:number}?, evaluation:number}}
 */
export function minimax(grid, depth) {
    const evaluator = depth === 0
        ? evaluate_grid
        : g => -minimax(g, depth - 1).evaluation;
    const possibilities = all_possible_moves(grid).map(move => ({
        move, evaluation: with_move(grid, move, evaluator)
    }));
    if (!possibilities.length) return { move: null, evaluation: -Infinity };
    return possibilities.reduce((m1, m2) => m2.evaluation > m1.evaluation ? m2 : m1)
}

if (typeof Comlink.expose === "function") {
    Comlink.expose({
        minimax(grid_init, depth) {
            const grid = new Grid(grid_init);
            return minimax(grid, depth)
        }
    })
}
