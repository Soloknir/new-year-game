<script lang="ts">
	import { onMount } from 'svelte';
	import GameDriver from './GameDriver';
	import type StaticPlatform from './Objects/StaticPlatform';
	

	let downloadAnchor: HTMLAnchorElement;
	let gameDriver: GameDriver;
	let canvas: HTMLCanvasElement;
	let platforms: StaticPlatform[] = [];

	function handleWorldReset() {
		gameDriver.worldReset();
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

	function handleAddPlatform() {
		platforms = [ ...platforms, gameDriver.addPlatform()];
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
			gameDriver = new GameDriver(context, rect.width, rect.height);

			await gameDriver.loadAssets([
				'characters/player',
				'platforms/base/head',
				'platforms/base/body',
			]);
			gameDriver.spawnPlayer();
			platforms = [...gameDriver.loadMap()];
			gameDriver.init();

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
