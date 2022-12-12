import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import { GameObject, type IRectangular } from "./GameObject";

export default class Overlay extends GameObject implements IRectangular {
	// Implements IRectangular interface
	width: number;
	height: number;

	texture: HTMLImageElement;

	constructor(vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
	}

	draw = (context: CanvasRenderingContext2D): void => {
		context.drawImage(this.texture, 0, 0, 1920, 1080, 0, 0, this.width, this.height);

		const gradient = context.createLinearGradient(0, 100, 0, 0);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

		// Fill with gradient
		context.fillStyle = gradient;
		context.fillRect(0, this.height, this.width, -100);

		this.drawText(context);
		this.drawHelper(context);
	}

	drawText = (context: CanvasRenderingContext2D) => {
		context.fillStyle = 'white';
		context.font = '20px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'bottom';
		context.fillText(`Нужно помочь деду морозу! Погнали выполнять квест :D`, this.width / 2, this.height - 50);
	}

	drawHelper = (context: CanvasRenderingContext2D) => {
		context.fillStyle = '#ddd';
		context.font = '15px Arial';
		context.textAlign = 'right';
		context.textBaseline = 'bottom';
		context.fillText(`Для продолжения нажмите пробел`, this.width - 10, this.height - 10);
	}
}