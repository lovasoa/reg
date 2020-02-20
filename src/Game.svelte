<script>
  import Remaining from "./Remaining.svelte";
  import { Game } from "./grid.js";
  import { NetworkOpponent } from "./opponent.js";

  let size = 4;
  let myturn = true;
  let connected = false;
  let valid, error, possibilities, possibilities_set, game;
  export let opponent;
  wait_spontaneous();

  async function init() {
    game = new Game(size);
    myturn = true;
    play();
  }

  async function wait_spontaneous() {
    if (opponent.spontaneous_plays) {
      for (const grid_promise of opponent.spontaneous_plays()) {
        const grid = await grid_promise;
        game = game.setGrid(grid);
        myturn = true;
        connected = true;
      }
    }
  }

  function move(x, y, { target: { value } }) {
    game = game.move({ x, y, value });
  }

  async function play(evt) {
    if (evt) evt.preventDefault();
    if (myturn && !error) {
      game = game.play();
      if (game.grid.is_over()) return;
      myturn = false;
      const grid = await opponent.play(game.grid);
      myturn = true;
      game = game.setGrid(grid);
      connected = true;
    }
  }

  init();
  $: error = game.find_error();
  $: valid = !error;
  $: possibilities = game.possibilities();
  $: possibilities_set = new Set(
    possibilities.flat().flatMap(p => p.possibilities)
  );
</script>

<style>
  .numbox {
    font-size: 45px;
    width: 70px;
    height: 70px;
    margin: auto;
    padding: 0;
    text-align: center;
  }
  table {
    width: 300px;
    height: 300px;
    margin: auto;
  }
</style>

<form on:submit={play}>
  <table class="validatable" class:valid>
    {#each possibilities as line, x}
      <tr>
        {#each line as { value, possibilities }, y}
          <td>
            <input
              class="numbox"
              type="number"
              pattern={possibilities.join('|')}
              title={possibilities.length > 0 ? `Values you can play here: ${possibilities.join(', ')}.` : "You can't play here"}
              disabled={possibilities.length === 0}
              on:input={move.bind(null, x, y)}
              on:paste={move.bind(null, x, y)}
              on:dragend={move.bind(null, x, y)}
              on:blur={_ => {
                if (error) game = game.move({ x, y, value: null });
              }}
              on:focus={_ => {
                game = game.move({ x, y, value: null });
              }}
              bind:value
              min="1"
              step="1"
              max={size * size} />
          </td>
        {/each}
      </tr>
    {/each}
  </table>

  <div class="validatable" class:valid>
    {#if error}
      <p>{error}</p>
    {:else if possibilities_set.size == 0}
      <button on:click={init}>
        You
        <strong>{myturn ? 'lost' : 'won'}</strong>
        ! Play again ?
      </button>
    {:else if opponent instanceof NetworkOpponent && !connected}
      <p
        on:click={e => {
          if (navigator.share) {
            e.preventDefault();
            navigator.share({
              title: 'Invitation',
              text: 'You received an invitation to play rEg online ! \n',
              url: window.location
            });
          }
        }}>
        Share
        <a href={window.location}>this link</a>
        with a friend to invite him to play with you.
      </p>
    {:else if myturn && game.next_move}
      <input type="submit" value="Play" />
    {:else if myturn}
      <p>Your turn ! Place a number somewhere in the grid.</p>
    {:else}
      <p>Waiting for your opponent to play...</p>
    {/if}
  </div>
</form>
<Remaining bind:possibilities_set bind:size />
