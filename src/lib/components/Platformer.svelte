<script lang="ts">
	import { onMount } from 'svelte';
	import GameDriver from './GameDriver';

	let gameDriver: GameDriver;
	let canvas: HTMLCanvasElement;
	
	function handleWorldReset() {
		gameDriver.clearWorldState();
	}

	function handleAddCircle() {
		gameDriver.addCircle();
	}

	function handleAddRect() {
		gameDriver.addRect();
	}

	function handleSpawnPlayer() {
		gameDriver.spawnPlayer();
	}

	onMount(() => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			gameDriver = new GameDriver(context, rect.width, rect.height);

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (gameDriver && gameDriver.player) {
			switch(event.code) {
				case 'KeyW': gameDriver.player.startJumping(); break;
				case 'KeyD': gameDriver.player.startMoveRight(); break;
				case 'KeyA': gameDriver.player.startMoveLeft(); break;
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (gameDriver && gameDriver.player) {
			switch(event.code) {
				case 'KeyW': gameDriver.player.stopJumping(); break;
				case 'KeyD': gameDriver.player.stopMoveRight(); break;
				case 'KeyA': gameDriver.player.stopMoveLeft(); break;
			}
		}
	}
</script>

<div class="container">
	<canvas bind:this={canvas} width="{1024}" height="{512}">
		Your browser does not support the HTML5 canvas tag.
	</canvas>
	<div class="dev toolbar">
		<button on:click="{handleWorldReset}">World reset</button>
		<button on:click="{handleSpawnPlayer}">Spawn player</button>
		<button on:click="{handleAddCircle}">Add circle</button>
		<button on:click="{handleAddRect}">Add rectangle</button>
	</div>
	<div class="dev player-state">
		<!--
			<div>Player coords: {gameDriver.player.vCoordinates.x} {gameDriver.player.vCoordinates.y}</div>
			<div>Player horizontal speed: {gameDriver.player.vVelocity.x}</div>
			<div>Player vertical speed: {gameDriver.player.vVelocity.y}</div>
			<div>Player at the floor: {gameDriver.player.isAtFloor}</div>
		-->
	</div>
</div>

<style lang="sass">
	canvas
		background-color: #fff
		border: 1px solid #ddd

	.toolbar
		padding: 10px 0
		width: 750
		display: flex
		flex-direction: row
		gap: 10px
	
	.player-state
		width: 750px
		padding: 10px 0

</style>
