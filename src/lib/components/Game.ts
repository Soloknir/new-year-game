import GameDriver from './GameDriver';
import MapJson from './map.json';
import AssetsJson from './assets.json';
import Player from './Objects/Characters/Player';
import Platform from './Objects/Platform';
import { GameCollisionEvent, GameEdgeEvent } from './Objects/GameObject';
import MovingPlatform from './Objects/MovingPlatform';
import Overlay from './Objects/Overlay';
import AssetsManager, { type IUseAssets } from './Helpers/AssetManager';
import ControlsManager, { ControlsEvent, type IUseControls } from './Helpers/ControlsManager';
import { SoundManager } from './Helpers/SoundManager';
import { Tetris } from './MiniGames/Tetris';
import { MainMenu } from './MainMenu';
import { Bubble } from './MiniGames/Bubble';
import { StateManager } from './Helpers/GameStateManager';
import { EndGameScreen } from './EndGame';
import { Vector2D } from './Helpers/Vector';
import Decoration from './Objects/Decoration';
import Water from './Objects/Water';
import PrizeBox from './Objects/PrizeBox';
import Snowman from './Objects/Characters/Snowman';
import { ControlsScreen } from './Controls';

export interface IGameState {
	isGameOver: boolean;
	isGamePaused: boolean;
	level: number;
	player?: Player;
	snowman?: Snowman;
	overlay?: Overlay;
}

export class Game implements IUseControls, IUseAssets {
	context: CanvasRenderingContext2D;
	canvasBoundingRect: DOMRect;
	endLoadingCallback: () => void;

	gameDriver: GameDriver;
	mainMenu?: MainMenu;

	assetsManager = AssetsManager.Instance;
	soundManager = SoundManager.Instance;
	controlsManager = ControlsManager.Instance;
	controlsEvents: { action: string, event: ControlsEvent }[] = [];

	gameStateManager: StateManager;

	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect, endLoadingCallback: () => void) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect;
		this.endLoadingCallback = endLoadingCallback;
		this.gameDriver = new GameDriver(context, canvasBoundingRect);
		this.gameStateManager = StateManager.getInstance(this.gameDriver, this.assetsManager, this.controlsManager);

		this.gameStart();
	}

	gameStart = async () => {
		await this.loadAssets();
		await this.loadSounds();
		this.endLoadingCallback();
		this.mainMenu = new MainMenu(this.context, this.canvasBoundingRect, this.gameStateManager, this.handleMenuAction);
		this.pause();
		
		this.gameDriver.backgroundImage = this.assetsManager.get('background.game')
		this.loadMap();
		this.spawnPlayer();
		this.spawnSnowman();
		this.gameStateManager.spawnObjects([
			new PrizeBox(new Vector2D(6900, 200), { width: 50, height: 50 }, this.assetsManager.get('gift.1'), this.assetsManager.get('key.space'), this.handleEndGame),
			new PrizeBox(new Vector2D(7000, 200), { width: 50, height: 50 }, this.assetsManager.get('gift.2'), this.assetsManager.get('key.space'), this.handleEndGame),
			new PrizeBox(new Vector2D(7100, 200), { width: 50, height: 50 }, this.assetsManager.get('gift.3'), this.assetsManager.get('key.space'), this.handleEndGame),
			new PrizeBox(new Vector2D(7200, 200), { width: 50, height: 50 }, this.assetsManager.get('gift.4'), this.assetsManager.get('key.space'), this.handleEndGame),
			new PrizeBox(new Vector2D(7300, 200), { width: 50, height: 50 }, this.assetsManager.get('gift.5'), this.assetsManager.get('key.space'), this.handleEndGame),
		]);
		
		this.initControlsListeners();
		this.startListeningControls();
		
		this.addSnowmanMeetingEventListener();
		this.addGameOverEventListener();
	};
	
	handleMenuAction = (action: string) => {
		switch (action) {
			case 'controls':
				(new ControlsScreen(this.context, this.canvasBoundingRect, this.gameStateManager, () => this.mainMenu?.open())).open();
				break;
			default:
				this.resume();
		}
	};

	handleEndGame = () => {
		this.pause();
		new EndGameScreen(this.context, this.canvasBoundingRect, this.gameStateManager, this.handleRestart);
	};
	handleRestart = () => {
		this.pause();
		this.gameStateManager.restartGame();
		this.addSnowmanMeetingEventListener();
		if (this.gameStateManager.player) {
			this.gameStateManager.player.vCoordinates = this.gameStateManager.playerRespawn.getCopy();
			this.gameStateManager.player.vVelocity = new Vector2D();
		}
	}

	loadMap = () => {
		this.gameStateManager.spawnObjects([
			// Add decorations
			...MapJson.decorations.map(({ position, size, assetId }) =>
				new Decoration((new Vector2D()).setByCoordsObject(position), size, this.assetsManager.get(assetId))),
			// Add platforms
			...MapJson.platforms.map(({ type, position, behavior, size, assets }) => {
				const vCoordinates = (new Vector2D()).setByCoordsObject(position);
				const textures = {
					head: this.assetsManager.get(assets.head),
					body: this.assetsManager.get(assets.body),
				}

				return type === 'static'
					? new Platform(vCoordinates, size, textures)
					: new MovingPlatform(
						vCoordinates,
						behavior
							? { ...behavior, vTarget: (new Vector2D()).setByCoordsObject(behavior.target) }
							: { vTarget: new Vector2D(), duration: 1, repeat: 'none' },
						size,
						textures
					);
			}),
			this.spawnWater(),
		]);
	};

	spawnPlayer = () => {
		const player = new Player(this.gameStateManager.playerRespawn.getCopy(), this.assetsManager.get('characters.player'));
		this.gameStateManager.player = player;
		this.gameStateManager.player.spawn(this.gameDriver, this.assetsManager, this.controlsManager, this.gameStateManager);
		return player;
	};

	spawnSnowman = () => {
		const position = this.gameStateManager.snowmanSpawnPositions[0];
		const snowman = new Snowman(new Vector2D(position.x, position.y), new Vector2D(), this.assetsManager.get('characters.snowman'));
		this.gameStateManager.snowman = snowman;
		this.gameStateManager.snowman.spawn(this.gameDriver, this.assetsManager, this.controlsManager, this.gameStateManager);
		return snowman;
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

	spawnOverlay = async (text: string) => {
		this.gameStateManager.overlay = this.gameDriver.overlay = new Overlay(
			new Vector2D(0, 0),
			this.canvasBoundingRect,
			this.assetsManager.get('dialog.overlay'),
			text
		);
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

	addSnowmanMeetingEventListener = () => {
		const snowmanSpeech: string[] = [
			'А вот и я Забагованный снеговик! Даже не рассчитывайна легкую победу! Ваши игрушки останутся со мной. Праздника вам не видать!',
			'Баги! Баги повсюду! У вас не будет времени на упаковку подарков. Нового года не будет, ВУАХАХАХАХ!',
			'Немы(uncaught referenceerror)слимо!! Я Всё равно перепутаю вам все карты! Кстати о картах...',
		];

		if (this.gameStateManager.player && this.gameStateManager.snowman) {
			this.gameStateManager.player
				.addEventListener(new GameCollisionEvent(this.gameStateManager.snowman, true,
					() => this.spawnOverlay(snowmanSpeech[this.gameStateManager.currentLevel])
				));
		}
	};

	startMiniGame = () => {
		if (this.gameStateManager.snowman && this.gameStateManager.player && this.gameDriver.overlay) {
			delete this.gameStateManager.overlay;
			this.gameDriver.overlay = null;
			this.gameStateManager.playerRespawn = this.gameStateManager.snowman.vCoordinates.getCopy();
			if (this.gameStateManager.currentSnowmanSpawn <= 3) {
				console.log('this.gameStateManager.currentSnowmanSpawn', this.gameStateManager.currentSnowmanSpawn);
				this.gameStateManager.snowman.vCoordinates = this.gameStateManager
					.snowmanSpawnPositions[this.gameStateManager.currentSnowmanSpawn++].getCopy();
					if (this.gameStateManager.currentSnowmanSpawn <= 3)
						this.addSnowmanMeetingEventListener();
			}

			this.stopListeningControls();
			this.gameDriver.pause();
			switch (this.gameStateManager.currentLevel++) {
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
		
		this.gameStateManager.isGameStarted = true;
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
			{ action: 'keyup', event: new ControlsEvent(['KeyY'], () => console.log(this.gameStateManager.player?.vCoordinates)) }
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