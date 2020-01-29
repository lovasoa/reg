import { connect_from_url } from "./network";
import * as Comlink from "comlink";

/**
 * @typedef { import("./grid").Grid } Grid
 * @typedef { import("./grid").Move } Move
 */

export class NetworkOpponent {
    constructor() {
        this.accept_spontaneous = _ => console.error("Received a move before initialization");
        this.accept = this.accept_spontaneous;

        this.socket = connect_from_url({
            onmove: grid => {
                this.accept(grid);
                this.accept = this.accept_spontaneous;
            }
        });
    }

    /**
     * @param {Grid} grid 
     * @returns {Promise<Grid>} The grid as modified by the opponent
     */
    async play(grid) {
        this.socket.move(grid);
        return new Promise((accept, reject) => {
            this.accept = accept;
        });
    }

    * spontaneous_plays() {
        while (true) {
            yield new Promise(accept => {
                this.accept_spontaneous = accept;
            });
        }
    }
}

export class AiOpponent {
    constructor() {
        this.minimax = Comlink.wrap(new Worker("build/ai.js"))['minimax'];
    }

    /**
     * @param {Grid} grid 
     * @returns {Promise<Grid>} The grid as modified by the opponent
     */
    async play(grid) {
        const start = Date.now();
        const { move } = await this.minimax(grid.toJSON(), 2);
        console.log("suggestion: ", move, "time: ", Date.now() - start, "ms");
        grid.set(move);
        return grid;
    }
}