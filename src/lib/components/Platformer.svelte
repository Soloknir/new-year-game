<script lang="ts">
	import { onMount } from 'svelte';
	import FlipMemoryGame from './FlipMemoryGame.svelte';
	import { Game, type IGameState } from './Game';
	import type { GameObject } from './Objects/GameObject';
	import type Platform from './Objects/Platform';
	import { Vector2D } from './Vector';
	
	let game: Game;
	let downloadAnchor: HTMLAnchorElement;
	let canvas: HTMLCanvasElement;
	let platforms: Platform[] = [];
	let characters: GameObject[] = [];

	let showFlip = false;

	function handleSpawnPlayer() {
		game.spawnPlayer();
	}

	async function handleSpawnSanta() {
		characters = [ ...characters, await game.spawnSanta(new Vector2D())];
	}

	async function handleAddPlatform() {
		platforms = [ ...platforms, await game.spawnPlatform('base', { x: 0, y: 0 }, { width: 0, height: 0 })];
	}

	function handleDownloadMap() {
		const payload = {
			characters: characters.map((platform) => ({
				id: 'santa',
				position: platform.vCoordinates.getCoordsObject(),
			})),
			platforms: platforms.map((platform) => ({
				id: 'base',
				position: platform.vCoordinates.getCoordsObject(),
				size: { width: platform.width, height: platform.height }
			}))
		}

		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
		downloadAnchor.setAttribute("href", dataStr);
		downloadAnchor.setAttribute("download", "map.json");
		downloadAnchor.click();	
	}

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();
			
			game = new Game(context,{ width: rect.width, height: rect.height});

			[characters, platforms] = await game.loadMap();
			game.gameStart();
			game.startFlipGameCallback = () => showFlip = true;

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
		}
	});

	function hanleFlipEnd() {
		showFlip = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player) {
			switch(event.code) {
				case 'KeyW': game.gameState.player.startJumping(); break;
				case 'KeyD': game.gameState.player.startMoveRight(); break;
				case 'KeyA': game.gameState.player.startMoveLeft(); break;
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player) {
			switch(event.code) {
				case 'KeyW': game.gameState.player.stopJumping(); break;
				case 'KeyD': game.gameState.player.stopMoveRight(); break;
				case 'KeyA': game.gameState.player.stopMoveLeft(); break;
			}
		}
	}
</script>

<div class="container">
	{#if showFlip}
		<FlipMemoryGame on:done="{hanleFlipEnd}" />
		<button on:click="{hanleFlipEnd}">End flip</button>
	{/if}
	<canvas style:display="{ showFlip ? 'none' : 'block'}" bind:this={canvas} width="{1024}" height="{512}">
		Your browser does not support the HTML5 canvas tag.
	</canvas>
	<div style:display="{ showFlip ? 'none' : 'block'}" class="dev toolbar">
		<button on:click="{handleSpawnPlayer}">Spawn player</button>
		<button on:click="{handleSpawnSanta}">Spawn santa</button>
	</div>
	<div style:display="{ showFlip ? 'none' : 'block'}" class="dev">
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-missing-content -->
		<a bind:this="{downloadAnchor}" style:display="none" />
		
		{#each characters as character}
			<div>
				Character:
				<input type="number" bind:value="{ character.vCoordinates.x }">
				<input type="number" bind:value="{ character.vCoordinates.y }">
			</div>
		{/each}
		{#each platforms as platform}
			<div>
				Base platform:
				<input type="number" bind:value="{ platform.vCoordinates.x }">
				<input type="number" bind:value="{ platform.vCoordinates.y }">
				<input type="number" bind:value="{ platform.width }">
				<input type="number" bind:value="{ platform.height }">
			</div>
		{/each}
	</div>
	<button style:display="{ showFlip ? 'none' : 'block'}" on:click="{handleAddPlatform}">Add platform</button>
	<button style:display="{ showFlip ? 'none' : 'block'}" on:click="{handleDownloadMap}">Download map</button>
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
