<script>

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<canvas class="scene"/>
</section>

<style lang="sass">
	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		flex: 0.6

		.scene 
			width: 100%
			height: 100%
			background-color: #000
	
</style>
