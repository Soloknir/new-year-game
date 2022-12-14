import { detectObjectIntersect } from "./Helpers/Intersections";
import { isInstanceOfColliding, isInstanceOfSupportPhisics, type GameObject, type IColliding, type ISupportPhisics } from "./Objects/GameObject";
import type { IRectangleSize } from "./Objects/Interfaces";
import MovingPlatform from "./Objects/MovingPlatform";
import type Overlay from "./Objects/Overlay";
import Platform from "./Objects/Platform";
import { Vector2D } from "./Helpers/Vector";

export default class GameDriver {
	context: CanvasRenderingContext2D;
	rAF: number | null = null;
	vViewCoordinates = new Vector2D();
	viewPortWidth: number;
	viewPortHeight: number;

	gameObjects: GameObject[] = [];
	overlay: Overlay | null = null;
	backgroundImage: HTMLImageElement | null = null;

	time = 0;
	secondsPassed = 0;
	oldTimeStamp = 0;

	constructor(context: CanvasRenderingContext2D, viewPortSize: IRectangleSize) {
		this.context = context;
		this.viewPortWidth = viewPortSize.width;
		this.viewPortHeight = viewPortSize.height;
	}

	start = () => this.rAF = window.requestAnimationFrame(this.loop);
	pause = () => this.rAF && window.cancelAnimationFrame(this.rAF);

	loop = (timeStamp: number) => {
		this.rAF = requestAnimationFrame(this.loop);
		if (!this.overlay) {

			this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
			this.time += this.secondsPassed;
			this.oldTimeStamp = timeStamp;
	
			this.gameObjects.forEach(obj => obj.update(Math.min(this.secondsPassed, 0.1), this.vViewCoordinates));
	
			this.detectPlatformCollision();
	
			if (this.backgroundImage) {
				this.context.drawImage(this.backgroundImage, 0, 0, this.viewPortWidth, this.viewPortHeight);
			}
	
			this.gameObjects.sort((a, b) => a.depth > b.depth ? 1 : a.depth < b.depth ? -1: 0)
				.forEach(obj => obj.draw(this.context, this.viewPortHeight, this.vViewCoordinates));
		} else {
			this.overlay.draw(this.context);
		}
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
						obj.vCoordinates.x = platform.vCoordinates.x + platform.getRight() - obj.getLeft();
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