import GameObject, { G, Vector2D } from "./GameObject";

export default class Rectangle extends GameObject {
	width: number;
	height: number;
	mass: number;

	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, vVelocity = new Vector2D()) {
		super(context, vCoordinates, vVelocity);

		// Set default width and height
		this.width = 50;
		this.height = 50;
		this.mass = 100;
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}

	update = (timePassed: number): void => {
		// Move with set velocity
		this.vVelocity.y -= (G * this.mass);
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}
}