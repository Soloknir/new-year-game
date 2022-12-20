import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import { GameObject, type IRectangular } from "./GameObject";

export default class Decoration extends GameObject implements IRectangular {
	// Implements IRectangular interface
	width: number;
	height: number;

	texture: HTMLImageElement;

	constructor(vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		context.drawImage(this.texture, viewCoords.x - vViewCoordinates.x, viewCoords.y - this.height + vViewCoordinates.y, this.width, this.height);
	}
}