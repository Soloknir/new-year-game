<script lang="ts">
	import { onMount } from 'svelte';
	import FlipMemoryGame from './FlipMemoryGame.svelte';
	import { Game, type IGameState } from './Game';
	import type { GameObject } from './Objects/GameObject';
	import MovingPlatform from './Objects/MovingPlatform';
	import type Platform from './Objects/Platform';
	import { Vector2D } from './Vector';

	let game: Game;
	let downloadAnchor: HTMLAnchorElement;
	let canvas: HTMLCanvasElement;
	let platforms: Platform[] = [];
	let characters: GameObject[] = [];

	let showFlip = false;
	let winGame = false;

	function handleSpawnPlayer() {
		game.spawnPlayer();
	}

	async function handleAddPlatform() {
		platforms = [
			...platforms,
			await game.spawnPlatform('base', { x: 0, y: 0 }, { width: 0, height: 0 })
		];
	}

	async function handleAddMovingPlatform() {
		platforms = [
			...platforms,
			await game.spawnMovingPlatform('base', { x: 200, y: 200 },  { x: 300, y: 300 }, 10, { width: 100, height: 20 })
		];
	}

	function handleDownloadMap() {
		const payload = {
			characters: characters.map((platform) => ({
				id: 'santa',
				position: platform.vCoordinates.getCoordsObject()
			})),
			platforms: platforms.map((platform) => {
				const result: any = {
					id: 'base',
					type: 'static',
					position: platform.vCoordinates.getCoordsObject(),
					size: { width: platform.width, height: platform.height }
				};

				if (platform instanceof MovingPlatform) {
					result.type = 'dynamic';
					result.position = platform.vSpawnCoordinates.getCoordsObject();
					result.target = platform.vTargetCoordinates.getCoordsObject();
					result.duration = platform.duration;
				}

				return result;
			})
		};

		var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload));
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', 'map.json');
		downloadAnchor.click();
	}

	onMount(async () => {
		const context = canvas.getContext('2d');

		if (context) {
			const rect = canvas.getBoundingClientRect();

			game = new Game(context, { width: rect.width, height: rect.height });

			[characters, platforms] = await game.loadMap();
			game.gameStart();
			game.startFlipGameCallback = () => {
				showFlip = true;
				if (game.gameState.player) {
					game.gameState.player.stopJumping();
					game.gameState.player.stopMoveRight();
					game.gameState.player.stopMoveLeft();
				}
			};

			game.winGameCallback = () => (winGame = true);

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);
		}
	});

	function hanleSkipFlip() {
		showFlip = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player && !showFlip) {
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
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (game.gameState && game.gameState.player && !showFlip) {
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
		<h1>You are win!</h1>
	{/if}
	{#if showFlip}
		<FlipMemoryGame on:done={hanleSkipFlip} />
		<button on:click={hanleSkipFlip}>Skip flip</button>
	{/if}
	<canvas
		style:display={showFlip || winGame ? 'none' : 'block'}
		bind:this={canvas}
		width={1024}
		height={512}
	>
		Your browser does not support the HTML5 canvas tag.
	</canvas>
	<div style:display={showFlip || winGame ? 'none' : 'block'} class="dev toolbar">
		<button on:click={handleSpawnPlayer}>Spawn player</button>
	</div>
	<div style:display={showFlip || winGame ? 'none' : 'block'} class="dev">
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-missing-content -->
		<a bind:this={downloadAnchor} style:display="none" />

		{#each characters as character}
			<div>
				Character:
				<input type="number" bind:value={character.vCoordinates.x} />
				<input type="number" bind:value={character.vCoordinates.y} />
			</div>
		{/each}
		{#each platforms as platform}
			{#if platform instanceof MovingPlatform}
				<div>
					Moving platform:
					<div>
						<input type="number" bind:value={platform.vSpawnCoordinates.x} />
						<input type="number" bind:value={platform.vSpawnCoordinates.y} />
					</div>
					<div>
						<input type="number" bind:value={platform.width} />
						<input type="number" bind:value={platform.height} />
						<input type="number" bind:value={platform.duration} />
					</div>
					<div>
						<input type="number" bind:value={platform.vTargetCoordinates.x} />
						<input type="number" bind:value={platform.vTargetCoordinates.y} />
					</div>
				</div>
			{:else}
				<div>
					Base platform:
					<input type="number" bind:value={platform.vCoordinates.x} />
					<input type="number" bind:value={platform.vCoordinates.y} />
					<input type="number" bind:value={platform.width} />
					<input type="number" bind:value={platform.height} />
				</div>
			{/if}
		{/each}
	</div>
	<div style:display={showFlip || winGame ? 'none' : 'block'}>
		<button on:click={handleAddPlatform}>Add platform</button>
		<button on:click={handleAddMovingPlatform}>Add moving platform</button>
		<button on:click={handleDownloadMap}>Download map</button>
	</div>
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
