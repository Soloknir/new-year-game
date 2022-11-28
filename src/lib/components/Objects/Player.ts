import { Vector2D } from "../Vector";
import { G } from "../Constants";
import type { IGameObject } from "./Interfaces";

export default class Player implements IGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;
	width: number;
	height: number;
	friction: number;
	mass: number;
	horizontalMoveSpeed: number;
	jumpImpulse: number;
	
	isColliding = false;
	isAtFloor = false;
	isJumping = false;
	isMoveRight = false;
	isMoveLeft = false;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, velocity = new Vector2D()) {
		
		this.context = context
		this.vCoordinates = coords
		this.vVelocity = velocity

		this.width = 50;
		this.height = 50;
		this.friction = 0.1;
		this.mass = 100;
		this.horizontalMoveSpeed = 500;
		this.jumpImpulse = 500;
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
			this.vVelocity.y = this.jumpImpulse;
		}


		this.vCoordinates.x += horizontalSpeed * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;

	startJumping = () => this.isJumping = true;
	stopJumping = () => this.isJumping = false;
	startMoveRight = () => this.isMoveRight = true;
	stopMoveRight = () => this.isMoveRight = false;
	startMoveLeft = () => this.isMoveLeft = true;
	stopMoveLeft = () => this.isMoveLeft = false;
}