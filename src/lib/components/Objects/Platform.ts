import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import { GameObject, type IRectangular } from "./GameObject";

export interface ICompositeTexture { head: HTMLImageElement, body: HTMLImageElement }
export default class Platform extends GameObject implements IRectangular {
	// Implements IRectangular interface
	width: number;
	height: number;
	
	textures: { head: HTMLImageElement, body: HTMLImageElement };

	constructor(vCoordinates: Vector2D, size: IRectangleSize, textures: ICompositeTexture) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.textures = textures;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		let height = this.height;
		let row = 0;
		while (height > 0) {
			let width = this.width;
			let column = 0;

			while (width > 0) {
				context.drawImage(
					row === 0 ? this.textures.head : this.textures.body,
					0, 0,
					Math.min(128, width),
					Math.min(128, height),
					128 * column + viewCoords.x - vViewCoordinates.x,
					128 * row + viewCoords.y - this.height + vViewCoordinates.y,
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