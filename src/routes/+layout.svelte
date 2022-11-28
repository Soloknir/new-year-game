<script>
	import './styles.css';
</script>

<div class="app">

	<main>
		<slot />
	</main>

</div>

<style lang="sass">
	.app 
		display: flex
		flex-direction: column
		min-height: 100vh
	
		main
			display: flex
			flex-direction: column
			padding: 1rem
			width: 100%
			margin: 0 auto
			box-sizing: border-box
</style>
