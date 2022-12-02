import GameDriver from './GameDriver';
import MapJson from './map.json';
import type { ICoordinates, IRectangleSize } from './Objects/Interfaces';
import Player from './Objects/Characters/Player';
import Platform from './Objects/Platform';
import { Vector2D } from './Vector';
import Santa from './Objects/Characters/Santa';
import { GameCollisionEvent, GameEdgeEvent } from './Objects/GameObject';

class AssetManager {
	assets: { [key: string]: HTMLImageElement } = {};
	
	get = async (path: string) => this.assets[path] || await this.loadAsset(path);

	loadAssets = async (paths: string[]) => {
		const assets = await Promise.all(paths.map((path: string) => this.loadAsset(path)));
		paths.map((path, index) => this.assets[path] = assets[index]);
	}

	loadAsset = (path: string) => new Promise<HTMLImageElement>((resolve) => {
		const image = new Image();
		image.src = `src/lib/images/${path}.png`;
		image.onload = () => resolve(image);
	});
}

export interface IGameState {
	isGameOver: boolean;
	level: number;
	player?: Player;
	santa?: Santa;
}

export class Game {
	context: CanvasRenderingContext2D;
	viewPortSize: { width: number; height: number };
	gameDriver: GameDriver;
	assetManager: AssetManager;
	
	playerRespawn = new Vector2D(250, 250);
	gameState: IGameState = {
		isGameOver: false,
		level: 1,
	}

	constructor(context: CanvasRenderingContext2D, viewPortSize: IRectangleSize) {
		this.context = context;
		this.viewPortSize = viewPortSize;
		this.gameDriver = new GameDriver(context, viewPortSize);
		this.assetManager = new AssetManager();
	}

	gameStart = async (): Promise<IGameState> => {
		await this.spawnPlayer();
		this.addSantaMeetingEventListener();
		this.addGameOverEventListener()
		this.gameDriver.start();
		return this.gameState;
	};

	loadMap = () => {
		return Promise.all([
			Promise.all(MapJson.characters.map(({ position }) => this.spawnSanta(position))),
			Promise.all(MapJson.platforms.map(({ id, position, size }) => this.spawnPlatform(id, position, size))),
		])
	};

	spawnPlayer = async () => {
		let eventListeners: (GameCollisionEvent | GameEdgeEvent)[] = [];
		if (this.gameState.player) {
			eventListeners = [...this.gameState.player.eventListeners];
			this.gameDriver.despawnObject(this.gameState.player);
		}

		this.gameState.player = new Player(this.playerRespawn.getCopy(), await this.assetManager.get('characters/player'));
		this.gameState.player.eventListeners = eventListeners;
		this.gameDriver.spawnObject(this.gameState.player);
	};

	spawnSanta = async (position: ICoordinates) => {
		this.gameState.santa && this.gameDriver.despawnObject(this.gameState.santa);
		this.gameState.santa = new Santa(new Vector2D(position.x, position.y), new Vector2D(), await this.assetManager.get('characters/santa'));
		this.gameDriver.spawnObject(this.gameState.santa);
		return this.gameState.santa;
	}

	spawnPlatform = async (id: string, coordinates?: ICoordinates, size?: IRectangleSize) => {
		const [head, body]: HTMLImageElement[] = await Promise.all([
			this.assetManager.get(`platforms/${id}/head`),
			this.assetManager.get(`platforms/${id}/body`)
		]);
 
		const platform = new Platform(
			coordinates ? new Vector2D(coordinates.x, coordinates.y) : new Vector2D(),
			size ? size : { width: 0, height: 0 },
			{ head, body }
		);
	
		this.gameDriver.spawnObject(platform);
		return platform;
	};

	addGameOverEventListener = () => {
		if (this.gameState.player) {
			this.gameState.player
				.addEventListener(new GameEdgeEvent('less', 'y', 0, false, this.spawnPlayer));
		}
	};

	addSantaMeetingEventListener = () => {
		if (this.gameState.player && this.gameState.santa) {
			this.gameState.player
				.addEventListener(new GameCollisionEvent(this.gameState.santa, true, this.startMiniGame));
		}
	};

	startMiniGame = () => {
		if (this.gameState.santa && this.gameState.player) {
			this.playerRespawn =this.gameState.santa.vCoordinates.getCopy();
			this.gameState.santa.vCoordinates = new Vector2D(2400, 350);
			this.gameState.player.addEventListener(new GameCollisionEvent(this.gameState.santa, true, this.winGameCallback))
			
			this.startFlipGameCallback();
		}
	}


	winGameCallback = () => { console.log('win'); }
	startFlipGameCallback = () => { return; };

}