import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import Platform, { type ICompositeTexture } from "./Platform";

type BehaviorRepeatType = 'none' | 'fromStart' | 'fromEnd'

export interface IMovingBehavior {
	vTarget: Vector2D;
	duration: number;
	repeat: BehaviorRepeatType;
	delay?: number;
	shift?: number;
}

export default class MovingPlatform extends Platform {
	vSpawn: Vector2D;
	lastDistance: number;
	behavior: IMovingBehavior;

	constructor(vCoordinates: Vector2D, behavior: IMovingBehavior, size: IRectangleSize, textures: ICompositeTexture) {
		super(vCoordinates, size, textures);

		this.vSpawn = vCoordinates.getCopy();
		this.behavior = behavior;
		this.lastDistance = behavior.vTarget.getDistance(this.vSpawn);
		this.vVelocity = this.getVelocity();
		if (this.behavior.shift) {
			const target = this.behavior.vTarget.getDifference(this.vCoordinates);
			this.vCoordinates.x += this.behavior.shift * target.x;
			this.vCoordinates.x += this.behavior.shift * target.y;
		}
	}

	update = (timePassed: number) => {
		// Move with set velocity
		this.vCoordinates.x += this.vVelocity.x * timePassed;
		this.vCoordinates.y += this.vVelocity.y * timePassed;

		const distance = this.behavior.vTarget.getDistance(this.vCoordinates)
		if (this.lastDistance < distance) {
			this.getMoveEndStrategy()
		} else {
			this.lastDistance = distance;
		}
	}

	getVelocity = (): Vector2D => {
		const vDifference = this.behavior.vTarget.getDifference(this.vCoordinates);
		if (vDifference.x === 0 || vDifference.y === 0) {
			return (vDifference.x !== 0)
				? new Vector2D(vDifference.x / this.behavior.duration, 0)
				: (vDifference.y !== 0)
					? new Vector2D(0, vDifference.y / this.behavior.duration)
					: new Vector2D();
		}

		return vDifference.divByNumber(this.behavior.duration);
	}

	getMoveEndStrategy = () => {
		switch (this.behavior.repeat) {
			case 'fromStart': {
				this.vCoordinates = this.vSpawn.getCopy();
				this.lastDistance = this.behavior.vTarget.getDistance(this.vSpawn);
				return;
			}

			case 'fromEnd': {
				const buffer = this.vSpawn.getCopy();
				this.vSpawn = this.behavior.vTarget.getCopy();
				this.behavior.vTarget = buffer;

				this.vCoordinates = this.vSpawn.getCopy();
				this.vVelocity = this.getVelocity();
				this.lastDistance = this.behavior.vTarget.getDistance(this.vSpawn);
				return;
			}

			default:
				this.vVelocity = new Vector2D();
		}
	}
}