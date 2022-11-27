import Circle from "./Objects/Circle";
import GameObject, { Vector2D } from "./Objects/GameObject";
import { Player } from "./Objects/Player";
import Rectangle from "./Objects/Rectangle";

export default class GameDriver {
	context: CanvasRenderingContext2D;
	viewPortWidth: number;
	viewPortHeight: number;

	gameObjects: (Rectangle | Circle | Player)[] = [];
	player: Player | null = null;
	
	secondsPassed = 0;
	oldTimeStamp = 0;
	restitution = 0.1;

	constructor(context: CanvasRenderingContext2D, width: number, height: number) {
		this.context = context;

		this.viewPortWidth = width;
		this.viewPortHeight = height;

		window.requestAnimationFrame(this.gameLoop);
	}
	
	gameLoop = (timeStamp: number) => {
		this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
		this.oldTimeStamp = timeStamp;

		// Loop over all game objects
		this.gameObjects.forEach(obj => obj.update(this.secondsPassed));

		this.detectEdgeCollisions();
		this.detectCollisions();

		this.context.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);

		this.drawFps(Math.round(1 / this.secondsPassed));

		// Do the same to draw
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
			if (obj instanceof Circle) {
				if (vCoordinates.x < obj.radius) {
					obj.vVelocity.x = Math.abs(vVelocity.x) * this.restitution;
					obj.vCoordinates.x = obj.radius;
					obj.vVelocity.y = obj.vVelocity.y * (1 - this.restitution);
				} else if (vCoordinates.x > this.viewPortWidth - obj.radius) {
					obj.vVelocity.x = -Math.abs(vVelocity.x) * this.restitution;
					obj.vCoordinates.x = this.viewPortWidth - obj.radius;
					obj.vVelocity.y = obj.vVelocity.y * (1 - this.restitution);
				}
		
				// Check for bottom and top
				if (vCoordinates.y < obj.radius) {
					obj.vVelocity.y = Math.abs(vVelocity.y) * this.restitution;
					obj.vCoordinates.y = obj.radius;
					obj.vVelocity.x = obj.vVelocity.x * (1 - this.restitution);
				} else if (vCoordinates.y > this.viewPortHeight - obj.radius) {
					obj.vVelocity.y = -Math.abs(vVelocity.y) * this.restitution;
					obj.vCoordinates.y = this.viewPortHeight - obj.radius;
					obj.vVelocity.x = obj.vVelocity.x * (1 - this.restitution);
				}
			} else if (obj instanceof Rectangle || obj instanceof Player) {
				if (vCoordinates.x < 0) {
					obj.vVelocity.x = Math.abs(vVelocity.x) * this.restitution;
					obj.vCoordinates.x = 0;
					obj.vVelocity.y = obj.vVelocity.y * (1 - this.restitution);
				} else if (vCoordinates.x > this.viewPortWidth - obj.width) {
					obj.vVelocity.x = -Math.abs(vVelocity.x) * this.restitution;
					obj.vCoordinates.x = this.viewPortWidth - obj.width;
					obj.vVelocity.y = obj.vVelocity.y * (1 - this.restitution);
				}

				// Check for bottom and top
				if (vCoordinates.y < 0) {
					obj.vVelocity.y = Math.abs(vVelocity.y) * this.restitution;
					obj.vCoordinates.y = 0;
					obj.isAtFloor = true;
					obj.vVelocity.x = obj.vVelocity.x * (1 - this.restitution);
				} else if (vCoordinates.y > this.viewPortHeight - obj.height) {
					obj.vVelocity.y = -Math.abs(vVelocity.y) * this.restitution;
					obj.vCoordinates.y = this.viewPortHeight - obj.height;
					obj.vVelocity.x = obj.vVelocity.x * (1 - this.restitution);
				}
			}
		});
	}

	detectRectIntersect = (r1: Rectangle | Player, r2: Rectangle | Player): boolean => {
		// Check x and y for overlap
		if (r2.vCoordinates.x > r1.width + r1.vCoordinates.x
			|| r1.vCoordinates.x > r2.width + r2.vCoordinates.x
			|| r2.vCoordinates.y > r1.height + r1.vCoordinates.y
			|| r1.vCoordinates.y > r2.height + r2.vCoordinates.y
		) {
			return false;
		}

		return true;
	}

	detectRectCircleIntersect = (rect: Rectangle | Player, circle: Circle): boolean => {
		const { width, height } = rect;

		let testX = circle.vCoordinates.x, testY = circle.vCoordinates.y;

		if (circle.vCoordinates.x < rect.vCoordinates.x) testX = rect.vCoordinates.x;	// left edge
		else if (circle.vCoordinates.x > rect.vCoordinates.x + width) testX = rect.vCoordinates.x + width;		// right edge

		if (circle.vCoordinates.y < rect.vCoordinates.y) testY = rect.vCoordinates.y;	// top edge
		else if (circle.vCoordinates.y > rect.vCoordinates.y + height) testY = rect.vCoordinates.y + height;	// bottom edge

		const distX = circle.vCoordinates.x - testX;
		const distY = circle.vCoordinates.y - testY;
		const distance = Math.sqrt((distX * distX) + (distY * distY));

		return distance <= circle.radius;
	}

	detectCircleIntersect = (c1: Circle, c2: Circle): boolean => {
		// Calculate the distance between the two circles
		const squareDistance = c1.vCoordinates.getDistance(c2.vCoordinates);

		// When the distance is smaller or equal to the sum
		// of the two radius, the circles touch or overlap
		return squareDistance <= (c1.radius + c2.radius);
	}

	detectObjectIntersect = <T extends GameObject>(o1: T, o2: T): boolean => {
		if (o1 instanceof Circle) {
			if (o2 instanceof Circle) {
				return this.detectCircleIntersect(o1, o2)
			}
			if (o2 instanceof Rectangle || o2 instanceof Player) {
				return this.detectRectCircleIntersect(o2, o1)
			}
		}

		if (o1 instanceof Rectangle || o1 instanceof Player) {
			if (o2 instanceof Rectangle || o2 instanceof Player) {
				return this.detectRectIntersect(o1, o2);
			}
			if (o2 instanceof Circle) {
				return this.detectRectCircleIntersect(o1, o2);
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

	addCircle = () => {
		this.gameObjects.push(new Circle(this.context, new Vector2D(150, 100), new Vector2D(50, 20)));
	}

	addRect = () => {
		this.gameObjects.push(new Rectangle(this.context, new Vector2D(250, 100), new Vector2D(-50, 20)));
	}

	spawnPlayer = () => {
		this.player = new Player(this.context, new Vector2D(250, 250));
		this.gameObjects.push(this.player);
	}

	clearWorldState = () => {
		this.gameObjects = [];
	}

	easeInOutQuint = (t: number, b: number, c: number, d: number) => {
		if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
		return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
	}

	easeLinear = (t: number, b: number, c: number, d: number) => {
		return (c * t) / d + b;
	}
}