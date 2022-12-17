import { Vector2D } from "../Helpers/Vector";
import type { IRectangleSize } from "./Interfaces";
import { GameCollisionEvent, GameObject, type IIntaractive, type IRectangular } from "./GameObject";
import type AssetManager from "../Helpers/AssetManager";
import type GameDriver from "../GameDriver";
import type { StateManager } from "../Helpers/GameStateManager";
import type ControlsManager from "../Helpers/ControlsManager";
import { ControlsEvent } from "../Helpers/ControlsManager";

export default class PrizeBox extends GameObject implements IRectangular, IIntaractive {
	// Implements IRectangular interface
	width: number;
	height: number;
	active = false;
	isColliding = false;
	
	texture: HTMLImageElement;
	activeKeyTexture: HTMLImageElement;
	activationCallback: () => void;
	playerCollisionEvent?: GameCollisionEvent;

	constructor(vCoordinates: Vector2D, size: IRectangleSize, texture: HTMLImageElement, activeKeyTexture: HTMLImageElement, activationCallback: () => void) {
		super(vCoordinates, new Vector2D());

		this.width = size.width;
		this.height = size.height;
		this.texture = texture;
		this.activeKeyTexture = activeKeyTexture;
		this.activationCallback = activationCallback;
	}

	spawn = (gameDriver: GameDriver, _gameAssetManager: AssetManager, controlsManager: ControlsManager, gameStateManager: StateManager) => {
		gameDriver.spawnObject(this);
		if (gameStateManager.player) {
			this.playerCollisionEvent = new GameCollisionEvent(gameStateManager.player, false, this.callback);
			controlsManager.addEventListener('keyup', new ControlsEvent(['Space'], this.callback))
			this.addEventListener(this.playerCollisionEvent);
		}
	}

	draw = (context: CanvasRenderingContext2D, viewPortHeight: number, vViewCoordinates: Vector2D): void => {
		const viewCoords = this.vCoordinates.getViewCoordinates(viewPortHeight);
		if (this.active) {
			context.fillStyle = 'blue';
			context.fillRect(viewCoords.x - vViewCoordinates.x - 2, viewCoords.y - this.height + vViewCoordinates.y - 2, this.width + 4, this.height + 4);
			const vKeyCoordinates = new Vector2D(
				viewCoords.x - vViewCoordinates.x + this.width / 2 - 25,
				viewCoords.y + vViewCoordinates.y - 2 * this.height + 15,
				);
				
				context.drawImage(this.activeKeyTexture, vKeyCoordinates.x, vKeyCoordinates.y, 50, 30);
			}
			context.drawImage(this.texture, viewCoords.x - vViewCoordinates.x, viewCoords.y - this.height + vViewCoordinates.y, this.width, this.height);
	}

	checkEventListeners = () => {
		this.active = false;
		this.eventListeners.forEach(event => {
			if (event.check(this)) {
				event.once && this.removeEventListener(event.id);
				if (event.id === this.playerCollisionEvent?.id) {
					return this.active = true;
				}

				event.callback();
			}
		})
	}

	callback = () => {
		if (this.active) {
			this.activationCallback();
		}
	}

	getTop = () => this.height;
	getBottom = () => 0;
	getLeft = () => 0;
	getRight = () => this.width;
}