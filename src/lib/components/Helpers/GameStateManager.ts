import type Player from "../Objects/Characters/Player";
import { Vector2D } from "./Vector";

interface IPlayerState {
	player?: Player,
	playerRespawn: Vector2D,
}

interface IGameState {
	isGameOver: boolean;
	isGameStarted: boolean,
	isGamePaused: boolean,
	currentLevel: number;
	playerState: IPlayerState;
}

export class GameStateManager {
	gameState: IGameState = {
		isGameOver: false,
		isGameStarted: false,
		isGamePaused: false,
		currentLevel: 0,
		
		playerState: {
			playerRespawn: new Vector2D(250, 250),
		},
	};

	
}
