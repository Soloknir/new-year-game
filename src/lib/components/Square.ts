import GameObject from "./GameObject";

export default class Square extends GameObject {
	width: number;
	height: number;

	constructor(context: CanvasRenderingContext2D, x: number, y: number, vx = 0, vy = 0) {
		super(context, x, y, vx, vy);

		// Set default width and height
		this.width = 50;
		this.height = 50;
	}

	draw(): void{
		// Draw a simple square
		this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		this.context.fillRect(this.x, this.y, this.width, this.height);
	}

	update(timePassed: number): void {
		// Move with set velocity
		this.x += this.vx * timePassed;
		this.y += this.vy * timePassed;
	}
}