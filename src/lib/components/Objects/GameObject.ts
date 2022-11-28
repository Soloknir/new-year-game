import StaticGameObject from "../StaticObjects/StaticGameObject";
import { Vector2D } from "../Vector";

export default class GameObject extends StaticGameObject {
	vVelocity: Vector2D;
	isColliding: boolean;
	isAtFloor: boolean;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, velocity = new Vector2D()) {
		super(context, coords);

		this.vVelocity = velocity;
		this.isAtFloor = false;
		this.isColliding = false;
	}
	
	update = (_: number): void => { /*virtual */ };
}
