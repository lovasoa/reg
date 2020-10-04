<script>
  let language = window.navigator.language.slice(0, 2);
  export let onClose;
</script>

<style>
  .ruleStyle {
    text-align: left;
  }

  .ruleStyle li {
    padding: 10px;
  }
  button {
    border-radius: 50px;
    margin-bottom: 10px;
  }
</style>

<ul class="ruleStyle">
  {#if language !== 'fr'}
    <li>
      Each player in turn places a number between 1 and the total number of
      squares of the grid (the maximal number is 16 for a 4x4 grid). Each number
      can only be placed once.
    </li>
    <li>
      On a given row, column, or diagonal, the numbers must be either increasing
      or decreasing
    </li>
    <li>
      A square becomes darker when there are no numbers that can go on it. A
      player loses when they cannot play at their turn.
    </li>
    <button on:click={_ => (language = 'fr')}>Français</button>
  {/if}

  {#if language == 'fr'}
    <li>
      Chacun leur tour, les joueurs placent des nombres entre 1 et le nombre de
      cases total sur la grille (pour une grille en 4x4, le nombre maximal qu'on
      peut poser est 16). Chaque nombre ne peut être posé qu'une fois.
    </li>
    <li>
      Sur une même ligne, colonne, ou diagonale, les nombres doivent suivre un
      ordre croissant ou décroissant.
    </li>
    <li>
      Une case s'obscurcit lorsqu'on ne peut plus placer aucun nombre dessus. Un
      joueur perd lorsque c'est son tour et qu'il ne peut plus jouer.
    </li>
    <button on:click={_ => (language = 'en')}>English</button>
  {/if}

  <button on:click={onClose}>Menu</button>
</ul>
