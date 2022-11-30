import type { Vector2D } from "../Vector";


interface ICoordinates {
	x: number;
	y: number;
}
interface IRectangleSize {
	width: number;
	height: number;
}

interface IGameObject {
	id: string;
	vCoordinates: Vector2D;
	vVelocity: Vector2D;
	mass: number;
	friction: number;
	isColliding: boolean;
	isAtFloor: boolean;

	draw: (_c: CanvasRenderingContext2D, _: number, _v: Vector2D) => void;
	update: (_: number, _v: Vector2D) => void;

	getCenter: () => Vector2D;
	getTop: () => number;
	getBottom: () => number;
	getLeft: () => number;
	getRight: () => number;
}

export type {
	ICoordinates,
	IRectangleSize,
	IGameObject
}
