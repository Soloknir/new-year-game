import { Vector2D } from "../Vector";
import { G } from "../Constants";
import type { IGameObject } from "./Interfaces";

export default class Circle implements IGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;

	isColliding = false;
	isAtFloor = false;

	radius: number;
	friction: number;
	mass: number;

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, vVelocity = new Vector2D()) {
		this.context = context;
		this.vCoordinates = vCoordinates;
		this.vVelocity = vVelocity;

		this.radius = 15;
		this.friction = 0.005;
		this.mass = 30;
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

	getCenter = () => this.vCoordinates;

	getTop = () => this.radius;
	getBottom = () => -this.radius;
	getRight = () => this.radius;
	getLeft = () => -this.radius;
}