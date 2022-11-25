<script lang="ts">
	import { onMount } from 'svelte';
	import Circle from './Circle';
	import Square from './Square';

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
	let secondsPassed = 0;
	let oldTimeStamp = 0;
	let gameObjects: Circle[];

	const sceneWidth = 750;
	const sceneHeight = 400;
	const restitution = 0.1;

	function init() {
		// Get a reference to the canvas
		context = canvas.getContext('2d');
		createWorld();
		window.requestAnimationFrame(gameLoop);
	}

	function createWorld() {
		if (!context) return;

		gameObjects = [
			new Circle(context, 250, 50, 0, 50),
			new Circle(context, 250, 300, 0, -50),
			new Circle(context, 150, 0, 50, 50),
			new Circle(context, 250, 150, 50, 50),
			new Circle(context, 350, 75, -50, 50),
			new Circle(context, 300, 300, 50, -50),
			new Circle(context, 150, 150, 0, 50),
			new Circle(context, 150, 400, 0, -50),
			new Circle(context, 250, 100, 50, 50),
			new Circle(context, 350, 250, 50, 50),
			new Circle(context, 450, 175, -50, 50),
			new Circle(context, 400, 400, 50, -50)
		];
	}

	function gameLoop(timeStamp: number) {
		if (!context) return;

		secondsPassed = (timeStamp - oldTimeStamp) / 1000;
		oldTimeStamp = timeStamp;

		// Loop over all game objects
		for (let i = 0; i < gameObjects.length; i++) {
			gameObjects[i].update(secondsPassed);
		}

		detectEdgeCollisions();
		detectCollisions();

		context.clearRect(0, 0, sceneWidth, sceneHeight);

		drawFps(Math.round(1 / secondsPassed));

		// Do the same to draw
		for (let i = 0; i < gameObjects.length; i++) {
			gameObjects[i].draw();
		}

		window.requestAnimationFrame(gameLoop);
	}

	function drawFps(timeStamp: number) {
		if (!context) return;

		context.fillStyle = 'black';
		context.font = '20px Arial';
		context.textAlign = 'right';
		context.textBaseline = 'bottom';
		context.fillText(`fps: ${timeStamp}`, sceneWidth - 20, 30);
	}



	function detectEdgeCollisions() {
		let obj;
		for (let i = 0; i < gameObjects.length; i++) {
			obj = gameObjects[i];

			// Check for left and right
			if (obj.x < obj.radius) {
				obj.vx = Math.abs(obj.vx) * restitution;
				obj.x = obj.radius;
			} else if (obj.x > sceneWidth - obj.radius) {
				obj.vx = -Math.abs(obj.vx) * restitution;
				obj.x = sceneWidth - obj.radius;
			}

			// Check for bottom and top
			if (obj.y < obj.radius) {
				obj.vy = Math.abs(obj.vy) * restitution;
				obj.y = obj.radius;
			} else if (obj.y > sceneHeight - obj.radius) {
				obj.vy = -Math.abs(obj.vy) * restitution;
				obj.y = sceneHeight - obj.radius;
			}
		}
	}

	function rectIntersect(
		x1: number,
		y1: number,
		w1: number,
		h1: number,
		x2: number,
		y2: number,
		w2: number,
		h2: number
	) {
		// Check x and y for overlap
		if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
			return false;
		}
		return true;
	}

	function circleIntersect(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
		// Calculate the distance between the two circles
		let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

		// When the distance is smaller or equal to the sum
		// of the two radius, the circles touch or overlap
		return squareDistance <= (r1 + r2) * (r1 + r2);
	}

	function detectCollisions() {
		let obj1;
		let obj2;

		// Reset collision state of all objects
		for (let i = 0; i < gameObjects.length; i++) {
			gameObjects[i].isColliding = false;
		}

		// Start checking for collisions
		for (let i = 0; i < gameObjects.length; i++) {
			obj1 = gameObjects[i];
			for (let j = i + 1; j < gameObjects.length; j++) {
				obj2 = gameObjects[j];

				// Compare object1 with object2
				if (circleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius)) {
					obj1.isColliding = true;
					obj2.isColliding = true;

					let vCollision = { x: obj2.x - obj1.x, y: obj2.y - obj1.y };
					let distance = Math.sqrt(
						(obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y)
					);
					let vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
					let vRelativeVelocity = { x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy };
					let speed =
						vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

					if (speed < 0) {
						break;
					}

					const impulse = (2 * speed) / (obj1.mass + obj2.mass);
					obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
					obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
					obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
					obj2.vy += impulse * obj1.mass * vCollisionNorm.y;
				}
			}
		}
	}

	function easeInOutQuint(t: number, b: number, c: number, d: number) {
		if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
		return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
	}

	function easeLinear(t: number, b: number, c: number, d: number) {
		return (c * t) / d + b;
	}

	onMount(async () => {
		init();
	});
</script>

<canvas bind:this={canvas} width={sceneWidth} height={sceneHeight}>
	Your browser does not support the HTML5 canvas tag.
</canvas>

<style lang="sass">
	canvas
		background-color: #fff
		border: 1px solid #ddd

</style>
