import GameDriver from './GameDriver';
import MapJson from './map.json';
import type { ICoordinates, IRectangleSize } from './Objects/Interfaces';
import Player from './Objects/Characters/Player';
import Platform from './Objects/Platform';
import { Vector2D } from './Helpers/Vector';
import Santa from './Objects/Characters/Santa';
import { GameCollisionEvent, GameEdgeEvent } from './Objects/GameObject';
import MovingPlatform from './Objects/MovingPlatform';
import Water from './Objects/Water';
import Overlay from './Objects/Overlay';
import AssetsManager, { type IUseAssets } from './Helpers/AssetManager';
import ControlsManager, { ControlsEvent, type IUseControls } from './Helpers/ControlsManager';
import { SoundManager } from './Helpers/SoundManager';
import { Tetris } from './MiniGames/Tetris';
import { MainMenu } from './MainMenu';
import { Bubble } from './MiniGames/Bubble';

export interface IGameState {
	isGameOver: boolean;
	isGamePaused: boolean;
	level: number;
	player?: Player;
	santa?: Santa;
	overlay?: Overlay;
}

export class Game implements IUseControls, IUseAssets {
	context: CanvasRenderingContext2D;
	canvasBoundingRect: DOMRect;

	gameDriver: GameDriver;
	mainMenu: MainMenu;
	assetsManager: AssetsManager;
	soundManager: SoundManager;
	controlsManager: ControlsManager;
	controlsEvents: { action: string, event: ControlsEvent }[] = [];
	
	playerRespawn = new Vector2D(250, 250);
	currentSantaSpawn = 0;
	santaSpawnPositions: Vector2D[] = [
		new Vector2D(2400, 350),
		new Vector2D(3800, 200),
		new Vector2D(5100, 200),
	];

	gameState: IGameState = {
		isGameOver: false,
		isGamePaused: false,
		level: 0,
	}

	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect;
		
		this.gameDriver = new GameDriver(context, canvasBoundingRect);
		this.mainMenu = new MainMenu(this.context, this.canvasBoundingRect, this.resume);
		this.controlsManager = ControlsManager.Instance;
		this.assetsManager = new AssetsManager();
		this.soundManager = new SoundManager();

		this.gameStart();
	}

	gameStart = async (): Promise<IGameState> => {
		this.pause();
		await this.loadAssets()

		this.gameDriver.backgroundImage = this.assetsManager.get('background/bg-game')
		this.loadMap();
		this.spawnPlayer();
		this.addSantaMeetingEventListener();
		this.addGameOverEventListener();
		
	
		return this.gameState;
	};

	loadMap = () => {
		return Promise.all([
			Promise.all(MapJson.characters.map(({ position }) => this.spawnSanta(position))),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Promise.all(MapJson.platforms.map(({ id, type, position, behavior, size }: any) => {
				return (type === 'static')
					? this.spawnPlatform(id, position, size)
					: this.spawnMovingPlatform(id, position, behavior, size);
			})),
			this.spawnWater()
		])
	};

	spawnPlayer = () => {
		let eventListeners: (GameCollisionEvent | GameEdgeEvent)[] = [];
		if (this.gameState.player) {
			this.stopListeningControls();
			eventListeners = [...this.gameState.player.eventListeners];
			this.gameDriver.despawnObject(this.gameState.player);
		}

		this.gameState.player = new Player(this.playerRespawn.getCopy(), this.assetsManager.get('characters/player'));
		this.gameState.player.eventListeners = eventListeners;
		this.gameDriver.spawnObject(this.gameState.player);
		this.initControlsListeners();
		this.startListeningControls();
	};

	spawnSanta = (position: ICoordinates) => {
		this.gameState.santa && this.gameDriver.despawnObject(this.gameState.santa);
		this.gameState.santa = new Santa(new Vector2D(position.x, position.y), new Vector2D(), this.assetsManager.get('characters/santa'));
		this.gameDriver.spawnObject(this.gameState.santa);
		return this.gameState.santa;
	}

	spawnWater = () => {
		const water = new Water(
			new Vector2D(0, -400),
			{ width: 2 * this.canvasBoundingRect.width, height: 400 },
			{
				head: this.assetsManager.get('water/head'),
				body: this.assetsManager.get('water/body')
			}
		);

		this.gameDriver.spawnObject(water);
		return water;
	}

	spawnOverlay = async () => {
		this.gameState.overlay = this.gameDriver.overlay = new Overlay(
			new Vector2D(0, 0),
			this.canvasBoundingRect,
			this.assetsManager.get('dialog-overlay')
		);
	};

	spawnPlatform = (id: string, coordinates?: ICoordinates, size?: IRectangleSize) => {
		const platform = new Platform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			size ? size : { width: 0, height: 0 },
			{
				head: this.assetsManager.get(`platforms/base/head`),
				body: this.assetsManager.get(`platforms/base/body`)
			}
		);

		this.gameDriver.spawnObject(platform);
		return platform;
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	spawnMovingPlatform = (id: string, coordinates?: ICoordinates, behavior?: any, size?: IRectangleSize) => {

		const platform = new MovingPlatform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			behavior ? { ...behavior, vTarget: (new Vector2D()).setByCoordsObject(behavior.target) } : { vTarget: new Vector2D(), duration: 1, repeat: 'none' },
			size ? size : { width: 0, height: 0 },
			{
				head: this.assetsManager.get(`platforms/base/head`),
				body: this.assetsManager.get(`platforms/base/body`)
			}
		);

		this.gameDriver.spawnObject(platform);
		return platform;
	};

	addGameOverEventListener = () => {
		if (this.gameState.player) {
			this.gameState.player.addEventListener(new GameEdgeEvent('less', 'y', 0, false, this.spawnPlayer));
		}
	};

	addSantaMeetingEventListener = () => {
		if (this.gameState.player && this.gameState.santa) {
			this.gameState.player.addEventListener(new GameCollisionEvent(this.gameState.santa, true, this.spawnOverlay));
		}
	};

	startMiniGame = () => {
		if (this.gameState.santa && this.gameState.player && this.gameDriver.overlay) {
			delete this.gameState.overlay;
			this.gameDriver.overlay = null;
			this.playerRespawn = this.gameState.santa.vCoordinates.getCopy();
			if (this.currentSantaSpawn < 3) {
				this.gameState.santa.vCoordinates = this.santaSpawnPositions[this.currentSantaSpawn++].getCopy();
				this.addSantaMeetingEventListener();
			}

			this.stopListeningControls();
			this.gameDriver.pause();

			switch(this.gameState.level++) {
				case 0:
					new Bubble(this.context, this.canvasBoundingRect, this.resume);
					break;
				case 1:
					new Tetris(this.context, this.canvasBoundingRect, this.resume);
					break;
			}
		}
	}

	pause = () => {
		if (!this.gameState.isGamePaused) {
			this.gameState.isGamePaused = true;
			this.stopListeningControls();
			this.gameDriver.pause();
			this.mainMenu.open();
		}
	}

	resume = () => {
		this.gameState.isGamePaused = false;
		this.startListeningControls();
		this.gameDriver.start();
	}

	loadAssets = async () => await this.assetsManager.loadAssets([
		{ path: 'background/bg-game', format: 'jpg' },
		{ path: 'characters/player', format: 'png' },
		{ path: 'characters/santa', format: 'png' },
		{ path: 'water/head', format: 'png' },
		{ path: 'water/body', format: 'png' },
		{ path: 'dialog-overlay', format: 'jpg' },
		{ path: 'platforms/base/head', format: 'png' },
		{ path: 'platforms/base/body', format: 'png' },
	]);

	initControlsListeners = () => {
		if (!this.gameState.player) return;

		this.controlsEvents = [
			{ action: 'keydown', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameState.player.startJumping) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameState.player.startMoveRight) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameState.player.startMoveLeft) },
			{ action: 'keydown', event: new ControlsEvent(['Space'], this.startMiniGame) },
			{ action: 'keydown', event: new ControlsEvent(['Escape'], this.pause) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameState.player.stopJumping) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameState.player.stopMoveRight) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameState.player.stopMoveLeft) },
		];
	}

	startListeningControls = () => {
		this.controlsEvents.map(({ action, event }) => this.controlsManager.addEventListener(action, event))
	};

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event))
	
}