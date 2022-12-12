import { Vector2D } from "../Helpers/Vector";
import { GameObject } from "./GameObject";
import type { IRectangleSize } from "./Interfaces";

export class Button extends GameObject {
	width: number;
	height: number;

	texture: HTMLImageElement;
	hover = false;

	constructor(vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		if (this.hover) {
			context.fillStyle = 'red';
			context.fillRect(viewCoords.x, viewCoords.y, this.width, this.height);
		} 
		context.drawImage(this.texture, viewCoords.x, viewCoords.y, this.width, this.height);
	}

	checkCursorColision = (cursorPosition: Vector2D, viewPortHeight: number): boolean => {
		const viewCoords = cursorPosition.getViewCoordinates(viewPortHeight);
		return (viewCoords.x > this.vCoordinates.x
			&& viewCoords.x < this.vCoordinates.x + this.getRight()
			&& viewCoords.y < this.vCoordinates.y
			&& viewCoords.y > this.vCoordinates.y - this.getTop()
		);
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}