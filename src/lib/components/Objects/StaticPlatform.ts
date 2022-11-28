import type { Vector2D } from "../Vector";
import type { IStaticGameObject } from "./Interfaces";

export default class StaticPlatform implements IStaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	width: number;
	height: number;
	color: string | CanvasGradient | CanvasPattern;

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D) {
		this.context = context;
		this.vCoordinates = vCoordinates;
		this.width = 300;
		this.height = 25;
		this.color = 'green';
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		this.context.fillStyle = this.color;
		this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}