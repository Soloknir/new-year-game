import { Vector2D } from "../Vector";
import { G } from "../Constants";
import type { IGameObject } from "./Interfaces";

export default class Player implements IGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;
	sprite: HTMLImageElement;
	width: number;
	height: number;
	friction: number;
	mass: number;
	horizontalMoveSpeed: number;
	jumpImpulse: number;

	time = 0;
	column = 0;
	row = 2
	
	isColliding = false;
	isAtFloor = false;
	isJumping = false;
	isMoveRight = false;
	isMoveLeft = false;

	constructor(context: CanvasRenderingContext2D, coords: Vector2D, sprite: HTMLImageElement, velocity = new Vector2D()) {
		this.context = context
		this.vCoordinates = coords
		this.vVelocity = velocity
		this.sprite = sprite;

		this.width = 50;
		this.height = 50;
		this.friction = 0.1;
		this.mass = 100;
		this.horizontalMoveSpeed = 500;
		this.jumpImpulse = 500;
	}


	draw = (viewPortHeight: number): void => {
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
		this.context.drawImage(this.sprite, this.column * frameWidth + frameWidth / 4, this.row * frameHeight, frameWidth - frameWidth / 4, frameHeight - 2, viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}

	update = (timePassed: number): void => {
		this.time += timePassed;
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
	getRight = () => this.width - 16;

	startJumping = () => this.isJumping = true;
	stopJumping = () => this.isJumping = false;
	startMoveRight = () => this.isMoveRight = true;
	stopMoveRight = () => this.isMoveRight = false;
	startMoveLeft = () => this.isMoveLeft = true;
	stopMoveLeft = () => this.isMoveLeft = false;
}