import GameObject from "./GameObject";
const g = 9.81;

export default class Circle extends GameObject {
	radius: number;
	mass: number;

	constructor(context: CanvasRenderingContext2D, x: number, y: number, vx = 0, vy = 0) {
		super(context, x, y, vx, vy);

		// Set default width and height
		this.radius = Math.random() * 20 + 10;
		this.mass = this.radius / 3;
	}

	draw(): void {
		if (!this.context) return;

		// Draw a simple circle
		this.context.beginPath();
		this.context.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
		this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		this.context.fill();

		this.context.beginPath();
		this.context.moveTo(this.x, this.y);
		this.context.lineTo(this.x + this.vx, this.y + this.vy);
		this.context.stroke();
	}

	update(timePassed: number): void {
		// Move with set velocity
		this.vy += (g * this.mass) * timePassed;
		this.x += this.vx * timePassed;
		this.y += this.vy * timePassed;
	}
}