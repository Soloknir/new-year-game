<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<script>
	import PazzleBobble from "$lib/components/PazzleBobble.svelte";
	import Platformer from "$lib/components/Platformer.svelte";
	import Puzzle from "$lib/components/Puzzle.svelte";
	import Tetris from "$lib/components/Tetris.svelte";

</script>

<section>
	<Platformer />
	<!-- <Tetris /> -->
	<!-- <PazzleBobble /> -->
	<!-- <Puzzle /> -->

</section>

<style lang="sass">
	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
	
</style>
