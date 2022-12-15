import GameDriver from './GameDriver';
import MapJson from './map.json';
import AssetsJson from './assets.json';
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
import { StateManager } from './Helpers/GameStateManager';
import { EndGameScreen } from './EndGame';

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
	mainMenu?: MainMenu;

	assetsManager = AssetsManager.Instance;
	soundManager = SoundManager.Instance;
	controlsManager = ControlsManager.Instance;
	controlsEvents: { action: string, event: ControlsEvent }[] = [];

	gameStateManager: StateManager;

	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect;
		
		this.gameDriver = new GameDriver(context, canvasBoundingRect);
		this.gameStateManager = StateManager.getInstance(this.gameDriver, this.assetsManager);
		
		this.gameStart();
	}

	gameStart = async () => {
		await this.loadAssets();
		await this.loadSounds();
		
		this.mainMenu = new MainMenu(this.context, this.canvasBoundingRect, this.resume);
		this.pause();

		this.gameDriver.backgroundImage = this.assetsManager.get('background.bg-game')
		this.loadMap();
		this.spawnPlayer();
		this.spawnSanta();

		this.initControlsListeners();
		this.startListeningControls();

		this.addSantaMeetingEventListener();
		this.addGameOverEventListener();
	};

	loadMap = () => {
		this.gameStateManager.spawnObjects([
			...MapJson.platforms.map(({ id, type, position, behavior, size }: any) => {
				return (type === 'static')
				? this.spawnPlatform(id, position, size)
				: this.spawnMovingPlatform(id, position, behavior, size);
			}),
			this.spawnWater(),
		]);
	};

	spawnPlayer = () => {
		const player = new Player(this.gameStateManager.playerRespawn.getCopy(), this.assetsManager.get('characters.player'));
		this.gameStateManager.player = player;
		this.gameStateManager.player.spawn(this.gameDriver, this.assetsManager);
		return player;
	};

	spawnSanta = () => {
		const position = this.gameStateManager.santaSpawnPositions[0];
		const santa = new Santa(new Vector2D(position.x, position.y), new Vector2D(), this.assetsManager.get('characters.santa'));
		this.gameStateManager.santa = santa;
		this.gameStateManager.santa.spawn(this.gameDriver, this.assetsManager);
		return santa;
	}

	spawnWater = () => {
		const water = new Water(
			new Vector2D(0, -400),
			{ width: 2 * this.canvasBoundingRect.width, height: 400 },
			{
				head: this.assetsManager.get('water.head'),
				body: this.assetsManager.get('water.body')
			}
		);

		return water;
	}

	spawnOverlay = async () => {
		this.gameStateManager.overlay = this.gameDriver.overlay = new Overlay(
			new Vector2D(0, 0),
			this.canvasBoundingRect,
			this.assetsManager.get('dialog.overlay')
		);
	};

	spawnPlatform = (id: string, coordinates?: ICoordinates, size?: IRectangleSize) => {
		const platform = new Platform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			size ? size : { width: 0, height: 0 },
			{
				head: this.assetsManager.get(`platform.base.head`),
				body: this.assetsManager.get(`platform.base.body`)
			}
		);

		return platform;
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	spawnMovingPlatform = (id: string, coordinates?: ICoordinates, behavior?: any, size?: IRectangleSize) => {
		const platform = new MovingPlatform(
			coordinates ? (new Vector2D()).setByCoordsObject(coordinates) : new Vector2D(),
			behavior ? { ...behavior, vTarget: (new Vector2D()).setByCoordsObject(behavior.target) } : { vTarget: new Vector2D(), duration: 1, repeat: 'none' },
			size ? size : { width: 0, height: 0 },
			{
				head: this.assetsManager.get(`platform.base.head`),
				body: this.assetsManager.get(`platform.base.body`)
			}
		);

		return platform;
	};

	addGameOverEventListener = () => {
		if (this.gameStateManager.player) {
			this.gameStateManager.player.addEventListener(new GameEdgeEvent('less', 'y', 0, false, () => {
				if (this.gameStateManager.player) {
					this.gameStateManager.player.vCoordinates = this.gameStateManager.playerRespawn.getCopy();
					this.gameStateManager.player.vVelocity = new Vector2D();
				}
			}));
		}
	};

	addSantaMeetingEventListener = () => {
		if (this.gameStateManager.player && this.gameStateManager.santa) {
			this.gameStateManager.player.addEventListener(new GameCollisionEvent(this.gameStateManager.santa, true, this.spawnOverlay));
		}
	};

	startMiniGame = () => {
		if (this.gameStateManager.santa && this.gameStateManager.player && this.gameDriver.overlay) {
			delete this.gameStateManager.overlay;
			this.gameDriver.overlay = null;
			this.gameStateManager.playerRespawn = this.gameStateManager.santa.vCoordinates.getCopy();
			if (this.gameStateManager.currentSantaSpawn < 4) {
				this.gameStateManager.santa.vCoordinates = this.gameStateManager
					.santaSpawnPositions[this.gameStateManager.currentSantaSpawn++].getCopy();
				this.addSantaMeetingEventListener();
			}

			this.stopListeningControls();
			this.gameDriver.pause();

			switch(this.gameStateManager.currentLevel++) {
				case 0:
					new Bubble(this.context, this.canvasBoundingRect, this.resume);
					break;
				case 1:
					new Tetris(this.context, this.canvasBoundingRect, this.resume);
					break;
				case 2: {
					this.playMemo();
					break;
				}
				case 3:
					new EndGameScreen(this.context, this.canvasBoundingRect, this.resume);
					break;
			}
		}
	}

	playMemo = () => { return; }

	pause = () => {
		if (!this.gameStateManager.isGamePaused) {
			this.soundManager.get('holiday_game_theme')?.pause();
			this.gameStateManager.isGamePaused = true;
			this.stopListeningControls();
			this.gameDriver.pause();
			this.mainMenu?.open();
		}
	}

	resume = () => {
		if (this.gameStateManager.isGamePaused) {
			this.soundManager.get('holiday_game_theme').play();
		}

		this.gameStateManager.isGamePaused = false;
		this.startListeningControls();
		this.gameDriver.start();
	}

	loadAssets = async () => await this.assetsManager
		.loadAssets(Object.keys(AssetsJson.assets)
			.map((key, index) => ({
				key, path: Object.values(AssetsJson.assets)[index]
			}))
		);

	initControlsListeners = () => {
		if (!this.gameStateManager.player) return;

		this.controlsEvents = [
			{ action: 'keydown', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameStateManager.player.startJumping) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameStateManager.player.startMoveRight) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameStateManager.player.startMoveLeft) },
			{ action: 'keydown', event: new ControlsEvent(['Space'], this.startMiniGame) },
			{ action: 'keydown', event: new ControlsEvent(['Escape'], this.pause) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.gameStateManager.player.stopJumping) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.gameStateManager.player.stopMoveRight) },
			{ action: 'keyup', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.gameStateManager.player.stopMoveLeft) },
		];
	};

	startListeningControls = () => {
		this.controlsEvents.map(({ action, event }) => this.controlsManager.addEventListener(action, event))
	};

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event))
	
	loadSounds = async () => await this.soundManager.loadSounds([
		{ path: 'holiday_game_theme', format: 'mp3' }
	]);
}