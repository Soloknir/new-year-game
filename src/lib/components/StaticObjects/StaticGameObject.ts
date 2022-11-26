import type { Vector2D } from "../Objects/GameObject";

export default class StaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D) {
		this.context = context;
		this.vCoordinates = coords;
	}

	draw = (): void => { /*virtual */ };
}
