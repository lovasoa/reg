<script>
  import Remaining from "./Remaining.svelte";
  import { Game } from "./grid.js";
  import { NetworkOpponent, AiOpponent } from "./opponent.js";

  let size = 4;
  let myturn = true;
  let connected = false;
  let valid, error, possibilities, possibilities_set, game;
  let opponent = new NetworkOpponent();
  wait_spontaneous();

  async function init() {
    game = new Game(size);
    myturn = true;
    play();
  }

  async function wait_spontaneous() {
    for (const grid_promise of opponent.spontaneous_plays()) {
      const grid = await grid_promise;
      game = game.setGrid(grid);
      myturn = true;
      connected = true;
    }
  }

  function move(x, y, { target: { value } }) {
    game = game.move({ x, y, value });
  }

  async function play(evt) {
    if (evt) evt.preventDefault();
    if (!error) {
      game = game.play();
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
  :global(.validatable) {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid black;
    background-color: #ff4136;
    margin: 8px;
  }
  :global(.valid) {
    background-color: #2ecc40;
  }
  h1 {
    text-align: center;
  }
  main {
    width: 500px;
    max-width: 95%;
    margin: auto;
  }
  input[type="submit"],
  button {
    margin: auto;
    width: 80%;
    display: block;
  }
</style>

<h1>rÊg</h1>

<main>
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
                max={size * size}
                maxlength={Math.floor(1 + Math.log10(size))} />
            </td>
          {/each}
        </tr>
      {/each}
    </table>

    <div class="validatable" class:valid>
      {#if error}
        <p>{error}</p>
      {:else if game.next_move}
        <input type="submit" value="Play" />
      {:else if possibilities_set.size == 0}
        <button on:click={init}>
          You
          <strong>{myturn ? 'lost' : 'won'}</strong>
          ! Play again ?
        </button>
      {:else if myturn}
        <p>Your turn ! Place a number somewhere in the grid.</p>
      {:else if !connected}
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
      {:else}
        <p>Waiting for your opponent to play...</p>
      {/if}
    </div>
  </form>
  <Remaining bind:possibilities_set bind:size />
</main>
