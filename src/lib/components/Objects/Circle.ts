import GameObject, { G, Vector2D } from "./GameObject";

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

		// this.context.beginPath();
		// this.context.moveTo(this.x, this.y);
		// this.context.lineTo(this.x + this.vx, this.y + this.vy);
		// this.context.stroke();
	}

	update = (timePassed: number): void => {
		// Move with set velocity
		this.vVelocity.y += (G * this.mass) * timePassed;
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}
}