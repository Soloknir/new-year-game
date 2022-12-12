import AssetManager from "./Helpers/AssetManager";
import type { IUseAssets } from "./Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "./Helpers/ControlsManager";

export class MainMenu implements IUseControls, IUseAssets {
	rAF: number | null = null;
	context: CanvasRenderingContext2D;
	canvasBoundingRect: DOMRect;
	closeHandler: () => void;

	opened = false;
	assetsManager: AssetManager;
	controlsManager: ControlsManager;
	controlsEvents: { action: string; event: ControlsEvent; }[] = [];
		
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
	}

	open = () => {
		if (!this.opened) {
			this.opened = true;
			this.rAF = window.requestAnimationFrame(this.loop);
			this.startListeningControls();
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

		return;
	};

	draw = () => {
		const { width, height } = this.canvasBoundingRect;
		this.context.drawImage(this.assetsManager.get('background/main-menu-bg'), 0, 0, width, height);
	}

	initControlsListeners = () => {
		this.controlsEvents = [{ action: 'keydown', event: new ControlsEvent(['Escape'], this.release) }];
	}

	startListeningControls = () => this.controlsEvents
		.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event));

	loadAssets = async () => await this.assetsManager.loadAssets([
		{ path: 'background/main-menu-bg', format: 'png' }
	]);
}