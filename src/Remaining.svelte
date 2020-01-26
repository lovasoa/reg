<script>
  export let size, possibilities_set;
  $: remaining = new Array(size * size).fill().map((_, i) => ({
    value: i + 1,
    valid: possibilities_set.has(i + 1)
  }));

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
    user-select: none;
  }
</style>

<section>
  {#each remaining as { value, valid }}
    <div
      class="remaining validatable"
      class:valid
      on:dragstart={e => dragstart(e, value)}
      draggable={valid}>
      {value}
    </div>
  {/each}
</section>
