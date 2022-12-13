<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from './Game';

	let game: Game;
	let canvas: HTMLCanvasElement;

	let minigameLevel = 0;

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			game = new Game(context, rect);
		}
	});
</script>

<div class="container">
	<canvas
		bind:this={canvas}
		width={1320}
		height={640}
	>
		Your browser does not support the HTML5 canvas tag.
	</canvas>
</div>

<style lang="sass">
	canvas
		background-color: #fff
		border: 1px solid #ddd
	
	.dev
		padding: 10px 0

	.toolbar
		width: 750
		display: flex
		flex-direction: row
		gap: 10px

</style>
