import type { Vector2D } from "../../Helpers/Vector";
import { type IRectangular, GameObject, type IColliding } from "../GameObject";

export default class Santa extends GameObject implements IRectangular, IColliding {
	// Implements IRectangular interface
	width: number;
	height: number;

	//Implements IColliding interface
	isColliding = false;

	sprite: HTMLImageElement;

	constructor(vCoordinates: Vector2D, vVelocity: Vector2D, sprite: HTMLImageElement) {
		super(vCoordinates, vVelocity);

		this.sprite = sprite;
		this.width = 64;
		this.height = 64;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		if (this.isColliding) {
			context.fillStyle = 'grey';
			context.fillRect(viewCoords.x - vViewCoordinates.x, viewCoords.y - this.height, this.getRight(), this.height);
		}

		const frameWidth = 64;
		const frameHeight = 64;
		context.drawImage(
			this.sprite,
			frameWidth,
			2 * frameHeight,
			frameWidth - frameWidth / 4,
			frameHeight - 2,
			viewCoords.x - vViewCoordinates.x,
			viewCoords.y - this.height + vViewCoordinates.y,
			this.width,
			this.height
		);
	}

	update = () => null;

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}