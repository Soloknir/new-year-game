import AssetManager from "./Helpers/AssetManager";
import type { IUseAssets } from "./Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "./Helpers/ControlsManager";
import { Vector2D } from "./Helpers/Vector";
import { Button } from "./Objects/Button";

export class MainMenu implements IUseControls, IUseAssets {
	rAF: number | null = null;
	context: CanvasRenderingContext2D;
	canvasBoundingRect: DOMRect;
	closeHandler: () => void;

	opened = false;
	assetsManager: AssetManager;
	controlsManager: ControlsManager;
	controlsEvents: { action: string; event: ControlsEvent; }[] = [];

	buttons: Button[] = [];
	isAssetsLoaded = false;
	lastMousePosition = new Vector2D();
	afterLoadCollback?: () => void;
		
	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect, closeHandler: () => void) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect;
		this.closeHandler = closeHandler;

		this.controlsManager = ControlsManager.Instance;
		this.assetsManager = new AssetManager();
		this.init();
	}

	init = async () => {
		this.initControlsListeners();
		await this.loadAssets();
		this.createButtons();
		this.isAssetsLoaded = true;
		this.afterLoadCollback && this.afterLoadCollback();
	}

	createButtons = () => {
		this.buttons = [
			new Button(new Vector2D(860, 400), { width: 150, height: 50 }, this.assetsManager.get('controls/button-start')),
			new Button(new Vector2D(860, 325), { width: 150, height: 50 }, this.assetsManager.get('controls/button-control'))
		];
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

	release = () => {
		if (this.opened) {
			this.opened = false;
			this.rAF && window.cancelAnimationFrame(this.rAF);
			this.stopListeningControls();
			this.closeHandler();
		}
	}

	loop = () => {
		this.rAF = window.requestAnimationFrame(this.loop);
		this.draw();
	};

	draw = () => {
		const { width, height } = this.canvasBoundingRect;
		this.context.drawImage(this.assetsManager.get('background/main-menu-bg'), 0, 0, width, height);
		this.buttons.forEach(button => button.draw(this.context, this.canvasBoundingRect.height))

		this.context.fillStyle = "red";
		this.context.fillRect(this.lastMousePosition.x, this.lastMousePosition.y, 10, 10);
	}

	
	handleMouseClick = () => {
		if (this.opened) {
			if (this.buttons[0].hover) {
				console.log('Начать игру');
				this.release();
			} else if (this.buttons[1].hover) {
				console.log('Управление');
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
		this.controlsEvents = [{ action: 'keydown', event: new ControlsEvent(['Escape'], this.release) }]
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mousedown', this.handleMouseClick);
	};

	startListeningControls = () => this.controlsEvents
		.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event));

	loadAssets = async () => await this.assetsManager.loadAssets([
		{ path: 'background/main-menu-bg', format: 'png' },
		{ path: 'controls/button-start', format: 'png' },
		{ path: 'controls/button-control', format: 'png' },
	]);
}