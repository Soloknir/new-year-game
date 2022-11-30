import { v4 as uuid } from 'uuid';
import type { Vector2D } from '../Vector';

interface IGameObject {
	id: string;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;

	draw: (_c: CanvasRenderingContext2D, _vh: number, _vc: Vector2D ) => void;
	update: (_t: number, _v: Vector2D) => void;
}

export interface IRound {
	radius: number;
}

export interface IRectangular  {
	width: number;
	height: number;
}

export interface IColliding {
	isColliding: boolean;

	getTop: () => number;
	getBottom: () => number;
	getLeft: () => number;
	getRight: () => number;
}

export interface ISupportPhisics {
	friction: number;
	mass: number;
	isAtFloor: boolean;
}

export class GameObject implements IGameObject {
	id: string;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;

	constructor(vCoordinates: Vector2D, vVelocity: Vector2D) {
		this.id = uuid();
		this.vCoordinates = vCoordinates;
		this.vVelocity = vVelocity;
	}

	draw = (_c: CanvasRenderingContext2D, _vh: number, _vc: Vector2D): void => { return; };
	update = (_t: number, _v: Vector2D): void => { return; }
}

export const isInstanceOfRectangular = (obj: GameObject) => 'width' in obj && 'height' in obj;
export const isInstanceOfRound = (obj: GameObject) => 'radius' in obj;
export const isInstanceOfColliding = (obj: GameObject) => 'isColliding' in obj;
export const isInstanceOfSupportPhisics = (obj: GameObject) => 'mass' in obj;

