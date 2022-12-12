import { Vector2D } from "../../Helpers/Vector";
import { G } from "../../Constants";
import { GameObject, type IColliding, type IRectangular, type ISupportPhisics } from "../GameObject";

export default class Player extends GameObject implements IRectangular, IColliding, ISupportPhisics {
	// Implements IRectangular interface
	width: number;
	height: number;

	// Implements ISupportPhisics interface
	friction: number;
	mass: number;
	platform: GameObject | null = null;

	// Implements IColliding interface
	isColliding = false;

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

		this.width = 64;
		this.height = 64;
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
			this.column * frameWidth,
			this.row * frameHeight,
			frameWidth,
			frameHeight - 2,
			viewCoords.x - vViewCoordinates.x,
			viewCoords.y - this.height + vViewCoordinates.y,
			this.width + frameWidth / 4,
			this.height
		);
	}

	update = (timePassed: number, vViewCoordinates: Vector2D): void => {
		this.checkEventListeners();

		this.time += timePassed;
		this.vVelocity.y -= (G * this.mass) * timePassed;
		this.vVelocity.x = 0;

		if (this.isMoveRight) {
			this.vVelocity.x += this.horizontalMoveSpeed;
		}
		if (this.isMoveLeft) {
			this.vVelocity.x -= this.horizontalMoveSpeed;
		}
		if (this.platform) {
			this.vVelocity.x += this.platform.vVelocity.x ;
		}

		if (this.isJumping && this.platform) {
			this.platform = null;
			this.vVelocity.y = this.jumpImpulse;
		}

		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
		vViewCoordinates.x = this.vCoordinates.x - 250;
		vViewCoordinates.y = this.vCoordinates.y - 250;
	}

	checkEventListeners = () => {
		this.eventListeners.forEach(event => {
			if (event.check(this)) {
				event.once && this.removeEventListener(event.id);
				event.callback();
			}
		})
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