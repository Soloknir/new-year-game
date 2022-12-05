<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let hasFlippedCard = false;
	let lockBoard = false;
	let firstCardIndex: number | null = null;
	let secondCardIndex: number | null = null;


	let cards = [
		{
			name: 'react',
			alt: 'React',
			flip: false,
			order: 0
		},
		{
			name: 'react',
			alt: 'React',
			flip: false,
			order: 0
		},
		{
			name: 'angular',
			alt: 'Angular',
			flip: false,
			order: 0
		},
		{
			name: 'angular',
			alt: 'Angular',
			flip: false,
			order: 0
		},
		{
			name: 'ember',
			alt: 'Ember',
			flip: false,
			order: 0
		},
		{
			name: 'ember',
			alt: 'Ember',
			flip: false,
			order: 0
		},
		{
			name: 'vue',
			alt: 'Vue',
			flip: false,
			order: 0
		},
		{
			name: 'vue',
			alt: 'Vue',
			flip: false,
			order: 0
		},
		{
			name: 'aurelia',
			alt: 'Aurelia',
			flip: false,
			order: 0
		},
		{
			name: 'aurelia',
			alt: 'Aurelia',
			flip: false,
			order: 0
		},
		{
			name: 'backbone',
			alt: 'Backbone',
			flip: false,
			order: 0
		},
		{
			name: 'backbone',
			alt: 'Backbone',
			flip: false,
			order: 0
		}
	];

	function handleFlipCard(index: number) {
		if (lockBoard) return;
		if (firstCardIndex === index) return;
		
		cards[index].flip = true;

		if (!hasFlippedCard) {
			hasFlippedCard = true;
			firstCardIndex = index;
			return;
		}

		secondCardIndex = index;
		lockBoard = true;

		checkForMatch();
	}

	function checkForMatch() {
		if (firstCardIndex !== null && secondCardIndex !== null)
		cards[firstCardIndex].name === cards[secondCardIndex].name
			? disableCards()
			: unflipCards(cards[firstCardIndex], cards[secondCardIndex]);
	}

	function disableCards() {
		resetBoard();
		if (!(cards.some(card => !card.flip))) {
			dispatch('done');
		}
	}

	function unflipCards(firstCard: any, secondCard: any) {
  	setTimeout(() => {
			firstCard.flip = false;
			secondCard.flip = false;
			cards = [...cards];
			resetBoard();
		}, 1500);
	}

	function resetBoard() {
		hasFlippedCard = false;
		lockBoard = false;
		firstCardIndex = null;
		secondCardIndex = null;
	}

	(function shuffle() {
		cards = cards.map(card => {
			card.order = Math.ceil(Math.random() * 12);
			return card;
		}).sort((a, b) => (a.order > b.order  ? 1 : -1))
	})();
</script>

<div class="memory-game">
	{#each cards as { flip, name, alt }, index}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="memory-card" class:flip="{flip}" data-name="{name}" on:click={() => handleFlipCard(index)}>
			<img class="front-face" src="/new-year-game/assets/flip/{name}.svg" alt="{alt}">
			<img class="back-face" src="/new-year-game/assets/flip/js-badge.svg" alt="Memory Card">
		</div>
	{/each}
</div>

<style>
	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}

	.memory-game {
		width: 640px;
		height: 640px;
		margin: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		perspective: 1000px;
	}

	.memory-card {
		width: calc(25% - 10px);
		height: calc(33.333% - 10px);
		margin: 5px;
		position: relative;
		box-shadow: 1px 1px 1px rgba(0,0,0,.3);
		transition: all .5s;
		transform-style: preserve-3d;
		transform: scale(1);
	}

	.memory-card.flip {
		transform: rotateY(180deg);
	}

	.memory-card:active {
		transform: scale(0.97);
		transition: transform .2s;
	}

	.front-face,
	.back-face {
		width: 100%;
		height: 100%;
		padding: 20px;
		position: absolute;
		backface-visibility: hidden;
		border-radius: 5px;
		background: #1C7CCC;
	}

	.front-face {
		transform: rotateY(180deg);
	}

	@media screen and (max-width: 750px) and (max-height: 500px) {
		.memory-game {
			width: 50%;
			height: 90%;
		}

		.memory-card {
			width: calc(25% - 8px);
			height: calc(33.333% - 8px);
			margin: 4px;
		}

		.front-face,
		.back-face {
			padding: 10px;
		}
	}
</style>