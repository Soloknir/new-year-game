import type { Vector2D } from "../Vector";
import StaticGameObject from "./StaticGameObject";

export default class StaticPlatform extends StaticGameObject {
	width: number;
	height: number;
	isFloor: boolean;
	color = 'green';

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, isFloor = false) {
		super(context, vCoordinates);

		// Set default width and height
		this.width = 300;
		this.height = 25;
		this.isFloor = isFloor;
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		this.context.fillStyle = this.color;
		this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}
}