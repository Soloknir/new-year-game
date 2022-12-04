import type { ICoordinates } from "./Objects/Interfaces";

export class Vector2D {
	x: number;
	y: number;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	getCopy = () => new Vector2D(this.x, this.y);
	getCoordsObject = () => ({ x: this.x, y: this.y });
	setByCoordsObject = ({ x, y }: ICoordinates) => {
		this.x = x;
		this.y = y;
		return this;
	};
	ceil = () => {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}

	divByNumber = (divider: number): Vector2D => new Vector2D(this.x / divider, this.y / divider);
	getDifference = ({ x, y }: Vector2D) => new Vector2D(this.x - x, this.y - y);
	getDistance = ({ x, y }: Vector2D): number => {
		const dx = this.x - x;
		const dy = this.y - y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	getViewCoordinates(height: number): Vector2D {
		return new Vector2D(this.x, height - this.y);
	}
}
