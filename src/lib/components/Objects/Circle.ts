import { Vector2D } from "../Vector";
import { G } from "../Constants";
import GameObject from "./GameObject";

export default class Circle extends GameObject {
	radius: number;
	mass: number;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, velocity = new Vector2D()) {
		super(context, coords, velocity);

		this.radius = 15;
		this.mass = Math.random() * 30;
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		// Draw a simple circle
		this.context.beginPath();
		this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		this.context.arc(viewCoords.x, viewCoords.y, this.radius, 0, 2 * Math.PI);
		this.context.fill();
	}

	update = (timePassed: number): void => {
		// Move with set velocity
		this.vVelocity.y -= (G * this.mass) * timePassed;
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}
}