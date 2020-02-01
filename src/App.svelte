<script>
  import { NetworkOpponent, AiOpponent, NoOpponent } from "./opponent.js";
  import Game from "./Game.svelte";

  const url = new URL(window.location.toString());
  const params = new URLSearchParams(url.search);
  let opponent = params.get("id") ? new NetworkOpponent(url, params) : null;
  let rules = false
</script>

<style>
  :global(.validatable) {
    padding: 10px;
    border-radius: 6px;
    background-color: #da394e;
    margin: 8px;
    color:#dbfcff;
  }
  :global(.valid) {
    background-color: #1a82a5;
  }
  :global(.validatable a){
    color:#ffffff;
    font-weight: bold;
  }
  section{
    padding-top: 50px;
    text-align: center;
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
     border-radius: 50px;
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
  {#if rules == true}
    rules
  {:else if opponent == null}
    <section class="validatable valid">
      <button on:click={_ => (opponent = new AiOpponent())}>
        Play against an AI
      </button>
      <button on:click={_ => (opponent = new NetworkOpponent(url, params))}>
        Play online with a friend
      </button>
      <button on:click={_ => (opponent = new NoOpponent())}>Play alone</button>
      <button on:click={_ => (rules = true)}>Rules</button>
      <p>
        <small>
          rÊg is an open source puzzle game.
          <a href="https://github.com/lovasoa/reg#r%C3%AAg">More info</a>
          .
        </small>
      </p>
    </section>
  {:else}
    <Game bind:opponent />
  {/if}
</main>