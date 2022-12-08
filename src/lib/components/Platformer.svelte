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

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
		}
	});

	function handleMinigameEnd() {
		minigame = false;
		minigameLevel++;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player && !minigame) {
			switch (event.code) {
				case 'KeyW':
					game.gameState.player.startJumping();
					break;
				case 'KeyD':
					game.gameState.player.startMoveRight();
					break;
				case 'KeyA':
					game.gameState.player.startMoveLeft();
					break;
				case 'Space':
					game.startMiniGame();
					break;
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player && !minigame) {
			switch (event.code) {
				case 'KeyW':
					game.gameState.player.stopJumping();
					break;
				case 'KeyD':
					game.gameState.player.stopMoveRight();
					break;
				case 'KeyA':
					game.gameState.player.stopMoveLeft();
					break;
			}
		}
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
