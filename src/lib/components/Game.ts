import GameDriver from './GameDriver';
import MapJson from './map.json';
import type { ICoordinates, IRectangleSize } from './Objects/Interfaces';
import Player from './Objects/Characters/Player';
import Platform from './Objects/Platform';
import { Vector2D } from './Vector';
import Santa from './Objects/Characters/Santa';
import { GameCollisionEvent, GameEdgeEvent } from './Objects/GameObject';
import MovingPlatform from './Objects/MovingPlatform';
import Water from './Objects/Water';
import Overlay from './Objects/Overlay';
import AssetManager from './Helpers/AssetManager';
import { ControlsEvent, ControlsManager } from './Helpers/ControlsManager';




export interface IGameState {
	isGameOver: boolean;
	level: number;
	player?: Player;
	santa?: Santa;
	overlay?: Overlay;
}

export class Game {
	context: CanvasRenderingContext2D;
	viewPortSize: { width: number; height: number };
	gameDriver: GameDriver;
	controlsManager: ControlsManager;
	assetManager: AssetManager;

	events: { action: string, event: ControlsEvent }[] = [];
	playerRespawn = new Vector2D(250, 250);
	currentSantaSpawn = 0;
	sound?: HTMLAudioElement;
	santaSpawnPositions: Vector2D[] = [
		new Vector2D(2400, 350),
		new Vector2D(3800, 200),
		new Vector2D(5100, 200),
	];

	gameState: IGameState = {
		isGameOver: false,
		level: 1,
	}

	constructor(context: CanvasRenderingContext2D, viewPortSize: IRectangleSize) {
		this.context = context;
		this.viewPortSize = viewPortSize;
		this.gameDriver = new GameDriver(context, viewPortSize);
		this.controlsManager = new ControlsManager();
		this.assetManager = new AssetManager();
	}

	gameStart = async (): Promise<IGameState> => {
		this.gameDriver.backgroundImage = await this.assetManager.get('background', 'jpg')
		await this.spawnPlayer();
		this.addSantaMeetingEventListener();
		this.addGameOverEventListener();
		this.startListeningControls();
		this.gameDriver.start();
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

	spawnPlayer = async () => {
		let eventListeners: (GameCollisionEvent | GameEdgeEvent)[] = [];
		if (this.gameState.player) {
			this.stopListeningControls();
			eventListeners = [...this.gameState.player.eventListeners];
			this.gameDriver.despawnObject(this.gameState.player);
		}

		this.gameState.player = new Player(this.playerRespawn.getCopy(), await this.assetManager.get('characters/player'));
		this.gameState.player.eventListeners = eventListeners;
		this.gameDriver.spawnObject(this.gameState.player);
		this.startListeningControls();
	};

	spawnSanta = async (position: ICoordinates) => {
		this.gameState.santa && this.gameDriver.despawnObject(this.gameState.santa);
		this.gameState.santa = new Santa(new Vector2D(position.x, position.y), new Vector2D(), await this.assetManager.get('characters/santa'));
		this.gameDriver.spawnObject(this.gameState.santa);
		return this.gameState.santa;
	}

	spawnWater = async () => {
		const [head, body]: HTMLImageElement[] = await Promise.all([
			this.assetManager.get('water/head'),
			this.assetManager.get('water/body')
		]);

		const water = new Water(
			new Vector2D(0, -400),
			{ width: 2 * this.viewPortSize.width, height: 400 },
			{ head, body }
		);

		this.gameDriver.spawnObject(water);
		return water;
	}

	spawnOverlay = async () => {
		this.gameState.overlay = this.gameDriver.overlay = new Overlay(
			new Vector2D(0, 0),
			this.viewPortSize,
			await this.assetManager.get('dialog-overlay', 'jpg')
		);
	};

	spawnPlatform = async (id: string, coordinates?: ICoordinates, size?: IRectangleSize) => {
		const [head, body]: HTMLImageElement[] = await Promise.all([
			this.assetManager.get(`platforms/${id}/head`),
			this.assetManager.get(`platforms/${id}/body`)
		]);

		const platform = new Platform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			size ? size : { width: 0, height: 0 },
			{ head, body }
		);

		this.gameDriver.spawnObject(platform);
		return platform;
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	spawnMovingPlatform = async (id: string, coordinates?: ICoordinates, behavior?: any, size?: IRectangleSize) => {
		const [head, body]: HTMLImageElement[] = await Promise.all([
			this.assetManager.get(`platforms/${id}/head`),
			this.assetManager.get(`platforms/${id}/body`)
		]);

		const platform = new MovingPlatform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			behavior ? { ...behavior, vTarget: (new Vector2D()).setByCoordsObject(behavior.target) } : { vTarget: new Vector2D(), duration: 1, repeat: 'none' },
			size ? size : { width: 0, height: 0 },
			{ head, body }
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
		!this.sound && this.playMusic();
		if (this.gameState.santa && this.gameState.player && this.gameDriver.overlay) {
			delete this.gameState.overlay;
			this.gameDriver.overlay = null;
			this.playerRespawn = this.gameState.santa.vCoordinates.getCopy();
			if (this.currentSantaSpawn < 3) {
				this.gameState.santa.vCoordinates = this.santaSpawnPositions[this.currentSantaSpawn++].getCopy();
				this.addSantaMeetingEventListener();
			}
			this.startMinigameCallback();
		}
	}

	startMinigameCallback = () => { return; };

	startListeningControls = () => {
		if (this.gameState && this.gameState.player) {
			this.events = [
				{ action: 'keydown', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameState.player.startJumping)},
				{ action: 'keydown', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameState.player.startMoveRight)},
				{ action: 'keydown', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameState.player.startMoveLeft)},
				{ action: 'keydown', event: new ControlsEvent(['Space'], this.startMiniGame)},
				{ action: 'keyup', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameState.player.stopJumping)},
				{ action: 'keyup', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameState.player.stopMoveRight)},
				{ action: 'keyup', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameState.player.stopMoveLeft)},
			];

			this.events.map(({ action, event }) => this.controlsManager.addEventListener(action, event));
		}
	}

	stopListeningControls = () => {
		this.events.forEach(({ event }) => this.controlsManager.removeEventListener(event))
	}

	playMusic = () => {
		this.sound = document.createElement("audio");
		this.sound.src = `${import.meta.env.DEV ? '' : '/new-year-game'}/assets/music/holiday_game_theme.mp3`;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.setAttribute("loop", "true");
		this.sound.volume = 0.05;
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		this.sound.play();
	}
}