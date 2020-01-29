import { Bounds } from './bounds.js';
import BitSet from "bitset";

/**
 * @typedef {{x:number, y:number}} Position
 * @typedef {{x:number, y:number, value:number}} Move
 */

/**
 * Grid logic
 */
export class Game {
    constructor(size) {
        this.grid = new Grid(size);
        /** @type {Move?}*/
        this.next_move = null;
    }

    setGrid(grid) {
        this.grid = new Grid(grid);
        this.next_move = null;
        return this;
    }

    move(move) {
        move.value = parseInt(move.value);
        if (isNaN(move.value))
            this.next_move = null;
        else if (this.grid.is_free(move))
            this.next_move = move;
        return this;
    }
    play() {
        const move = this.next_move;
        if (move) {
            this.grid.set(move);
            this.next_move = null;
        }
        return this;
    }

    possibilities() {
        const possible_moves = this.grid.toArrays((value, position) => ({
            value: value ? value : null,
            possibilities: value ? [] : this.grid.possible_moves_at(position),
        }));
        if (this.next_move) {
            const { x, y, value } = this.next_move;
            possible_moves[x][y].value = value;
        }
        return possible_moves;
    }

    find_error() {
        if (!this.next_move) return;
        const { x, y, value } = this.next_move;
        if (value <= 0 || value > this.grid.size * this.grid.size)
            return `All numbers must be between 1 and ${this.grid.size * this.grid.size}`;
        if (this.grid.values_set.get(value))
            return `No number can appear more than once`;
        const bounds = new Bounds(this.grid.size);
        for (const direction of DIRECTIONS) {
            this.grid.bounds_in_direction(this.next_move, direction, bounds);
            if (!bounds.has(value))
                return `Numbers in a ${direction.name} must be either increasing or decreasing`;
        }
    }
}

const DIRECTIONS = [
    { dx: 0, dy: 1, name: "line", },
    { dx: 1, dy: 0, name: "column", },
    { dx: 1, dy: 1, name: "diagonal", },
    { dx: 1, dy: -1, name: "diagonal", },
];

function _line_is_decreasing(before, after) {
    if (before.length === 0) return after[0] > after[1]
    if (before.length === 1) return before[0] > after[0]
    return before[0] < before[1] // Before is in reversed order
}

export class Grid {
    constructor(init) {
        if (Array.isArray(init)) {
            this.size = Math.sqrt(init.length) | 0;
            this.data = init;
        } else {
            this.size = init | 0;
            this.data = Array(init * init).fill(0);
        }
        this.values_set = new BitSet(this.data.filter(i => i !== 0));
    }

    /**
     * Get the value at the given coordinates in the grid
     * @param {Position} position
     */
    get(position) {
        return this.data[position.x * this.size + position.y];
    }

    /**
     * Set a position on the grid to a value
     * @param {Move} move
     */
    set(move) {
        const value = move.value | 0;
        const idx = move.x * this.size + move.y;
        this.values_set.set(this.data[idx], 0);
        this.data[idx] = value;
        if (value) this.values_set.set(value, 1);
    }

    is_free(pos) {
        return this.get(pos) === 0
    }
    clone() {
        return new Grid([...this.data]);
    }
    /**
     * @template T the type of a cell content
     * @param {(v:number, Position) => T} f A function to apply to each cell
     * @returns {T[][]} A grid (array of arrays) of the mapped values
     */
    toArrays(f) {
        const grid = new Array(this.size);
        const pos = { x: 0, y: 0 };
        for (pos.x = 0; pos.x < this.size; pos.x++) {
            grid[pos.x] = new Array(this.size);
            for (pos.y = 0; pos.y < this.size; pos.y++) {
                grid[pos.x][pos.y] = f(this.get(pos), pos);
            }
        }
        return grid;
    }

    _line({ x, y }, dx, dy) {
        let result = [];
        const pos = { x: 0, y: 0 };
        for (pos.x = x + dx, pos.y = y + dy;
            pos.x >= 0 && pos.y >= 0 && pos.x < this.size && pos.y < this.size;
            pos.x += dx, pos.y += dy
        ) {
            const value = this.get(pos);
            if (value !== 0) result.push(value);
        }
        return result;
    }

    /**
     * @param {{x:number,y:number}} position 
     * @param {{dx:number,dy:number}} direction 
     * @param {Bounds} bounds bounds to update so that they reflect the constraints of the grid in the given direction
     */
    bounds_in_direction(position, direction, bounds) {
        let before = this._line(position, direction.dx, direction.dy);
        let after = this._line(position, -direction.dx, -direction.dy);
        if (before.length + after.length >= 2) {
            const decreasing = _line_is_decreasing(before, after);
            const min = decreasing ? after : before;
            const max = decreasing ? before : after;
            if (min.length !== 0) bounds.update_min(min[0]);
            if (max.length !== 0) bounds.update_max(max[0]);
        }
    }

    /**
     * @param {{x:number,y:number}} position 
     * @param {Bounds=} [bounds] Only search for possible moves in the given bounds 
     * @return {number[]} possible values to play at the position 
     */
    possible_moves_at(position, bounds) {
        if (this.get(position) !== 0) return [];
        bounds = bounds || new Bounds(this.size);
        for (const direction of DIRECTIONS) {
            this.bounds_in_direction(position, direction, bounds);
            if (bounds.empty()) break;
        }
        return bounds.range(this.values_set);
    }

    toJSON() {
        return this.data;
    }
}