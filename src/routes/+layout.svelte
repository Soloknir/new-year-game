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
		background: url('/assets/background/bg-rp-alt.jpg')
		background-size: contain

		main
			display: flex
			flex-direction: column
			height: 100vh
			box-sizing: border-box
			background: linear-gradient(90deg, rgba(8,33,255,0.577468487394958) 0%, rgba(255,255,255,1) 100%)
			padding: 1rem
</style>
