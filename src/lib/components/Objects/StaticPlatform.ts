import type { Vector2D } from "../Vector";
import type { IRectangleSize, IStaticGameObject } from "./Interfaces";

export default class StaticPlatform implements IStaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	width: number;
	height: number;
	texture: HTMLImageElement;

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement) {
		this.context = context;
		this.vCoordinates = vCoordinates;
		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		let height = this.height;
		let row = 0;
		while (height > 0) {
			let width = this.width;
			let column = 0;

			while (width > 0) {
				this.context.drawImage(
					this.texture, 0, 0,
					Math.min(128, width),
					Math.min(128, height),
					128 * column + viewCoords.x,
					128 * row + viewCoords.y - this.height,
					Math.min(128, width),
					Math.min(128, height)
				);

				width -= 128;
				column++;
			}

			height -= 128;
			row++;
		}

	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}