import { detectCircleIntersect, detectRectCircleIntersect, detectRectIntersect } from "./Helpers/Intersections";
import Circle from "./Objects/Circle";
import type { IGameObject } from "./Objects/Interfaces";
import Player from "./Objects/Player";
import Rectangle from "./Objects/Rectangle";
import StaticPlatform from "./Objects/StaticPlatform";
import { isInstanceOfRectangular, isInstanceOfRound, type GameObjectType, type RectangularType, type RoundType } from "./Objects/Types";
import { Vector2D } from "./Vector";
;

export default class GameDriver {
	context: CanvasRenderingContext2D;
	viewPortWidth: number;
	viewPortHeight: number;

	gameObjects: (GameObjectType & IGameObject)[] = [];
	staticGameObjects: StaticPlatform[] = [];
	player: Player | null = null;
	
	secondsPassed = 0;
	oldTimeStamp = 0;
	restitution = 0.1;

	constructor(context: CanvasRenderingContext2D, width: number, height: number) {
		this.context = context;

		this.viewPortWidth = width;
		this.viewPortHeight = height;
		
		this.staticGameObjects = [
			new StaticPlatform(this.context, new Vector2D(100, 100)),
			new StaticPlatform(this.context, new Vector2D(500, 200)),
		];

		window.requestAnimationFrame(this.gameLoop);
	}
	
	gameLoop = (timeStamp: number) => {
		this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
		this.oldTimeStamp = timeStamp;

		// Loop over all game objects
		this.gameObjects.forEach(obj => obj.update(this.secondsPassed));

		this.detectEdgeCollisions();
		this.detectStaticObjectCollision()
		this.detectCollisions();

		this.context.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);

		this.drawFps(Math.round(1 / this.secondsPassed));

		// Do the same to draw
		this.staticGameObjects.forEach(obj => obj.draw(this.viewPortHeight));
		this.gameObjects.forEach(obj => obj.draw(this.viewPortHeight));

		window.requestAnimationFrame(this.gameLoop);
	}

	drawFps = (timeStamp: number) => {
		this.context.fillStyle = 'black';
		this.context.font = '20px Arial';
		this.context.textAlign = 'right';
		this.context.textBaseline = 'bottom';
		this.context.fillText(`fps: ${timeStamp}`, this.viewPortWidth - 20, 30);
	}

	detectEdgeCollisions = () => {
		this.gameObjects.forEach((obj) => {
			const { vCoordinates: vCoordinates, vVelocity } = obj;

			// Check for left and right
			if (vCoordinates.x < obj.getLeft()) {
				obj.vVelocity.x = Math.abs(vVelocity.x) * this.restitution;
				obj.vCoordinates.x = obj.getLeft();
				obj.vVelocity.y = obj.vVelocity.y * (1 - obj.friction);
			} else if (vCoordinates.x > this.viewPortWidth - obj.getRight()) {
				obj.vVelocity.x = -Math.abs(vVelocity.x) * this.restitution;
				obj.vCoordinates.x = this.viewPortWidth - obj.getRight();
				obj.vVelocity.y = obj.vVelocity.y * (1 - obj.friction);
			}

			// Check for bottom and top
			if (vCoordinates.y < -obj.getBottom()) {
				obj.vVelocity.y = Math.abs(vVelocity.y) * this.restitution;
				obj.vCoordinates.y = -obj.getBottom();
				obj.isAtFloor = true;
				obj.vVelocity.x = obj.vVelocity.x * (1 - obj.friction);
			} else if (vCoordinates.y > this.viewPortHeight - obj.getTop()) {
				obj.vVelocity.y = -Math.abs(vVelocity.y) * this.restitution;
				obj.vCoordinates.y = this.viewPortHeight - obj.getTop();
			}
		});
	}

	detectStaticObjectCollision = (): void => {
		this.staticGameObjects.forEach((staticPlatform: StaticPlatform) => {
			let isColliding = false
			this.gameObjects.forEach((obj) => {
				if (this.detectObjectIntersect(staticPlatform, obj)) {
					if ((obj.vCoordinates.y + obj.getBottom() > staticPlatform.vCoordinates.y + staticPlatform.getBottom())
						&& (obj.vCoordinates.y + obj.getTop() > staticPlatform.vCoordinates.y + staticPlatform.getTop())) {
						obj.vCoordinates.y = staticPlatform.vCoordinates.y + staticPlatform.getTop() - obj.getBottom();
						obj.vVelocity.x = obj.vVelocity.x * (1 - obj.friction);
						obj.vVelocity.y = 1;
						obj.isAtFloor = true;
					}

					if ((obj.vCoordinates.y + obj.getTop() < staticPlatform.vCoordinates.y + staticPlatform.getTop())
						&& (obj.vCoordinates.y + obj.getBottom() < staticPlatform.vCoordinates.y + staticPlatform.getBottom())) {
						obj.vCoordinates.y = staticPlatform.vCoordinates.y - obj.getTop();
						obj.vVelocity.y = -1;
					}



					staticPlatform.color = 'blue';
					isColliding = true;
				}
			});

			staticPlatform.color = isColliding ? 'blue' : 'green';
		})
	}

	detectObjectIntersect = (o1: GameObjectType, o2: GameObjectType): boolean => {
		if (isInstanceOfRound(o1)) {
			if (isInstanceOfRound(o2)) {
				return detectCircleIntersect(o1 as RoundType, o2 as RoundType)
			}

			if (isInstanceOfRectangular(o2)) {
				return detectRectCircleIntersect(o2 as RectangularType, o1 as RoundType)
			}
		}

		if (isInstanceOfRectangular(o1)) {
			if (isInstanceOfRectangular(o2)) {
				return detectRectIntersect(o1 as RectangularType, o2 as RectangularType);
			} else {
				return detectRectCircleIntersect(o1 as RectangularType, o2 as RoundType);
			}
		}

		return false;
	}

	detectCollisions = () => {
		let obj2;

		// Reset collision state of all objects
		this.gameObjects.forEach((obj) => obj.isColliding = false);

		this.gameObjects.forEach((obj1, i) => {
			for (let j = i + 1; j < this.gameObjects.length; j++) {
				obj2 = this.gameObjects[j];

				// Compare object1 with object2
				if (this.detectObjectIntersect(obj1, obj2)) {
					obj1.isColliding = true;
					obj2.isColliding = true;

					const vCollision = obj2.vCoordinates.getDifference(obj1.vCoordinates); // Get collision vector
					const distance = obj1.vCoordinates.getDistance(obj2.vCoordinates); // Get distance between 
					const vCollisionNorm = vCollision.divByNumber(distance); // Get normalized collision vector
					const vRelativeVelocity = obj1.vVelocity.getDifference(obj2.vVelocity); // Get relative velocity vector
					const speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

					if (speed < 0) {
						break;
					}

					const impulse = (2 * speed) / (obj1.mass + obj2.mass);
					obj1.vVelocity.x -= impulse * obj2.mass * vCollisionNorm.x;
					obj1.vVelocity.y -= impulse * obj2.mass * vCollisionNorm.y;
					obj2.vVelocity.x += impulse * obj1.mass * vCollisionNorm.x;
					obj2.vVelocity.y += impulse * obj1.mass * vCollisionNorm.y;
				}
			}
		});
	}

	clearWorldState = () => this.gameObjects = [];
	addCircle = () => this.gameObjects.push(new Circle(this.context, new Vector2D(250, 200), new Vector2D(0, 20)));
	addRect = () => this.gameObjects.push(new Rectangle(this.context, new Vector2D(250, 200), new Vector2D(-50, 20)));
	
	spawnPlayer = () => {
		this.player = new Player(this.context, new Vector2D(250, 250));
		this.gameObjects.push(this.player);
	}
}