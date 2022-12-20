import type GameDriver from "../GameDriver";
import type Player from "../Objects/Characters/Player";
import type Snowman from "../Objects/Characters/Snowman";
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
	
	currentSnowmanSpawn = 1;
	snowmanSpawnPositions = [
		new Vector2D(516, 200),
		new Vector2D(2316, 350),
		new Vector2D(5550, 800),
		new Vector2D(-1000, 0)
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

	private _snowman?: Snowman;
	get snowman(): Snowman | undefined { return this._snowman }
	set snowman(snowman: Snowman | undefined) { this._snowman = snowman }

	spawnObjects(objects: GameObject[]) {
		objects.map(object => {
			object.spawn(this.gameDriver, this.assetManager, this.controlsManager, this);
			this.objects.push(object);
		})
	}

	restartGame() {
		this.isGameStarted = false;
		this.playerRespawn = new Vector2D(250, 250);
		this.currentLevel = 0;
		this.currentSnowmanSpawn = 1;
		if (this.player) {
			this.player.vCoordinates = this.playerRespawn.getCopy();
			this.player.vVelocity = new Vector2D();
		}
		if (this.snowman)
			this.snowman.vCoordinates = new Vector2D(500, 200);
	}
}
