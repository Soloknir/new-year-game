import AssetManager from "./Helpers/AssetManager";
import type { IUseAssets } from "./Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "./Helpers/ControlsManager";
import { Vector2D } from "./Helpers/Vector";
import { Button } from "./Objects/Button";

export class EndGameScreen implements IUseControls, IUseAssets {
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
		this.assetsManager = AssetManager.Instance;
		this.init();
	}

	init = async () => {
		this.initControlsListeners();

		this.createButtons();
		this.rAF = window.requestAnimationFrame(this.loop);
		this.startListeningControls();
		this.opened = true;
	}

	createButtons = () => {
		this.buttons = [
			new Button(new Vector2D(950, 80), { width: 150, height: 50 }, {
				base: this.assetsManager.get('controls.button-restart'),
				hover: this.assetsManager.get('controls.button-restart-active')
			})
		];
	}

	restart = () => {
		if (this.opened) {
			this.opened = false;
			this.rAF && window.cancelAnimationFrame(this.rAF);
			this.stopListeningControls();
			this.opened = false;
			this.closeHandler();
		}
	}

	loop = () => {
		this.rAF = window.requestAnimationFrame(this.loop);
		this.draw();
	};

	draw = () => {
		const { width, height } = this.canvasBoundingRect;
		this.context.drawImage(this.assetsManager.get('background.bg-final'), 0, 0, width, height);
		this.buttons.forEach(button => button.draw(this.context, this.canvasBoundingRect.height))
	}

	handleMouseClick = () => {
		if (this.opened) {
			if (this.buttons[0].hover) {
				console.log('Начать заново');
				this.restart();
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
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mousedown', this.handleMouseClick);
	};

	startListeningControls = () => this.controlsEvents
		.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event));
}   