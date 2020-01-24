<script>
  import Remaining from "./Remaining.svelte";
  import { find_error } from "./grid.js";

  let name = "world";
  let size = 4;
  let grid = new Array(size).fill().map(_ => new Array(size).fill());
  let valid, error;
  $: error = find_error(grid);
  $: valid = !error;
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
  }
  :global(.valid) {
    background-color: #2ecc40;
  }
  h1 {
    text-align: center;
  }
  main {
    width: 500px;
    margin: auto;
  }
</style>

<h1>rÊg</h1>

<main>
  <table class="validatable" class:valid>
    {#each grid as line}
      <tr>
        {#each line as value}
          <td>
            <input
              class="numbox"
              type="number"
              bind:value
              min="1"
              max={size * size} />
          </td>
        {/each}
      </tr>
    {/each}
  </table>

  <p class="validatable" class:valid>{error || 'The grid is valid'}</p>
  <Remaining bind:grid />
</main>
