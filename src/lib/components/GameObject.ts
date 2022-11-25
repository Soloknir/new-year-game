
export default class GameObject {
	context: CanvasRenderingContext2D;
	x: number;
	y: number;
	vx: number;
	vy: number;
	isColliding: boolean;

	constructor(context: CanvasRenderingContext2D, x: number, y: number, vx = 0, vy = 0) {
		this.context = context;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;

		this.isColliding = false;
	}

	draw(): void { /*virtual */ };
	update(_: number): void { /*virtual */ };
}
