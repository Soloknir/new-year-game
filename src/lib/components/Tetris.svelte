<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { Tetris } from "./MiniGames/Tetris";
  
  const dispatch = createEventDispatcher();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext('2d');
  });
</script>

<canvas bind:this="{canvas}" width="320" height="640" id="game"></canvas>


<style lang="sass">
  canvas
    border: 1px solid white
</style>