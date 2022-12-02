<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<script>
	import Platformer from "$lib/components/Platformer.svelte";
	import Puzzle from "$lib/components/Puzzle.svelte";

</script>

<section>
	<Platformer />
	<!-- <Puzzle /> -->

</section>

<style lang="sass">
	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
	
</style>
