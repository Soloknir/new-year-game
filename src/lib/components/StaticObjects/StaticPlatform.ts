import type { Vector2D } from "../Vector";
import StaticGameObject from "./StaticGameObject";

export default class StaticPlatform extends StaticGameObject {
	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D) {
		super(context, vCoordinates);
	}

}