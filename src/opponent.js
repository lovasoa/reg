import { Socket, random_int } from "./network";
import * as Comlink from "comlink";

/**
 * @typedef { import("./grid").Grid } Grid
 * @typedef { import("./grid").Move } Move
 */

export class NetworkOpponent {
    constructor(url, params, ) {
        this.accept_spontaneous = _ => console.error("Received a move before initialization");
        this.accept = this.accept_spontaneous;

        let channel_id = params.get("id") || 0;
        if (!channel_id) {
            channel_id = random_int(10000);
            params.set("id", channel_id.toString());
            url.search = params.toString();
            window.history.replaceState(null, "rÊg", url.toString());
        }
        this.socket = new Socket(channel_id, {
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
        this.moves_count = 0;
    }

    /**
     * @param {Grid} grid 
     * @returns {Promise<Grid>} The grid as modified by the opponent
     */
    async play(grid) {
        const start = Date.now();
        const depth = 2 + (this.moves_count / 3 | 0);
        const { move } = await this.minimax(grid.toJSON(), depth);
        console.log("suggestion: ", move, "time: ", Date.now() - start, "ms");
        grid.set(move);
        this.moves_count++;
        return grid;
    }
}

export class NoOpponent {
    async play(grid) {
        return grid;
    }
}