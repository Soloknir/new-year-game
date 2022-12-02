<script lang="ts">
		var doneCheck = 0;
		var curZindex = 0;
		

		function handlePicMouseDown(event: MouseEvent) {
			console.log(event);
			// $(this).css("z-index", curZindex + 1).children().addClass("grabbed").mouseup(function() {
			// 	$(this).removeClass("grabbed");
			// });
			curZindex++;
		}

		/*

		$(".pic").draggable({
			containment: "body",
			scroll: false
		}).on("mousedown", function() {
			$(this).css("z-index", curZindex + 1).children().addClass("grabbed").mouseup(function() {
				$(this).removeClass("grabbed");
			});
			curZindex++;
		});

		shuffle();
		dropSet();

		function shuffle() {
			for (var k = 1; k <= 5; k++)
				for (var i = 1; i <= 5; i++) {
					var posHolderLeft;
					var posHolderTop;
					var randIndex = Math.floor(Math.random() * 5) + 1;
					var randIndex2 = Math.floor(Math.random() * 5) + 1;
					posHolderTop = $(".pic-" + i + "-" + k).css("top");
					posHolderLeft = $(".pic-" + i + "-" + k).css("left");
					$(".pic-" + i + "-" + k).css("top", $(".pic-" + randIndex + "-" + randIndex2).css("top"));
					$(".pic-" + randIndex + "-" + randIndex2).css("top", posHolderTop);
					$(".pic-" + i + "-" + k).css("left", $(".pic-" + randIndex + "-" + randIndex2).css("left"));
					$(".pic-" + randIndex + "-" + randIndex2).css("left", posHolderLeft);
				}
		}

		function dropSet() {
			for (var i = 1; i <= 5; i++)
				for (var k = 1; k <= 5; k++) {
					$(".dz-" + i + "-" + k).droppable({
						accept: ".pic-" + i + "-" + k,
						drop: function(event, ui) {
							doneCheck++;
							$(ui.helper[0]).css("top", $(this).position().top);
							$(ui.helper[0]).css("left", $(this).position().left);
							$(ui.helper[0]).draggable("disable").css("z-index", "1");
							if (doneCheck == 25) {
								$(".pic").css("border", "none");
								alert("Good job!");
							}
						}
					})
				}
		}
		*/
</script>

<div class="puzzle-wrapper">
		<div class="container">
			{#each Array(5) as _, i}
				{#each Array(5) as _, k}
					<div draggable="true"  class="pic pic-{i}-{k}" on:mousedown={handlePicMouseDown}>
						<div draggable="true" class="inner-pic inner-pic-{i}-{k}" on:mousedown={handlePicMouseDown}></div>
					</div>
				{/each}
			{/each}
		</div>
		<div class="drop-zone">
			{#each Array(5) as i}
				{#each Array(5) as k}
					<div class="dz dz-{i}-{k}">
						<div class="indz indz-{i}-{k}"></div>
					</div>
				{/each}
			{/each}
		</div>
	</div>

<style lang="sass">
	.puzzle-wrapper
		font-size: 0
		margin-left: 50%
		transform: translateX(-50%)
		margin-top: 40px
		position: relative   
		
	.dz
		width: 50px
		height: 50px
		float: left
		box-sizing: border-box
		border: 1px solid #fff
		background: #ccc
		opacity: .4
		overflow: hidden
		
	.indz
		width: 250px
		height: 250px
		background-image: url("https://kiyutink.github.io/moscow/moscow1.jpg")
		background-size: cover
			
	.drop-zone
		width: 250px
		height: 250px
		display: inline-block
		margin-left: 24px
		font-size: 1rem
			
	.container
		width: 250px
		height: 250px
		color: red
		display: inline-block
		
	.pic
		width: 50px
		height: 50px
		float: left
		overflow: hidden
		border: 1px solid #fff
		position: absolute
		z-index: 0  
		font-size: 1rem
		
	.inner-pic
		width: 250px
		height: 250px
		background-image: url("https://kiyutink.github.io/moscow/moscow1.jpg")
		background-size: cover
		cursor: grab

	.grabbed
		cursor: grabbing
		
	@for $row from 1 through 5  
		@for $col from 1 through 5
			.inner-pic-#{$row}-#{$col}, .indz-#{$row}-#{$col}
				background-position: (1 - $col) * 50px  (1 - $row) * 50px
			.pic-#{$row}-#{$col}
				left: ($col - 1)  * 50px
				top: ($row - 1) * 50px
</style>