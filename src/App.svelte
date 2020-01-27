<script>
  import Remaining from "./Remaining.svelte";
  import { Game } from "./grid.js";
  import { connect_from_url } from "./network.js";

  let size = 4;
  let myturn = true;
  const socket = connect_from_url({
    onmove: oponent_move
  });
  let valid, error, possibilities, possibilities_set, game;

  function init() {
    game = new Game(size);
    socket.move(game.grid);
  }

  function move(x, y, event) {
    game = game.move(x, y, event.target.value);
    myturn = false;
  }

  function play(evt) {
    if (evt) evt.preventDefault();
    if (!error) {
      game = game.play();
      socket.move(game.grid);
    }
  }

  function oponent_move(grid) {
    game = game.setGrid(grid);
    myturn = true;
  }

  init();
  $: error = game.find_error();
  $: valid = !error;
  $: possibilities = game.possibilities();
  $: possibilities_set = new Set(
    possibilities.flat().flatMap(p => p.possibilities)
  );
  window.game = game;
  window.socket = socket;
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
                  if (error) game = game.move(x, y, null);
                }}
                on:focus={_ => {
                  game = game.move(x, y, null);
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
      {:else if !socket.connected()}
        <p
          on:click={e => {
            e.preventDefault();
            navigator.share({
              title: 'Invitation',
              text: 'You received an invitation to play rEg online ! \n',
              url: window.location
            });
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
