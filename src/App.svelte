<script>
  import history from "./history.js";
  import { NetworkOpponent, NoOpponent, AiOpponent } from "./opponent.js";
  import Game from "./Game.svelte";
  import Rules from "./Rules.svelte";
  import t from "./translations.js";

  function playAgainst(cls) {
    const url = new URL(window.location);
    $history.opponent = new cls(url);
  }

  function reset() {
    $history = {};
    showRules = false;
  }

  let showRules = false;
  let online = window.navigator.onLine;
  window.addEventListener("online", _ => (online = true));
  window.addEventListener("offline", _ => (online = false));
</script>

<style>
  :global(.validatable) {
    padding: 10px;
    border-radius: 6px;
    background-color: #da394e;
    margin: 8px;
    color: #dbfcff;
  }
  :global(.valid) {
    background-color: #1a82a5;
  }
  :global(.validatable a) {
    color: #ffffff;
    font-weight: bold;
  }
  section {
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

<h1 on:click={reset}>rÊg</h1>
<main>

  {#if $history.opponent != null}
    <Game bind:opponent={$history.opponent} />
  {:else}
    <section class="validatable valid">
      {#if showRules == true}
        <Rules onClose={() => (showRules = false)} />
      {:else}
        <button on:click={_ => playAgainst(AiOpponent)}>
          {t('Play against an AI')}
        </button>
        <button disabled={!online} on:click={_ => playAgainst(NetworkOpponent)}>
          {t('Play online with a friend')}
        </button>
        <button on:click={_ => playAgainst(NoOpponent)}>
          {t('Play offline')}
        </button>
        <button on:click={_ => (showRules = true)}>{t('Rules')}</button>
        <p>
          <small>
            {t('rÊg is an open source puzzle game.')}
            <a href="https://github.com/lovasoa/reg#r%C3%AAg">
              {t('More info')}
            </a>
            .
          </small>
        </p>
      {/if}

    </section>
  {/if}

</main>
