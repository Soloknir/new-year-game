import { Vector2D } from "../Vector";
import { G } from "../Constants";
import type { IGameObject } from "./Interfaces";

export default class Rectangle implements IGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;
	isColliding = false;
	isAtFloor = false;

	width: number;
	height: number;
	friction: number;
	mass: number;
	
	constructor(context: CanvasRenderingContext2D, vCoordinates: Vector2D, vVelocity = new Vector2D()) {
		this.context = context
		this.vCoordinates = vCoordinates;
		this.vVelocity = vVelocity;
		
		// Set default width and height
		this.width = 50;
		this.height = 50;
		this.friction = 0.1;
		this.mass = 50;
	}


	draw = (viewPortHeight: number): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		this.context.fillRect(viewCoords.x, viewCoords.y - this.height, this.width, this.height);
	}

	update = (timePassed: number): void => {
		// Move with set velocity
		this.vVelocity.y -= (G * this.mass) * timePassed;
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
	}

	getCenter = () => {
		const vMid = this.vCoordinates.getCopy();
		vMid.x += this.width / 2;
		vMid.y += this.height / 2;
		return vMid;
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}