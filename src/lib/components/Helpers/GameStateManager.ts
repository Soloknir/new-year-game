import type Player from "../Objects/Characters/Player";
import type Santa from "../Objects/Characters/Santa";
import type Overlay from "../Objects/Overlay";
import { Vector2D } from "./Vector";

interface IPlayerState {
	player?: Player,
	playerRespawn: Vector2D,
}

interface IWorldState {
	santa?: Santa;
	currentSantaSpawn: number;
	santaSpawnPositions: Vector2D[];
}

interface IGameState {
	isGameOver: boolean;
	isGameStarted: boolean,
	isGamePaused: boolean,
	currentLevel: number;
	overlay?: Overlay;
	worldState: IWorldState;
	playerState: IPlayerState;
}

export class GameStateManager {
	private static _instance: GameStateManager;
	public gameState: IGameState;

	private constructor() {
		this.gameState = {
			isGameOver: false,
			isGameStarted: false,
			isGamePaused: false,
			currentLevel: 0,

			worldState: {
				currentSantaSpawn: 1,
				santaSpawnPositions: [
					new Vector2D(1000, 300),
					new Vector2D(2400, 350),
					new Vector2D(3800, 200),
					new Vector2D(5100, 200),
				],
			},
			playerState: {
				playerRespawn: new Vector2D(250, 250),
			},
		};
	}

	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get player(): Player | undefined { return this.gameState.playerState.player; }
	set player(player: Player | undefined) { this.gameState.playerState.player = player; }

	get santa(): Santa | undefined { return this.gameState.worldState.santa }
	set santa(santa: Santa | undefined) { this.gameState.worldState.santa = santa }

}
