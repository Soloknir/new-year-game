import { Vector2D } from "../Vector";
import type { IRectangleSize } from "./Interfaces";
import Platform, { type IPlatformTexture } from "./Platform";


export default class MovingPlatform extends Platform {
	vSpawnCoordinates: Vector2D;
	vTargetCoordinates: Vector2D;
	duration: number;
	lastDistance: number;

	moveForward = true;

	constructor(vCoordinates: Vector2D, vTargetCoordinates: Vector2D, duration: number, size: IRectangleSize, textures: IPlatformTexture) {
		super(vCoordinates, size, textures);

		this.vSpawnCoordinates = vCoordinates.getCopy();
		this.vTargetCoordinates = vTargetCoordinates;
		this.duration = duration;
		this.lastDistance = vTargetCoordinates.getDistance(this.vSpawnCoordinates);
		this.vVelocity = this.getVelocity();
		
	}

	update = (timePassed: number) => {
		// Move with set velocity
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;
		const distance = this.vTargetCoordinates.getDistance(this.vCoordinates)
		if (this.lastDistance < distance) {
			// this.vVelocity = new Vector2D();
			this.vCoordinates = this.vSpawnCoordinates.getCopy();
			this.lastDistance = this.vTargetCoordinates.getDistance(this.vSpawnCoordinates);
		} else {
			this.lastDistance = distance;
		}
	}

	getVelocity = (): Vector2D => {
		const vDifference = this.vTargetCoordinates.getDifference(this.vCoordinates);
		if (vDifference.x === 0 || vDifference.y === 0) {
			return (vDifference.x !== 0)
				? new Vector2D(vDifference.x / this.duration, 0)
				: (vDifference.y !== 0)
					? new Vector2D(0, vDifference.y / this.duration)
					: new Vector2D();
		}

		return vDifference.divByNumber(this.duration);
	}
}