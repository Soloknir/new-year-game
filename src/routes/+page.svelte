<svelte:head>
	<title>Tensor New Year!</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<script>
	import Platformer from "$lib/components/Platformer.svelte";
</script>

<section>
	<Platformer />
</section>

<style lang="sass">
	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
	
</style>
