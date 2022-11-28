import { Vector2D } from "../Vector";
import { G } from "../Constants";
import GameObject from "./GameObject";

export default class Player extends GameObject {
	width: number;
	height: number;
	horizontalMoveSpeed: number;
	mass: number;

	isJumping = false;
	isMoveRight = false;
	isMoveLeft = false;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, velocity = new Vector2D()) {
		super(context, coords, velocity);

		this.width = 50;
		this.height = 50;
		this.horizontalMoveSpeed = 250;
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

		let horizontalSpeed = this.vVelocity.x;
		if (this.isMoveRight) {
			horizontalSpeed += this.horizontalMoveSpeed;
		}
		if (this.isMoveLeft) {
			horizontalSpeed -= this.horizontalMoveSpeed;
		}

		if (this.isJumping && this.isAtFloor) {
			this.isAtFloor = false;
			this.vVelocity.y = 500;
		}


		this.vCoordinates.x += horizontalSpeed * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}

	startJumping = () => {
		this.isJumping = true;
	}

	stopJumping = () => {
		this.isJumping = false;
	}

	startMoveRight = () => {
		this.isMoveRight = true;
	}

	startMoveLeft = () => {
		this.isMoveLeft = true;
	}

	stopMoveRight = () => {
		this.isMoveRight = false;
	}

	stopMoveLeft = () => {
		this.isMoveLeft = false;
	}
}