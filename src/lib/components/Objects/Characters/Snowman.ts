import type { Vector2D } from "../../Helpers/Vector";
import { type IRectangular, GameObject, type IColliding } from "../GameObject";

export default class Snowman extends GameObject implements IRectangular, IColliding {
	// Implements IRectangular interface
	width: number;
	height: number;

	//Implements IColliding interface
	isColliding = false;

	texture: HTMLImageElement;

	constructor(vCoordinates: Vector2D, vVelocity: Vector2D, texture: HTMLImageElement) {
		super(vCoordinates, vVelocity);

		this.texture = texture;
		this.width = 48;
		this.height = 64;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		context.drawImage(
			this.texture,
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