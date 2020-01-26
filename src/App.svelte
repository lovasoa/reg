<script>
  import Remaining from "./Remaining.svelte";
  import { Game } from "./grid.js";
  import { connect_from_url } from "./network.js";

  let size = 4;
  let game = new Game(size);
  let myturn = true;
  let valid, error, possibilities, possibilities_set;
  $: error = game.find_error();
  $: valid = !error;
  $: possibilities = game.possibilities();
  $: possibilities_set = new Set(
    possibilities.flat().flatMap(p => p.possibilities)
  );

  function move(x, y, event) {
    game = game.move(x, y, event.target.value);
    myturn = false;
  }

  function play() {
    game = game.play();
    socket.move(game.grid);
  }

  function oponent_move({ x, y, value }) {
    game = game.move(x, y, value).play();
    myturn = true;
  }

  window.game = game;
  window.socket = connect_from_url({
    onmove: oponent_move
  });
</script>

<style>
  .numbox {
    font-size: 50px;
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
  button {
    margin: auto;
    width: 80%;
    display: block;
  }
</style>

<h1>rÊg</h1>

<main>
  <table class="validatable" class:valid>
    {#each possibilities as line, x}
      <tr>
        {#each line as { value, possibilities }, y}
          <td>
            <input
              class="numbox"
              type="number"
              value={value === null ? '' : value}
              pattern={possibilities.join('|')}
              title={`Values you can play here: ${possibilities.join(', ')}.`}
              disabled={possibilities.length === 0}
              on:input={move.bind(null, x, y)}
              on:keyup={move.bind(null, x, y)}
              on:paste={move.bind(null, x, y)}
              on:dragend={move.bind(null, x, y)}
              on:blur={_ => {
                if (error) game = game.move(x, y, null);
              }}
              on:focus={_ => {
                game = game.move(x, y, null);
              }}
              min="1"
              max={size * size} />
          </td>
        {/each}
      </tr>
    {/each}
  </table>

  <div class="validatable" class:valid>
    {#if error}
      <p>{error}</p>
    {:else if game.next_move}
      <button on:click={play}>Play</button>
    {:else if possibilities_set.size == 0}
      <strong>You {myturn ? 'lost' : 'won'} !</strong>
    {:else}
      <p>Your turn ! Place a number somewhere in the grid.</p>
    {/if}
  </div>
  <Remaining bind:possibilities_set bind:size />
</main>
