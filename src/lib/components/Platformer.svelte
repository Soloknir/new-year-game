<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from './Game';
	import Memo from './MiniGames/Memo.svelte';
	import Spinner from './Spinner.svelte';

	let game: Game;
	let canvas: HTMLCanvasElement;
	let showMemo = false;
	let loading = true;

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			game = new Game(context, rect, () => loading = false);
			game.playMemo = () => showMemo = true;
		}
	});
</script>

<div class="container">
	{#if loading}
		<div class="spinner">
			<Spinner /> <span class="text">Загрузка...</span>
		</div>
	{/if}

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
	
	.spinner
		position: absolute
		width: 1320px
		height: 640px
		display: flex
		gap: 24px
		justify-content: center
		align-items: center

		.text
			color: rgb(1, 77, 100)
			font:
				size: 24px
				weight: bold
</style>
