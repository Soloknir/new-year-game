<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from "svelte";
	import { Bubble } from "./MiniGames/Bubble";
  
  const dispatch = createEventDispatcher();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext('2d');
    if (context) {
      new Bubble(context, () => dispatch('done'));
    }
  });
</script>

<canvas bind:this="{canvas}" width="271" height="392" id="game"></canvas>
