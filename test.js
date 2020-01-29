import { Grid } from './src/grid.js';
import { evaluate_grid, minimax, remaining_values } from './src/ai.js';
import assert from 'assert';
import { performance } from 'perf_hooks';


function test_bounds() {
    const n = 0;
    const grid = new Grid([
        // 1  2  3
        n, 2, 3, 4, // 0
        5, 6, n, n, // 1
        n, n, n, n, // 2
        n, n, 8, 9, // 3
    ]);
    assert.deepEqual(grid.possible_moves_at({ x: 0, y: 0 }), [1]);
    assert.deepEqual(grid.possible_moves_at({ x: 1, y: 3 }), [7]);
    assert.deepEqual(grid.possible_moves_at({ x: 2, y: 0 }), [7, 10, 11, 12, 13, 14, 15, 16]);
    assert.deepEqual(grid.possible_moves_at({ x: 2, y: 2 }), [7]);
    assert.deepEqual(grid.possible_moves_at({ x: 3, y: 0 }), [1, 7]);
    assert.deepEqual(grid.possible_moves_at({ x: 3, y: 1 }), [7]);
    assert.deepEqual(new Grid([
        1, n, n, n,
        n, 2, n, n,
        4, n, n, n,
        n, n, n, 3,
    ]).possible_moves_at({ x: 0, y: 2 }), []);
}

function test_ai() {
    const bad = new Grid([ // You can just play 4 at the bottom left and beat me
        1, 0, 0, 2,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 3,
    ]);
    const good = new Grid([ // We won, there is nothing you can play
        1, 0, 0, 2,
        0, 0, 0, 0,
        0, 0, 0, 0,
        4, 0, 0, 3,
    ]);
    const uncertain = new Grid([ // Nothing is decided yet
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ]);

    assert.deepEqual(remaining_values(bad).toArray(),
        [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

    assert.ok(evaluate_grid(good) > evaluate_grid(uncertain), "Good is better than uncertain");
    assert.ok(evaluate_grid(uncertain) > evaluate_grid(bad), "uncertain is better than bad");
    assert.deepEqual(minimax(bad, 0).move, { x: 3, y: 0, value: 4 })
    assert.deepEqual(minimax(bad, 1).move, { x: 3, y: 0, value: 4 })

    let end_result = minimax(new Grid([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        0, 14, 15, 0
    ]), 1);
    assert.ok([13, 16].includes(end_result.move.value));
    assert.strictEqual(end_result.evaluation, -Infinity); // I lose anyway
}

function test_perf() {
    const start = performance.now();
    const n = 0;
    const grid = new Grid([
        n, n, n, n,
        n, n, n, n,
        n, n, n, n,
        n, n, n, n,
    ]);
    minimax(grid, 1);
    console.log(`time for a depth-1 minimax: ${(performance.now() - start).toFixed(4)} ms`)
}

test_bounds();
test_ai();
test_perf();