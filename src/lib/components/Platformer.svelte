<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from './Game';
	import type Platform from './Objects/StaticPlatform';
	

	let game: Game;
	let downloadAnchor: HTMLAnchorElement;
	let canvas: HTMLCanvasElement;
	let platforms: Platform[] = [];

	function handleWorldReset() {
		game.worldReset();
	}


	function handleSpawnPlayer() {
		game.spawnPlayer();
	}

	async function handleAddPlatform() {
		platforms = [ ...platforms, await game.spawnPlatform('base', { x: 0, y: 0 }, { width: 0, height: 0 })];
	}

	function handleDownloadMap() {
		const payload = {
			platforms: platforms.map((platform) => ({
				name: 'base',
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

			platforms = await game.loadMap();
			game.gameStart();

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (game && game.player) {
			switch(event.code) {
				case 'KeyW': game.player.startJumping(); break;
				case 'KeyD': game.player.startMoveRight(); break;
				case 'KeyA': game.player.startMoveLeft(); break;
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (game && game.player) {
			switch(event.code) {
				case 'KeyW': game.player.stopJumping(); break;
				case 'KeyD': game.player.stopMoveRight(); break;
				case 'KeyA': game.player.stopMoveLeft(); break;
			}
		}
	}
</script>

<div class="container">
	<canvas bind:this={canvas} width="{1024}" height="{512}">
		Your browser does not support the HTML5 canvas tag.
	</canvas>
	<div class="dev toolbar">
		<button on:click="{handleSpawnPlayer}">Spawn player</button>
	</div>
	<div>
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-missing-content -->
		<a bind:this="{downloadAnchor}" style:display="none" />
		{#each platforms as platform}
			<div>
				<input type="number" bind:value="{ platform.vCoordinates.x }">
				<input type="number" bind:value="{ platform.vCoordinates.y }">
				<input type="number" bind:value="{ platform.width }">
				<input type="number" bind:value="{ platform.height }">
			</div>
		{/each}
		<button on:click="{handleAddPlatform}">Add platform</button>
		<button on:click="{handleDownloadMap}">Download map</button>
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

</style>
