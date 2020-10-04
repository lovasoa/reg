import { Socket, random_int } from "./network";
import * as Comlink from "comlink";

const minimax = Comlink.wrap(new Worker("build/ai.js"))['minimax'];

/**
 * @typedef { import("./grid").Grid } Grid
 * @typedef { import("./grid").Move } Move
 */

export class Opponent {
    /**
     * 
     * @param {URL} url url
     */
    constructor(url) {
        this.url = url;
        this.params = new URLSearchParams(url.search);
        this.params.set('opponent', this.opponentIdx());
    }
    /**
     * @param {Grid} grid 
     * @returns {Promise<Grid>} The grid as modified by the opponent
     */
    async play(grid) {
        return grid;
    }

    setParam(k, v) {
        this.params.set(k, v);
        this.url.search = this.params.toString();
    }
    /**
     * @param {{_cls:number, url: URL}} opponent
     * @returns {Opponent|undefined} 
     */
    static fromJSON({ _cls, url }) {
        return new OPPONENTS[_cls](url);
    }
    /**
     * @param {URL} url
     * @returns {Opponent|undefined} 
     */
    static fromURL(url) {
        const params = new URLSearchParams(url.search);
        let _cls = parseInt(params.get('opponent') || '');
        if (params.get("id")) _cls = OPPONENTS.indexOf(NetworkOpponent);
        if (_cls >= 0) return Opponent.fromJSON({ _cls, url });
    }
    toJSON() {
        return { ...this, _cls: this.opponentIdx() }
    }
    opponentIdx() {
        // @ts-ignore
        const idx = OPPONENTS.indexOf(this.constructor);
        return idx >= 0 ? idx.toString() : '';
    }
}

export class NetworkOpponent extends Opponent {
    constructor(url) {
        super(url);
        this.accept_spontaneous = _ => console.error("Received a move before initialization");
        this.accept = this.accept_spontaneous;

        let channel_id = this.params.get("id") || 0;
        if (!channel_id) {
            channel_id = random_int(10000);
            this.setParam("id", channel_id.toString());
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

export class AiOpponent extends Opponent {
    constructor(url) {
        super(url);
        this.moves_count = 0;
    }

    /**
     * @param {Grid} grid 
     * @returns {Promise<Grid>} The grid as modified by the opponent
     */
    async play(grid) {
        const start = Date.now();
        this.moves_count = grid.is_empty() ? 0 : this.moves_count + 1;
        const depth = 2 + (this.moves_count / 4 | 0);
        const { move } = await minimax(grid.toJSON(), depth);
        console.log("suggestion: ", move, "time: ", Date.now() - start, "ms");
        grid.set(move);
        return grid;
    }
}

export class NoOpponent extends Opponent { }

/**@type {(typeof Opponent)[]} */
const OPPONENTS = [NetworkOpponent, AiOpponent, NoOpponent];
