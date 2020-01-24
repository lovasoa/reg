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
        return this;
    }
    next_grid() {
        if (!this.next_move) return this.grid;
        const { x, y, value } = this.next_move;
        return this.grid.map(
            (line, i) => line.map(
                (v, j) => i == x && j == y ? value : v));
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

function is_decreasing(line) {
    return line.slice(1).every((x, i) => x < line[i]);
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