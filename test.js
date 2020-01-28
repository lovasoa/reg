import { bound_possibilities } from './src/grid.js';
import assert from 'assert';
import { performance } from 'perf_hooks';


function test_bounds() {
    const n = null;
    const grid = [
        [n, 2, 3, 4], // 0
        [5, 6, n, n], // 1
        [7, n, n, n], // 2
        [n, n, 8, 9], // 3
        //0 1  2  3
    ];
    assert.deepEqual(bound_possibilities(grid, 0, 0), [1]);
    assert.deepEqual(bound_possibilities(grid, 1, 3), [7, 8]);
    assert.deepEqual(bound_possibilities(grid, 2, 2), [7]);
    assert.deepEqual(bound_possibilities(grid, 3, 0), []);
    assert.deepEqual(bound_possibilities(grid, 3, 1), [7]);
}

function test_perf() {
    const start = performance.now();
    const n = null;
    const N = 1e4;
    for (let i = 0; i < N; i++) {
        let grid = [
            [n, 2, 3, 4],
            [5, n, n, n],
            [6, n, n, n],
            [n, n, 10, Math.random() | 0],
        ];
        for (let x = 0; x < 4; x++)
            for (let y = 0; y < 4; y++)
                bound_possibilities(grid, x, y);
    }
    console.log(`time: ${((performance.now() - start) / N).toFixed(4)} ms`)
}

test_bounds();
test_perf();