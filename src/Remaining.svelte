<script>
  export let grid;
  const size = grid.length;
  let remaining, set;
  $: set = new Set(grid.flat());
  $: remaining = Array(size * size)
    .fill()
    .map((_, i) => ({ value: i + 1, present: set.has(i + 1) }));

  function dragstart(e, value) {
    e.dataTransfer.setData("text/plain", value);
  }
</script>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
  }
  .remaining {
    width: 30px;
    height: 30px;
    border: 1px solid black;
    border-radius: 6px;
    text-align: center;
    font-size: 20px;
    line-height: 30px;
    margin: 6px;
    user-select: none;
  }
</style>

<section>
  {#each remaining as { value, present }}
    <div
      class="remaining validatable"
      class:valid={!present}
      on:dragstart={e => dragstart(e, value)}
      draggable={!present}>
      {value}
    </div>
  {/each}
</section>
