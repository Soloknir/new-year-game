import { detectObjectIntersect } from "./Helpers/Intersections";
import { isInstanceOfColliding, isInstanceOfSupportPhisics, type GameObject, type IColliding, type ISupportPhisics } from "./Objects/GameObject";
import type { IRectangleSize } from "./Objects/Interfaces";
import MovingPlatform from "./Objects/MovingPlatform";
import Platform from "./Objects/Platform";
import { Vector2D } from "./Vector";

export default class GameDriver {
	context: CanvasRenderingContext2D;
	vViewCoordinates = new Vector2D();
	viewPortWidth: number;
	viewPortHeight: number;

	gameObjects: GameObject[] = [];

	time = 0;
	secondsPassed = 0;
	oldTimeStamp = 0;

	constructor(context: CanvasRenderingContext2D, viewPortSize: IRectangleSize) {
		this.context = context;
		this.viewPortWidth = viewPortSize.width;
		this.viewPortHeight = viewPortSize.height;
	}

	start = () => window.requestAnimationFrame(this.gameLoop);

	gameLoop = (timeStamp: number) => {
		this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
		this.time += this.secondsPassed;
		this.oldTimeStamp = timeStamp;

		this.gameObjects.forEach(obj => obj.update(Math.min(this.secondsPassed, 0.1), this.vViewCoordinates));

		this.detectPlatformCollision();

		this.context.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);

		this.gameObjects.forEach(obj => obj.draw(this.context, this.viewPortHeight, this.vViewCoordinates));

		// this.context.fillStyle = 'rgba(0,0,0,0.7)';
		// this.context.fillRect(0, 0, this.viewPortWidth, this.viewPortHeight);
	
		this.drawFps(Math.round(1 / this.secondsPassed));

		window.requestAnimationFrame(this.gameLoop);
	}

	drawFps = (timeStamp: number) => {
		this.context.fillStyle = 'black';
		this.context.font = '20px Arial';
		this.context.textAlign = 'right';
		this.context.textBaseline = 'bottom';
		this.context.fillText(`fps: ${timeStamp}`, this.viewPortWidth - 20, 30);
	}

	detectPlatformCollision = (): void => {
		const platforms = this.gameObjects.filter(obj => obj instanceof Platform || obj instanceof MovingPlatform) as (Platform | MovingPlatform)[];
		const collidingObjects = this.gameObjects.filter((obj) => isInstanceOfColliding(obj)
			&& isInstanceOfSupportPhisics(obj)) as (GameObject & IColliding & ISupportPhisics)[];

		platforms.forEach((platform: Platform) => {
			collidingObjects.forEach((obj) => {
				if (detectObjectIntersect(platform, obj)) {
					if ((obj.vCoordinates.y + obj.getBottom() > platform.vCoordinates.y + platform.getBottom())
						&& (obj.vCoordinates.y + obj.getTop() > platform.vCoordinates.y + platform.getTop())
						&& (obj.vCoordinates.x + obj.getRight() > platform.vCoordinates.x + platform.getLeft())
						&& (obj.vCoordinates.x + obj.getLeft() < platform.vCoordinates.x + platform.getRight())) {
						obj.vCoordinates.y = platform.vCoordinates.y + platform.getTop() - obj.getBottom();
						obj.vVelocity.x = obj.vVelocity.x * (1 - obj.friction);
						obj.vVelocity.y = 1;
						obj.platform = platform;
					}

					if ((obj.vCoordinates.y + obj.getTop() < platform.vCoordinates.y + platform.getTop())
						&& (obj.vCoordinates.y + obj.getBottom() < platform.vCoordinates.y + platform.getBottom())
						&& (obj.vCoordinates.x + obj.getRight() > platform.vCoordinates.x + platform.getLeft())
						&& (obj.vCoordinates.x + obj.getLeft() < platform.vCoordinates.x + platform.getRight())) {
						obj.vCoordinates.y = platform.vCoordinates.y - obj.getTop();
						obj.vVelocity.y = -1;
					}

					if ((obj.vCoordinates.x + obj.getLeft() < platform.vCoordinates.x + platform.getLeft())
						&& (obj.vCoordinates.x + obj.getRight() > platform.vCoordinates.x + platform.getLeft())
						&& (obj.vCoordinates.y + obj.getTop() < platform.vCoordinates.y + platform.getTop())
						&& (obj.vCoordinates.y + obj.getBottom() >= platform.vCoordinates.y + platform.getBottom())
					) {
						obj.vCoordinates.x = platform.vCoordinates.x - obj.getRight();
						obj.vVelocity.x = -1;
					}

					if ((obj.vCoordinates.x + obj.getLeft() < platform.vCoordinates.x + platform.getRight())
						&& (obj.vCoordinates.x + obj.getRight() > platform.vCoordinates.x + platform.getRight())
						&& (obj.vCoordinates.y + obj.getTop() < platform.vCoordinates.y + platform.getTop())
						&& (obj.vCoordinates.y + obj.getBottom() >= platform.vCoordinates.y + platform.getBottom())
					) {
						obj.vCoordinates.x = platform.vCoordinates.x + platform.getRight();
						obj.vVelocity.x = 1;
					}
				}
			});
		})
	}


	spawnObject = (object: GameObject) => this.gameObjects.push(object);
	despawnObject = (object: GameObject) => this.gameObjects = this.gameObjects.filter(({ id }) => object.id !== id);
	worldReset = () => this.vViewCoordinates = new Vector2D();
}