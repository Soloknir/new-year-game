import AssetManager from "./Helpers/AssetManager";
import type { IUseAssets } from "./Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "./Helpers/ControlsManager";
import { Vector2D } from "./Helpers/Vector";
import { Button } from "./Objects/Button";
import type { StateManager } from "./Helpers/GameStateManager";

export class MainMenu implements IUseControls, IUseAssets {
	rAF: number | null = null;
	context: CanvasRenderingContext2D;
	canvasBoundingRect: DOMRect;
	closeHandler: (_action: string) => void;

	opened = false;
	gameStateManager: StateManager;
	assetsManager = AssetManager.Instance;
	controlsManager = ControlsManager.Instance;
	controlsEvents: { action: string; event: ControlsEvent; }[] = [];

	buttons: Button[] = [];
	isAssetsLoaded = false;
	lastMousePosition = new Vector2D();
	afterLoadCollback?: () => void;
		
	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect, gameStateManager: StateManager, closeHandler: (_action: string) => void) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect;
		this.closeHandler = closeHandler;
		this.gameStateManager = gameStateManager;
		this.init();
	}

	init = async () => {
		this.initControlsListeners();
		this.createButtons();
		this.isAssetsLoaded = true;
		this.afterLoadCollback && this.afterLoadCollback();
	}



	createButtons = () => {
		this.buttons = [
			new Button(new Vector2D(860, 370), { width: 150, height: 50 }, {
				base: this.assetsManager.get('button.start'),
				hover: this.assetsManager.get('button.start-active')
			}),
			new Button(new Vector2D(860, 370), { width: 150, height: 50 }, {
				base: this.assetsManager.get('button.continue'),
				hover: this.assetsManager.get('button.continue-active')
			}),
			new Button(new Vector2D(860, 300), { width: 150, height: 50 }, {
				base: this.assetsManager.get('button.control'),
				hover: this.assetsManager.get('button.control-active')
			})
		];
	}

	getButtons = (): Button[] => {
		return !this.gameStateManager.isGameStarted
			? [this.buttons[0], this.buttons[2]]
			: [this.buttons[1], this.buttons[2]];
	}

	open = () => {
		if (!this.opened) {
			if (this.isAssetsLoaded) {
				this.opened = true;
				this.rAF = window.requestAnimationFrame(this.loop);
				this.startListeningControls();
			} else {
				this.afterLoadCollback = this.open; 
			}
		}
	}

	release = (action: string) => {
		if (this.opened) {
			this.opened = false;
			this.rAF && window.cancelAnimationFrame(this.rAF);
			this.stopListeningControls();
			this.closeHandler(action);
		}
	}

	loop = () => {
		this.rAF = window.requestAnimationFrame(this.loop);
		this.draw();
	};

	draw = () => {
		const { width, height } = this.canvasBoundingRect;
		this.context.drawImage(this.assetsManager.get('background.main-menu'), 0, 0, width, height);
		this.getButtons().forEach(button => button.draw(this.context, this.canvasBoundingRect.height))
	}
	
	handleMouseClick = () => {
		if (this.opened) {
			if (this.getButtons()[0].hover) {
				this.release('start');
			} else if (this.getButtons()[1].hover) {
				this.release('controls');
			}
		}
	}
	
	handleMouseMove = (event: MouseEvent) => {
		if (this.opened) {
			this.lastMousePosition = new Vector2D(event.clientX - this.canvasBoundingRect.left, event.clientY - this.canvasBoundingRect.top);
			this.buttons.map(button => button.hover = button.checkCursorColision(this.lastMousePosition, this.canvasBoundingRect.height))
		}
	}

	initControlsListeners = () => {
		this.controlsEvents = [{ action: 'keydown', event: new ControlsEvent(['Escape'], () => this.release('start')) }]
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mousedown', this.handleMouseClick);
	};

	startListeningControls = () => this.controlsEvents
		.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event));
}   