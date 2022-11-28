import type { Vector2D } from "../Vector";

interface IStaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;

	draw: (_: number) => void;
	getTop: () => number;
	getBottom: () => number;
	getLeft: () => number;
	getRight: () => number;
}

interface IGameObject extends IStaticGameObject {
	vVelocity: Vector2D;
	mass: number;
	friction: number;
	isColliding: boolean;
	isAtFloor: boolean;

	update: (_: number) => void;
}

export type {
	IStaticGameObject,
	IGameObject
}
