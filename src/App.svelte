<script>
  import { NetworkOpponent, AiOpponent, NoOpponent } from "./opponent.js";
  import Game from "./Game.svelte";

  const url = new URL(window.location.toString());
  const params = new URLSearchParams(url.search);
  let opponent = params.get("id") ? new NetworkOpponent(url, params) : null;
  let rules = false
  let language = window.navigator.language.slice(0,2)
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
    {#if language !== "fr"}
    <p>
     * Each player in turn places a number between 1 and the total number of squares of the grid (the maximal number is 16 for a 4x4 grid). Each number can only be placed once.
     </p>
    <p>
     * On a same row, column, or diagonal, the numbers must be either increasing or decreasing
    </p>
    <p>
     * A square becomes darker when there are no numbers that can go on it. A player loses when they cannot play at their turn.
    </p>
      <button on:click={_ => (language = "fr")}>Français</button>
     {/if}

    {#if language == "fr"}
      <p>
      * Chacun leur tour, les joueurs placent des nombres entre 1 et le nombre de cases total sur la grille (pour une grille en 4x4, le nombre maximal qu'on peut poser est 16). Chaque nombre ne peut être posé qu'une fois.
      </p>
      <p>
      * Sur une même ligne, colonne, ou diagonale, les nombres doivent suivre un ordre croissant ou décroissant.
      </p>
      <p>
      * Une case s'obscurcit lorsqu'on ne peut plus placer aucun nombre dessus. Un joueur perd lorsque c'est son tour et qu'il ne peut plus jouer.
      </p>
      <button on:click={_ => (language = "en")}>English</button>
    {/if}

    <button on:click={_ => (opponent = null, rules = false)}>Menu</button>

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