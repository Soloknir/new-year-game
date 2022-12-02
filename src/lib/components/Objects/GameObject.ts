import { v4 as uuid } from 'uuid';
import { detectObjectIntersect } from '../Helpers/Intersections';
import type { Vector2D } from '../Vector';


interface IGameEvent {
	id: string;
	type: string;
	once: boolean;
	callback: () => void;
}


type EdgeSigh = 'gather' | 'less';
type EdgeAxis = 'x' | 'y';

export class GameEvent<T extends GameObject> implements IGameEvent {
	type = '';

	id: string;
	once: boolean;
	callback: () => void;

	constructor(once: boolean, callback: () => void) {
		this.id = uuid();
		this.once = once;
		this.callback = callback;
	}

	check = (_o: T) => false;
}

export class GameCollisionEvent extends GameEvent<GameObject & IColliding> {
	type = 'collision';
	object: GameObject;

	constructor(object: GameObject, once: boolean, callback: () => void) {
		super(once, callback);
		this.object = object;
	}

	check = (object: GameObject & IColliding) => detectObjectIntersect(object, this.object);
}

export class GameEdgeEvent extends GameEvent<GameObject & IColliding> {
	type = 'edge';

	sign: EdgeSigh;
	axis: EdgeAxis;
	value: number;

	constructor(sign: EdgeSigh, axis: EdgeAxis, value: number, once: boolean, callback: () => void) {
		super(once, callback);
		this.sign = sign;
		this.axis = axis;
		this.value = value;
	}

	check = (object: GameObject & IColliding) => {
		if (this.axis === 'x') {
			if (this.sign === 'gather') {
				return object.vCoordinates.x + object.getLeft() > this.value;
			} else {
				return object.vCoordinates.x + object.getRight() < this.value;
			}
		} else {
			if (this.sign === 'gather') {
				return object.vCoordinates.y + object.getBottom() > this.value;
			} else {
				return object.vCoordinates.y + object.getTop() < this.value;
			}
		}
	};
}

export interface IRound {
	radius: number;
}

export interface IRectangular {
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


export class GameObject {
	id: string;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;
	eventListeners: (GameCollisionEvent | GameEdgeEvent)[] = [];

	constructor(vCoordinates: Vector2D, vVelocity: Vector2D) {
		this.id = uuid();
		this.vCoordinates = vCoordinates;
		this.vVelocity = vVelocity;
	}

	draw = (_c: CanvasRenderingContext2D, _vh: number, _vc: Vector2D): void => { return; };
	update = (_t: number, _v: Vector2D): void => this.checkEventListeners();

	checkEventListeners = () => { return };

	addEventListener = (event: GameCollisionEvent | GameEdgeEvent) => this.eventListeners.push(event);
	removeEventListener = (eventId: string) => {
		const index = this.eventListeners.findIndex(({ id }) => id === eventId);
		index > -1 && this.eventListeners.splice(index, 1)
	};
}

export const isInstanceOfRectangular = (obj: GameObject) => 'width' in obj && 'height' in obj;
export const isInstanceOfRound = (obj: GameObject) => 'radius' in obj;
export const isInstanceOfColliding = (obj: GameObject) => 'isColliding' in obj;
export const isInstanceOfSupportPhisics = (obj: GameObject) => 'mass' in obj;

