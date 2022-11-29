import type { Vector2D } from "../Vector";
import type { IRectangleSize, IStaticGameObject } from "./Interfaces";

export default class StaticPlatform implements IStaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	width: number;
	height: number;
	textures: { head: HTMLImageElement, body: HTMLImageElement };

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, size: IRectangleSize, textures: { head: HTMLImageElement, body: HTMLImageElement }) {
		this.context = context;
		this.vCoordinates = vCoordinates;
		this.width = size.width;
		this.height = size.height;
		this.textures = textures;
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
					row === 0 ? this.textures.head : this.textures.body,
					0, 0,
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