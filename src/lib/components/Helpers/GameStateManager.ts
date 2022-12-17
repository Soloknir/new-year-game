import type GameDriver from "../GameDriver";
import type Player from "../Objects/Characters/Player";
import type Santa from "../Objects/Characters/Santa";
import type { GameObject } from "../Objects/GameObject";
import type Overlay from "../Objects/Overlay";
import type AssetManager from "./AssetManager";
import type ControlsManager from "./ControlsManager";
import { Vector2D } from "./Vector";

export class StateManager {
	private static _instance: StateManager;
	private gameDriver: GameDriver;
	private assetManager: AssetManager;
	private controlsManager: ControlsManager;
	
	isGameOver = false;
	isGameStarted = false;
	isGamePaused = false;
	currentLevel = 0;
	
	currentSantaSpawn = 1;
	santaSpawnPositions = [
		new Vector2D(1000, 300),
		new Vector2D(2400, 350),
		new Vector2D(3800, 200),
		new Vector2D(5100, 200),
	];
	
	overlay?: Overlay;
	playerRespawn = new Vector2D(250, 250);
	objects: GameObject[] = []

	private constructor(gameDriver: GameDriver, assetManager: AssetManager, controlsManager: ControlsManager) {
		this.gameDriver = gameDriver;
		this.assetManager = assetManager;
		this.controlsManager = controlsManager;
	}

	public static getInstance(gameDriver: GameDriver, assetManager: AssetManager, controlsManager: ControlsManager) {
		return this._instance || (this._instance = new this(gameDriver, assetManager, controlsManager));
	}

	private _player?: Player;
	get player(): Player | undefined { return this._player; }
	set player(player: Player | undefined) { this._player = player; }

	private _santa?: Santa;
	get santa(): Santa | undefined { return this._santa }
	set santa(santa: Santa | undefined) { this._santa = santa }

	spawnObjects(objects: GameObject[]) {
		objects.map(object => {
			object.spawn(this.gameDriver, this.assetManager, this.controlsManager, this);
			this.objects.push(object);
		})
	}
}
