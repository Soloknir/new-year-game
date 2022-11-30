import type { Vector2D } from "../../Vector";
import { type IRectangular, GameObject } from "../GameObject";
import type { IRectangleSize } from "../Interfaces";

export default class Santa extends GameObject implements IRectangular {
	// Implements IRectangular interface
	width: number;
	height: number;
	
	sprite: HTMLImageElement;

	constructor(vCoordinates: Vector2D, vVelocity: Vector2D, sprite: HTMLImageElement, size: IRectangleSize) {
		super(vCoordinates, vVelocity);

		this.sprite = sprite;
		this.width = size.width;
		this.height = size.height;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		const frameWidth = 64;
		const frameHeight = 64;
		context.drawImage(
			this.sprite,
			frameWidth,
			2 * frameHeight,
			frameWidth - frameWidth / 4,
			frameHeight - 2,
			viewCoords.x - vViewCoordinates.x,
			viewCoords.y - this.height,
			this.width,
			this.height
		);
	}

	update = () => null;
}