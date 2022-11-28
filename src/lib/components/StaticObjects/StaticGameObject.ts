import type { Vector2D } from "../Vector";

export default class StaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D) {
		this.context = context;
		this.vCoordinates = coords;
	}

	draw = (_: number): void => { /*virtual */ };
}
