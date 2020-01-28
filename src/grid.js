import { range } from './utils.js';

/**
 * Grid logic
 */

export class Game {
    constructor(size) {
        this.size = size;
        const empty_arr = _ => new Array(size).fill(null);
        this.grid = empty_arr().map(empty_arr);
        this.next_move = null;
    }

    setGrid(grid) {
        this.grid = grid;
        this.next_move = null;
        return this;
    }

    move(x, y, value) {
        value = parseInt(value);
        if (isNaN(value))
            this.next_move = null;
        else if (this.grid[x][y] === null)
            this.next_move = { x, y, value };
        return this;
    }
    play() {
        this.grid = this.next_grid();
        this.next_move = null;
        return this;
    }
    next_grid() {
        if (!this.next_move) return this.grid;
        const { x, y, value } = this.next_move;
        return this.grid.map(
            (line, i) => line.map(
                (v, j) => i == x && j == y ? value : v));
    }

    possibilities() {
        const grid = this.grid;
        const present = new Set(only_nums(grid.flat()));
        return grid.map(
            (line, i) => line.map(
                (v, j) => {
                    const value = (
                        this.next_move &&
                        this.next_move.x == i &&
                        this.next_move.y == j
                    ) ? this.next_move.value : v;
                    const possibilities = (v === null)
                        ? bound_possibilities(grid, i, j).filter(i => !present.has(i))
                        : [];
                    return { value, possibilities }
                }));
    }

    find_error() {
        const grid = this.next_grid();
        if (!in_range(grid))
            return `All number must be between 1 and ${this.size * this.size}`;
        if (!is_unique(grid))
            return `No number can appear more than once`;
        if (!is_sorted(grid))
            return `Numbers in a line must be either increasing or decreasing`;
        if (!is_sorted(columns(grid)))
            return `Numbers in a column must be either increasing or decreasing`;
        if (!is_sorted(diagonals(grid)))
            return `Numbers in the first diagonal must be either increasing or decreasing`;
        if (!is_sorted(diagonals(reversed(grid))))
            return `Numbers in the second diagonal must be either increasing or decreasing`;
    }
}

function only_nums(line) {
    return line.filter(x => x != null);
}

function in_range(grid) {
    const max = grid.length * grid[0].length;
    return grid.flat().every(x => x == null || (1 <= x && x <= max));
}

function is_unique(grid) {
    let unicity = new Set();
    return only_nums(grid.flat()).every(x => !unicity.has(x) && unicity.add(x));
}

function is_increasing(line) {
    return line.slice(1).every((x, i) => x > line[i]);
}

function is_sorted(grid) {
    const [a, b] = [grid, reversed(grid)].map(g =>
        g.map(only_nums).map(is_increasing)
    );
    return a.every((x, i) => x || b[i]);
}

function columns(grid) {
    return grid.map((line, i) => line.map((value, j) => grid[j][i]));
}

function reversed(grid) {
    return grid.map(line => line.map((_, i) => line[line.length - 1 - i]));
}

function diagonals(grid) {
    const size = grid.length;
    return Array(2 * size)
        .fill()
        .map((_, i) => {
            let [x, y] = i < size ? [0, size - i] : [i - size, 0];
            return Array(size - x - y)
                .fill()
                .map((_, i) => grid[x + i][y + i]);
        });
}

function line(grid, x, y, dx, dy) {
    const size = grid.length;
    let result = [];
    for (
        let i = x + dx, j = y + dy;
        i >= 0 && j >= 0 && i < size && j < size;
        i += dx, j += dy
    ) {
        let value = grid[i][j];
        if (value !== null)
            result.push(value);
    }
    return result;
}

function line_is_decreasing(before, after) {
    if (before.length === 0) return after[0] > after[1]
    if (before.length === 1) return before[0] > after[0]
    return before[0] < before[1] // Before is in reversed order
}

export function bound_possibilities(grid, x, y) {
    const size = grid.length;
    let min = 0, max = size * size + 1;
    for (let [dx, dy] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        let before = line(grid, x, y, dx, dy);
        let after = line(grid, x, y, -dx, -dy);
        if (before.length + after.length >= 2) {
            if (line_is_decreasing(before, after)) [after, before] = [before, after];
            if (before.length) min = Math.max(min, before[0]);
            if (after.length) max = Math.min(max, after[0]);
        }
        if (min + 1 >= max) break;
    }
    return range(min + 1, max - 1);
}