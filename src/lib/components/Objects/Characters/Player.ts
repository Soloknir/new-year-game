import { Vector2D } from "../../Vector";
import { G } from "../../Constants";
import { GameObject, type IRectangular, type ISupportPhisics } from "../GameObject";

export default class Player extends GameObject implements IRectangular, ISupportPhisics {
	// Implements IRectangular interface
	width: number;
	height: number;

	// Implements ISupportPhisics interface
	friction: number;
	mass: number;
	isColliding = false;
	isAtFloor = false;

	sprite: HTMLImageElement;
	time = 0;
	column = 0;
	row = 2
	horizontalMoveSpeed: number;
	jumpImpulse: number;
	isJumping = false;
	isMoveRight = false;
	isMoveLeft = false;

	constructor(vCoordinates: Vector2D, sprite: HTMLImageElement) {
		super(vCoordinates, new Vector2D());
		this.sprite = sprite;

		this.width = 50;
		this.height = 50;
		this.friction = 0.1;
		this.mass = 100;
		this.horizontalMoveSpeed = 500;
		this.jumpImpulse = 500;
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);

		// this.context.fillStyle = 'grey';
		// this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.getRight(), this.height);

		if (this.isMoveRight) {
			this.column = Math.round(this.time * 10 % 8);
			this.row = 11;
		} else if (this.isMoveLeft) {
			this.column = Math.round(this.time * 10 % 8);
			this.row = 9;
		} else {
			this.row = 2;
			this.column = 0;
		}

		const frameWidth = 64;
		const frameHeight = 64;
		context.drawImage(
			this.sprite,
			this.column * frameWidth + frameWidth / 4,
			this.row * frameHeight,
			frameWidth - frameWidth / 4,
			frameHeight - 2,
			viewCoords.x - vViewCoordinates.x,
			viewCoords.y - this.height,
			this.width,
			this.height
		);
	}

	update = (timePassed: number, vViewCoordinates: Vector2D): void => {
		this.time += timePassed;
		this.vVelocity.y -= (G * this.mass) * timePassed;
		this.vVelocity.x = 0;

		if (this.isMoveRight) {
			this.vVelocity.x += this.horizontalMoveSpeed;
		}
		if (this.isMoveLeft) {
			this.vVelocity.x -= this.horizontalMoveSpeed;
		}

		if (this.isJumping && this.isAtFloor) {
			this.isAtFloor = false;
			this.vVelocity.y = this.jumpImpulse;
		}

		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
		vViewCoordinates.x = this.vCoordinates.x - 250;
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width - 16;

	startJumping = () => this.isJumping = true;
	stopJumping = () => this.isJumping = false;
	startMoveRight = () => this.isMoveRight = true;
	stopMoveRight = () => this.isMoveRight = false;
	startMoveLeft = () => this.isMoveLeft = true;
	stopMoveLeft = () => this.isMoveLeft = false;
}