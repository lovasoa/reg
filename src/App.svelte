<script>
  import { NetworkOpponent, AiOpponent, NoOpponent } from "./opponent.js";
  import Game from "./Game.svelte";

  const url = new URL(window.location.toString());
  const params = new URLSearchParams(url.search);
  let opponent = params.get("id") ? new NetworkOpponent(url, params) : null;
</script>

<style>
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
  main {
    width: 500px;
    max-width: 95%;
    margin: auto;
  }
  h1 {
    text-align: center;
  }

  button {
    margin-bottom: 10px;
  }

  :global(input[type="submit"]),
  :global(button) {
    margin: auto;
    width: 80%;
    display: block;
  }
</style>

<h1>rÊg</h1>
<main>
  {#if opponent == null}
    <section class="validatable valid">
      <p>Who do you want to play against ?</p>
      <button on:click={_ => (opponent = new AiOpponent())}>
        Play against an AI
      </button>
      <button on:click={_ => (opponent = new NetworkOpponent(url, params))}>
        Play online with a friend
      </button>
      <button on:click={_ => (opponent = new NoOpponent())}>Play alone</button>
    </section>
  {:else}
    <Game bind:opponent />
  {/if}
</main>
