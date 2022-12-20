import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import { GameObject, type IRectangular } from "./GameObject";

export default class Overlay extends GameObject implements IRectangular {
	// Implements IRectangular interface
	width: number;
	height: number;

	texture: HTMLImageElement;
	text: string;

	constructor(vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement, text: string) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
		this.text = text;
	}

	draw = (context: CanvasRenderingContext2D): void => {
		context.drawImage(this.texture, 0, 0, this.width, this.height);

		// Fill with gradient
		context.fillStyle = 'black';
		context.fillRect(0, this.height, this.width, -100);

		this.drawText(context);
		this.drawHelper(context);
	}

	drawText = (context: CanvasRenderingContext2D) => {
		context.fillStyle = 'white';
		context.font = '20px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'bottom';
		context.fillText(this.text, this.width / 2, this.height - 50);
	}

	drawHelper = (context: CanvasRenderingContext2D) => {
		context.fillStyle = '#ddd';
		context.font = '15px Arial';
		context.textAlign = 'right';
		context.textBaseline = 'bottom';
		context.fillText(`*нажми пробел, чтобы утереть нос этому злюке*`, this.width - 10, this.height - 10);
	}
}