export class Vector2D {
	x: number;
	y: number;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	divByNumber = (divider: number): Vector2D => new Vector2D(this.x / divider, this.y / divider);

	getDifference = ({ x, y }: Vector2D) => new Vector2D(this.x - x, this.y - y);

	getDistance = ({ x, y }: Vector2D): number => {
		const [dx, dy] = [this.x - x, this.y - y];
		return Math.sqrt(dx * dx + dy * dy);
	}

	getViewCoordinates(height: number): Vector2D {
		return new Vector2D(this.x, height - this.y);
	}
}
