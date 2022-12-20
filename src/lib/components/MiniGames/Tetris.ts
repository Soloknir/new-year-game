import AssetsManager, { type IUseAssets } from "../Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "../Helpers/ControlsManager";
import type { IRectangleSize } from "../Objects/Interfaces";

type TetrominoName = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
enum TetrominoAssets {
	'I' = 'tetris.cube',
	'O' = 'tetris.cube-blue',
	'T' = 'tetris.cube-brown',
	'S' = 'tetris.cube-green',
	'Z' = 'tetris.cube-pink',
	'J' = 'tetris.cube-red',
	'L' = 'tetris.cube-violet'
};

interface ITetromino {
	name: TetrominoName,      // name of the piece (L, O, etc.)
	matrix: number[][],  // the current rotation matrix
	row: number,        // current row (starts offscreen)
	col: number        // current col
}

export class Tetris implements IUseControls, IUseAssets {
	context: CanvasRenderingContext2D;
	rAF: number | null = null;

	grid = 32;
	tetrominoSequence: TetrominoName[] = [];
	playfield: (TetrominoName | null)[][] = [];

	assetsManager: AssetsManager;

	controlsEvents: { action: string, event: ControlsEvent }[] = [];
	controlsManager: ControlsManager;

	count = 0;
	tetromino: ITetromino;
	gameOver = false;
	target = 10;
	score = 0;

	size: IRectangleSize;
	tetrominos = {
		'I': [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		],
		'J': [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		'L': [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		'O': [
			[1, 1],
			[1, 1],
		],
		'S': [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		'Z': [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		'T': [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		]
	};

	endGameCallback: () => void;

	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect, endGameCallback: () => void) {
		this.context = context;
		this.size = canvasBoundingRect;
		this.endGameCallback = endGameCallback;
		
		this.assetsManager = AssetsManager.Instance;
		this.controlsManager = ControlsManager.Instance;

		this.init();
		this.tetromino = this.getNextTetromino();
	}


	init = async () => {
		this.initControlsListeners();
		this.startListeningControls();

		for (let row = -2; row < 20; row++) {
			this.playfield[row] = [];

			for (let col = 0; col < 10; col++) {
				this.playfield[row][col] = null;
			}
		}

		this.rAF = requestAnimationFrame(this.loop);
	}

	getRandomInt = (min: number, max: number) => {
		min = Math.ceil(min);
		max = Math.floor(max);

		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// generate a new tetromino sequence
	// @see https://tetris.fandom.com/wiki/Random_Generator
	generateSequence = () => {
		const sequence: TetrominoName[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

		while (sequence.length) {
			const rand = this.getRandomInt(0, sequence.length - 1);
			const name = sequence.splice(rand, 1)[0];
			this.tetrominoSequence.push(name);
		}
	}

	// get the next tetromino in the sequence
	getNextTetromino = (): ITetromino => {
		if (this.tetrominoSequence.length === 0) {
			this.generateSequence();
		}

		const name = this.tetrominoSequence.pop() as TetrominoName;
		const matrix = this.tetrominos[name];

		// I and O start centered, all others start in left-middle
		const col = this.playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

		// I starts on row 21 (-1), all others start on row 22 (-2)
		const row = name === 'I' ? -1 : -2;

		return { name, matrix, row, col };
	}

	// rotate an NxN matrix 90deg
	// @see https://codereview.stackexchange.com/a/186834
	rotate = (matrix: number[][]) => {
		const N = matrix.length - 1;
		const result = matrix.map((row, i) =>
			row.map((_, j) => matrix[N - j][i])
		);

		return result;
	}

	// check to see if the new matrix/row/col is valid
	isValidMove = (matrix: number[][], cellRow: number, cellCol: number) => {
		for (let row = 0; row < matrix.length; row++) {
			for (let col = 0; col < matrix[row].length; col++) {
				if (matrix[row][col] && (
					// outside the game bounds
					cellCol + col < 0 ||
					cellCol + col >= this.playfield[0].length ||
					cellRow + row >= this.playfield.length ||
					// collides with another piece
					this.playfield[cellRow + row][cellCol + col])
				) {
					return false;
				}
			}
		}

		return true;
	}

	// place the tetromino on the playfield
	placeTetromino = () => {
		for (let row = 0; row < this.tetromino.matrix.length; row++) {
			for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
				if (this.tetromino.matrix[row][col]) {

					// game over if piece has any part offscreen
					if (this.tetromino.row + row < 0) {
						return this.showGameOver();
					}

					this.playfield[this.tetromino.row + row][this.tetromino.col + col] = this.tetromino.name;
				}
			}
		}

		// check for line clears starting from the bottom and working our way up
		for (let row = this.playfield.length - 1; row >= 0;) {
			if (this.playfield[row].every(cell => !!cell)) {

				// drop every row above this one
				for (let r = row; r >= 0; r--) {
					for (let c = 0; c < this.playfield[r].length; c++) {
						this.playfield[r][c] = this.playfield[r - 1][c];
					}
				}

				this.score++;
				if (this.score >= this.target) {
					this.endGameCallback();
					this.rAF && window.cancelAnimationFrame(this.rAF);
				}

			} else {
				row--;
			}
		}

		this.tetromino = this.getNextTetromino();
	}

	// show the game over screen
	showGameOver() {
		this.rAF && cancelAnimationFrame(this.rAF);
		this.gameOver = true;

		this.context.fillStyle = 'black';
		this.context.globalAlpha = 0.75;
		this.context.fillRect(0, this.size.height / 2 - 30, this.size.width, 80);

		this.context.globalAlpha = 1;
		this.context.fillStyle = 'white';
		this.context.font = '36px monospace';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('О неет, подарки..', this.size.width / 2, this.size.height / 2);

		this.context.fillStyle = 'white';
		this.context.font = '16px monospace';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('Нажмите Esc', this.size.width / 2, this.size.height / 2 + 30);

	}

	// game loop
	loop = () => {
		this.rAF = requestAnimationFrame(this.loop);
		const xShift = this.size.width / 2 - 160;
		this.context.drawImage(this.assetsManager.get('background.minigame'), 0, 0, this.size.width, this.size.height);
		// draw walls
		this.context.fillStyle = 'lightgrey';
		this.context.fillRect(xShift, 0, 4, this.size.height);
		this.context.fillRect(xShift + 320, 0, 4, this.size.height);


		// draw the playfield
		for (let row = 0; row < 20; row++) {
			for (let col = 0; col < 10; col++) {
				if (this.playfield[row][col]) {
					const name = this.playfield[row][col];
					if (name) {
						// drawing 1 px smaller than the grid creates a grid effect
						this.context.drawImage(this.assetsManager.get(TetrominoAssets[name]), col * this.grid + xShift, row * this.grid, this.grid - 1, this.grid - 1);
					}
				}
			}
		}

		// draw the active tetromino
		if (this.tetromino) {

			// tetromino falls every 35 frames
			if (++this.count > 35) {
				this.tetromino.row++;
				this.count = 0;

				// place piece if it runs into anything
				if (!this.isValidMove(this.tetromino.matrix, this.tetromino.row, this.tetromino.col)) {
					this.tetromino.row--;
					this.placeTetromino();
				}
			}


			for (let row = 0; row < this.tetromino.matrix.length; row++) {
				for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
					if (this.tetromino.matrix[row][col]) {
						// drawing 1 px smaller than the grid creates a grid effect
						this.context.drawImage(this.assetsManager.get(TetrominoAssets[this.tetromino.name]), (this.tetromino.col + col) * this.grid + xShift, (this.tetromino.row + row) * this.grid, this.grid - 1, this.grid - 1);
					}
				}
			}
		}

		this.drawScore();
	}
	
	drawScore = () => {
		const xShift = this.size.width / 2 - 160;
		this.context.fillStyle = 'black';
		this.context.font = '20px Arial';
		this.context.textAlign = 'left';
		this.context.textBaseline = 'bottom';
		this.context.fillText(`Цель: ${this.target}`, xShift + 350, 30);
		this.context.fillText(`Выполнено: ${this.score}`, xShift + 350, 60);
	}

	release = () => {
		this.rAF && window.cancelAnimationFrame(this.rAF);
		this.stopListeningControls();
		this.endGameCallback();
	}
 
	initControlsListeners = () => {
		this.controlsEvents = [
			{ action: 'keydown', event: new ControlsEvent(['ArrowUp', 'KeyW'], this.handleRotate) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.handleMoveRight) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.handleMoveLeft) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowDown', 'KeyS'], this.handleMoveDown) },
			{ action: 'keydown', event: new ControlsEvent(['Escape'], this.release) },
		];
	}

	startListeningControls = () => this.controlsEvents
		.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event))
	

	handleMoveLeft = () => {
		const col = this.tetromino.col - 1;
		if (this.isValidMove(this.tetromino.matrix, this.tetromino.row, col)) {
			this.tetromino.col = col;
		}
	}

	handleMoveRight = () => {
		const col = this.tetromino.col + 1;
		if (this.isValidMove(this.tetromino.matrix, this.tetromino.row, col)) {
			this.tetromino.col = col;
		}
	}

	handleRotate = () => {
		const matrix = this.rotate(this.tetromino.matrix);
		if (this.isValidMove(matrix, this.tetromino.row, this.tetromino.col)) {
			this.tetromino.matrix = matrix;
		}
	}

	handleMoveDown = () => {
		const row = this.tetromino.row + 1;

		if (!this.isValidMove(this.tetromino.matrix, row, this.tetromino.col)) {
			this.tetromino.row = row - 1;

			this.placeTetromino();
			return;
		}

		this.tetromino.row = row;
	}
}