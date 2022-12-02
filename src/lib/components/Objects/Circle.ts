import { Vector2D } from "../Vector";
import { G } from "../Constants";
import { GameObject, type IColliding, type ISupportPhisics } from "./GameObject";


export default class Circle extends GameObject implements IColliding, ISupportPhisics {
	isColliding = false;
	isAtFloor = false;

	radius: number;
	friction: number;
	mass: number;

	constructor(vCoordinates: Vector2D, vVelocity = new Vector2D()) {
		super(vCoordinates, vVelocity);
		this.radius = 15;
		this.friction = 0.005;
		this.mass = 30;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		// Draw a simple circle
		context.beginPath();
		context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		context.arc(viewCoords.x, viewCoords.y, this.radius, 0, 2 * Math.PI);
		context.fill();
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