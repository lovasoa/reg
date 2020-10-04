<script>
  import { NetworkOpponent, AiOpponent, NoOpponent } from "./opponent.js";
  import Game from "./Game.svelte";
  import Rules from "./Rules.svelte";
  import t from "./translations.js";

  const url = new URL(window.location.toString());
  const params = new URLSearchParams(url.search);
  let opponent = params.get("id") ? new NetworkOpponent(url, params) : null;
  let rules = false;
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

<h1
  on:click={_ => {
    opponent = null;
    rules = false;
  }}>
  rÊg
</h1>
<main>

  {#if opponent !== null}
    <Game bind:opponent />
  {:else}
    <section class="validatable valid">
      {#if rules == true}
        <Rules onClose={() => (rules = false)} />
      {:else}
        <button on:click={_ => (opponent = new AiOpponent())}>
          {t('Play against an AI')}
        </button>
        <button
          disabled={!online}
          on:click={_ => (opponent = new NetworkOpponent(url, params))}>
          {t('Play online with a friend')}
        </button>
        <button on:click={_ => (opponent = new NoOpponent())}>
          {t('Play offline')}
        </button>
        <button on:click={_ => (rules = true)}>{t('Rules')}</button>
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
