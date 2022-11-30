import type { Vector2D } from "../Vector";

interface IRectangleSize {
	width: number;
	height: number;
}

interface IStaticGameObject {
	context: CanvasRenderingContext2D;
	vCoordinates: Vector2D;

	draw: (_: number, _v: Vector2D) => void;
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

	update: (_: number, _v: Vector2D) => void;
	getCenter: () => Vector2D;
}

export type {
	IRectangleSize,
	IStaticGameObject,
	IGameObject
}
