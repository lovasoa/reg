import { Grid } from './src/grid.js';
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
    assert.deepEqual(grid.bound_possibilities({ x: 0, y: 0 }), [1]);
    assert.deepEqual(grid.bound_possibilities({ x: 1, y: 3 }), [7]);
    assert.deepEqual(grid.bound_possibilities({ x: 2, y: 0 }), [7, 10, 11, 12, 13, 14, 15, 16]);
    assert.deepEqual(grid.bound_possibilities({ x: 2, y: 2 }), [7]);
    assert.deepEqual(grid.bound_possibilities({ x: 3, y: 0 }), [1, 7]);
    assert.deepEqual(grid.bound_possibilities({ x: 3, y: 1 }), [7]);
    assert.deepEqual(new Grid([
        1, n, n, n,
        n, 2, n, n,
        4, n, n, n,
        n, n, n, 3,
    ]).bound_possibilities({ x: 0, y: 2 }), []);
}

function test_perf() {
    const start = performance.now();
    const n = 0;
    const N = 1e4;
    for (let i = 0; i < N; i++) {
        const grid = new Grid([
            n, 2, 3, 4,
            5, 6, n, n,
            7, n, n, n,
            n, n, 8, 9,
        ]);
        for (let x = 0; x < 4; x++)
            for (let y = 0; y < 4; y++)
                grid.bound_possibilities({ x, y });
    }
    console.log(`time: ${((performance.now() - start) / N).toFixed(4)} ms`)
}

test_bounds();
test_perf();