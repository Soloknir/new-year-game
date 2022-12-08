<script lang="ts">
	import { onMount } from 'svelte';
	import FlipMemory from './FlipMemory.svelte';
	import { Game } from './Game';
	import PazzleBobble from './PazzleBobble.svelte';
	import Tetris from './Tetris.svelte';

	let game: Game;
	let canvas: HTMLCanvasElement;

	let minigame = false;
	let winGame = false;

	const minigames = [
		PazzleBobble,
		FlipMemory,
		Tetris
	];

	let minigameLevel = 0;

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			game = new Game(context, { width: rect.width, height: rect.height });

			await game.loadMap();
			game.gameStart();
			game.startMinigameCallback = () => {
				game.stopListeningControls();
				if (minigameLevel < minigames.length) {
					minigame = true;
					if (game.gameState.player) {
						game.gameState.player.stopJumping();
						game.gameState.player.stopMoveRight();
						game.gameState.player.stopMoveLeft();
					}
				} else {
					winGame = true;
				}
			};

		}
	});

	function handleMinigameEnd() {
		minigame = false;
		minigameLevel++;
		game.startListeningControls();
	}
</script>

<div class="container">
	{#if winGame}
		<h1>Вы победили! С Новым Годом!</h1>
	{/if}
	{#if !winGame && minigame}
		<svelte:component this="{minigames[minigameLevel]}" on:done="{handleMinigameEnd}"/>
		<button on:click={handleMinigameEnd}>Skip minigame</button>
	{/if}
	<canvas
		style:display={minigame || winGame ? 'none' : 'block'}
		bind:this={canvas}
		width={1024}
		height={512}
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
