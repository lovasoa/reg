/**
 * Handle the browser history
 */

import { writable } from 'svelte/store';
import { Opponent } from './opponent';

/**
 * @typedef {{
*  opponent?: import('./opponent').Opponent
* }} HistoryState
*/

/**
 * @param {string} serialized
 * @returns {HistoryState} 
 */
function hydrate(serialized) {
    try {
        const state = JSON.parse(serialized);
        return {
            opponent: Opponent.fromJSON(state.opponent),
        };
    } catch (e) {
        return {}
    }
}

/**
 * @returns {HistoryState} 
 */
function initialState() {
    const url = new URL(window.location.toString());
    return {
        "opponent": Opponent.fromJSON({ url })
    };
}

const historyStore = writable(initialState());
historyStore.subscribe(state => {
    const newSerializedState = JSON.stringify(state);
    if (newSerializedState === window.history.state) return;
    const params = state.opponent ? state.opponent.params : new URLSearchParams;
    const url = new URL(window.location.toString());
    url.search = params.toString();
    window.history.pushState(newSerializedState, "reg", url.toString());
});
window.addEventListener('popstate', (event) => {
    const state = hydrate(event.state);
    historyStore.set(state);
});

export default historyStore;