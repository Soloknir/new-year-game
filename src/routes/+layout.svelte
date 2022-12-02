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
		background: linear-gradient(90deg, rgba(8,33,255,0.577468487394958) 0%, rgba(255,255,255,1) 100%)
		padding: 1rem
</style>
