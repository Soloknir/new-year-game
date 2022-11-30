import GameDriver from './GameDriver';
import MapJson from './map.json';
import type { ICoordinates, IRectangleSize } from './Objects/Interfaces';
import Player from './Objects/Characters/Player';
import Platform from './Objects/Platform';
import { Vector2D } from './Vector';

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

export class Game {
	context: CanvasRenderingContext2D;
	viewPortSize: { width: number; height: number };
	gameDriver: GameDriver;
	assetManager: AssetManager;
	
	player?: Player;

	constructor(context: CanvasRenderingContext2D, viewPortSize: IRectangleSize) {
		this.context = context;
		this.viewPortSize = viewPortSize;
		this.gameDriver = new GameDriver(context, viewPortSize);
		this.assetManager = new AssetManager();
	}

	gameStart = () => {
		this.spawnPlayer();
		this.gameDriver.start();
	};

	loadMap = () => Promise.all(MapJson.platforms.map(({ id, position, size }) => this.spawnPlatform(id, position, size)));
	worldReset = () => this.gameDriver.worldReset();
	
	spawnPlayer = async () => {
		this.player && this.gameDriver.despawnObject(this.player);
		this.player = new Player(new Vector2D(250, 250), await this.assetManager.get('characters/player'));
		this.gameDriver.spawnObject(this.player);
	};

	spawnPlatform = async(id: string, coordinates?: ICoordinates, size?: IRectangleSize) => {
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
	

}