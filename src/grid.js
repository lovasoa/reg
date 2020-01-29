import { Bounds } from './bounds.js';

/**
 * Grid logic
 */
export class Game {
    constructor(size) {
        this.grid = new Grid(size);
        /** @type {{x:number, y:number, value:number}?}*/
        this.next_move = null;
    }

    setGrid(grid) {
        this.grid = new Grid(grid);
        this.next_move = null;
        return this;
    }

    move(x, y, value) {
        value = parseInt(value);
        if (isNaN(value))
            this.next_move = null;
        else if (this.grid.is_free(x, y))
            this.next_move = { x, y, value };
        return this;
    }
    play() {
        const move = this.next_move;
        if (move) {
            this.grid.set(move.x, move.y, move.value);
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
        if (this.grid.values_set.has(value))
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
        this.values_set = new Set(this.data.filter(i => i !== 0));
    }
    get(i, j) {
        return this.data[i * this.size + j];
    }
    set(i, j, value) {
        value = value | 0;
        const idx = i * this.size + j;
        this.values_set.delete(this.data[idx]);
        this.data[idx] = value;
        if (value) this.values_set.add(value);
    }
    is_free(i, j) {
        return this.get(i, j) === 0
    }
    clone() {
        return new Grid([...this.data]);
    }
    /**
     * @template T the type of a cell content
     * @param {(v:number, {x,y}) => T} f A function to apply to each cell
     * @returns {T[][]} A grid (array of arrays) of the mapped values
     */
    toArrays(f) {
        const grid = new Array(this.size);
        for (let x = 0; x < this.size; x++) {
            grid[x] = new Array(this.size);
            for (let y = 0; y < this.size; y++) {
                grid[x][y] = f(this.get(x, y), { x, y });
            }
        }
        return grid;
    }

    _line({ x, y }, dx, dy) {
        let result = [];
        for (let i = x + dx, j = y + dy;
            i >= 0 && j >= 0 && i < this.size && j < this.size;
            i += dx, j += dy
        ) {
            const value = this.get(i, j);
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
     * @return {number[]} possible values to play at the position 
     */
    possible_moves_at(position) {
        if (this.get(position.x, position.y) !== 0) return [];
        const bounds = new Bounds(this.size);
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