import GameObject, { G, Vector2D } from "./GameObject";

export class Player extends GameObject {
	width: number;
	height: number;
	mass: number;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, velocity = new Vector2D()) {
		super(context, coords, velocity);

		this.width = 50;
		this.height = 50;
		this.mass = 100;
	}

	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		// Draw a simple square
		this.context.fillStyle = 'red';
		this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}

	update = (timePassed: number): void => {
		this.vVelocity.y -= (G * this.mass) * timePassed;
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}

	jump = () => {
		if (this.isAtFloor) {
			this.isAtFloor = false;
			this.vVelocity.y = 500;
		}
	}

	moveRight = () => {
		this.vVelocity.x = 250;
	}

	moveLeft = () => {
		this.vVelocity.x = -250;
	}
}