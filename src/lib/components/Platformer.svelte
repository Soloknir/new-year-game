<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from './Game';
	import Memo from './MiniGames/Memo.svelte';

	let game: Game;
	let canvas: HTMLCanvasElement;
	let showMemo = false;

	const playMemo = () => showMemo = true;

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			game = new Game(context, rect);
			game.playMemo = () => showMemo = true;
		}
	});
</script>

<div class="container">
	{#if game && showMemo}
		<svelte:component this="{Memo}" on:done="{ () => { showMemo = false; game.resume() }}"></svelte:component>
	{/if}
	<canvas
		bind:this={canvas}
		style:display="{showMemo ? 'none' : 'block'}"
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
