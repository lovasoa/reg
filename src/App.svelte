<script>
  import Remaining from "./Remaining.svelte";
  import { Game } from "./grid.js";
  import { connect_from_url } from "./network.js";

  let size = 4;
  let game = new Game(size);
  let valid, error;
  $: error = game.find_error();
  $: valid = !error;

  function move(x, y, event) {
    game = game.move(x, y, event.target.value);
  }
  function play() {
    socket.move(game.next_move);
    game.play();
  }
  function oponent_move({ x, y, value }) {
    game = game.move(x, y, value).play();
  }
  window.game = game;
  window.socket = connect_from_url(oponent_move);
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
    {#each game.next_grid() as line, x}
      <tr>
        {#each line as value, y}
          <td>
            <input
              class="numbox"
              type="number"
              value={value === null ? '' : value}
              disabled={game.grid[x][y] !== null}
              on:change={move.bind(null, x, y)}
              on:keyup={move.bind(null, x, y)}
              on:paste={move.bind(null, x, y)}
              on:dragend={move.bind(null, x, y)}
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
    {:else}
      <p>Your turn ! Place a number somewhere in the grid.</p>
    {/if}
  </div>
  <Remaining bind:game />
</main>
