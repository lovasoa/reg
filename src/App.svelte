<script>
	import Remaining from './Remaining.svelte';
	
	let name = 'world';
	let size = 4;
	let grid = new Array(size).fill().map(_ => new Array(size).fill());
	let valid, error;
	$: error = find_error(grid);
	$: valid = !error;
	
	function only_nums(line) {
		 return line.filter(x => x != null)
	}
	
	function in_range(grid) {
		return grid.flat().every(x => x==null || 1 <= x && x <= size*size);
	}
	
	function is_unique(grid) {
			let unicity = new Set;
			return only_nums(grid.flat()).every(x => !unicity.has(x) && unicity.add(x));
	}
	
	function is_increasing(line) {
		return line.slice(1).every((x,i) => x > line[i])
	}
	
	function is_decreasing(line) {
		return line.slice(1).every((x,i) => x < line[i])
	}
	
	function is_sorted(grid) {
		const [a,b] = [grid, reversed(grid)].map(g => g.map(only_nums).map(is_increasing));
		return a.every((x,i) => x || b[i]);
	}
	
	function columns(grid) {
		 return grid.map((line,i) => line.map((value, j) => grid[j][i]))
	}
	
	function reversed(grid) {
		return grid.map(line => line.map((_,i)=>line[line.length-1-i]))
	}
	
	function diagonals(grid) {
		return Array(2*size).fill().map((_, i)=> {
			let [x,y] = i<size ? [0,size-i] : [i-size,0];
			return Array(size-x-y).fill().map((_,i) => grid[x+i][y+i]);
		});
	}
	
	function find_error(grid) {
			if(!in_range(grid)) return `All number must be between 1 and ${size*size}`;
			if(!is_unique(grid)) return `No number can appear more than once`;
			if(!is_sorted(grid)) return `Numbers in a line must be either increasing or decreasing`;
			if(!is_sorted(columns(grid))) return `Numbers in a column must be either increasing or decreasing`;
			if(!is_sorted(diagonals(grid))) return `Numbers in the first diagonal must be either increasing or decreasing`;
			if(!is_sorted(diagonals(reversed(grid)))) return `Numbers in the second diagonal must be either increasing or decreasing`;
	}
</script>

<style>
	.numbox {
		font-size: 50px;
		width: 17vw;
		height: 17vw;
		margin:auto;
		padding:0;
		text-align: center;
	}
	table {
		width: 90vw;
		height: 90vw;
		margin: auto;
	}
	:global(.validatable) {
		padding: 10px;
		border-radius: 6px;
		border: 1px solid black;
		background-color: #FF4136;
	}
	:global(.valid) {
		background-color: #2ECC40;
	}
	h1{
		text-align: center;
	}
</style>

<h1>r g</h1>
<table class="validatable" class:valid>
	{#each grid as line}
		<tr>
			{#each line as value}
				<td><input class=numbox type=number bind:value min=1 max={size*size}/></td>
			{/each}
		</tr>
	{/each}
</table>

<p class=validatable class:valid>{error || "The grid is valid"}</p>
<Remaining bind:grid/>