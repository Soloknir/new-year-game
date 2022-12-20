import AssetManager from "../Helpers/AssetManager";
import type { IUseAssets } from "../Helpers/AssetManager";
import ControlsManager, { ControlsEvent, type IUseControls } from "../Helpers/ControlsManager";
import type { IRectangleSize } from "../Objects/Interfaces";

interface IBubble {
	x: number,
	y: number,
	radius: number,
	color?: string,
	active?: boolean,
	processed?: boolean,
}

export class Bubble implements IUseControls, IUseAssets {
	context: CanvasRenderingContext2D;
	rAF: number | null = null;
	grid = 48;

	// each even row is 8 bubbles long and each odd row is 7 bubbles long.
	// the level consists of 4 rows of bubbles of 4 colors: red, orange,
	// green, and yellow
	level: any = [];

	// create a mapping between color short code (R, G, B, Y) and color name
	colorMap = {
		'R': 'red',
		'G': 'green',
		'B': 'blue',
		'Y': 'yellow'
	};

	assetsManager: AssetManager;
	controlsManager: ControlsManager;
	controlsEvents: { action: string; event: ControlsEvent; }[] = [];


	colorsKeys = Object.keys(this.colorMap);
	colors = Object.values(this.colorMap);
	bubbleGap = 1;
	wallSize: any = 4;
	bubbles: IBubble[] = [];
	particles: any[] = [];
	curBubblePos: any;
	curBubble: any;

	// angle (in radians) of the shooting arrow
	shootDeg = 0;

	// min/max angle (in radians) of the shooting arrow
	minDeg: number;
	maxDeg: number;

	// the direction of movement for the arrow (-1 = left, 1 = right)
	shootDir = 0;
	
	endGameCallback: () => void;

	canvasBoundingRect: DOMRect;
	size: IRectangleSize;

	constructor(context: CanvasRenderingContext2D, canvasBoundingRect: DOMRect, endGameCallback: () => void) {
		this.context = context;
		this.canvasBoundingRect = canvasBoundingRect
		this.size = { width: 400, height: canvasBoundingRect.height };
		this.endGameCallback = endGameCallback;
		
		this.assetsManager = AssetManager.Instance;
		this.controlsManager = ControlsManager.Instance;
		this.initControlsListeners();
		this.startListeningControls();
		
		this.minDeg = this.degToRad(-60);
		this.maxDeg = this.degToRad(60);
		
		this.curBubblePos = {
			// place the current bubble horizontally in the middle of the screen
			x: this.size.width / 2,
			y: this.size.height - this.grid * 1.5
		};

		this.curBubble = {
			x: this.curBubblePos.x,
			y: this.curBubblePos.y,
			color: 'red',
			radius: this.grid / 2,  // a circles radius is half the width (diameter)

			// how fast the bubble should go in either the x or y direction
			speed: 8,

			// bubble velocity
			dx: 0,
			dy: 0
		};

		this.init();
	}

	init = async () => {
		this.prepareLevel();
		this.rAF = window.requestAnimationFrame(this.loop)
	}

	prepareLevel() {
		for (let i = 0; i < 5; i++) {
			const rowLength = i % 2 === 0 ? 8 : 7;
			const row = [];
			for (let j = 0; j < rowLength; j++) {
				row.push(this.colorsKeys[this.getRandomInt(0, this.colors.length - 1)]);
			}
			this.level.push(row);
		}

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < (row % 2 === 0 ? 8 : 7); col++) {
				// if the level has a bubble at the location, create an active
				// bubble rather than an inactive one
				const color = this.level[row]?.[col];
				this.createBubble(col * this.grid, row * this.grid, this.colorMap[color]);
			}
		}
	}

	// helper to convert deg to radians
	degToRad = (deg: number) => (deg * Math.PI) / 180;

	// rotate a point by an angle
	rotatePoint = (x: number, y: number, angle: number) => {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);

		return {
			x: x * cos - y * sin,
			y: x * sin + y * cos
		};
	}

	getRandomInt = (min: number, max: number) => {
		min = Math.ceil(min);
		max = Math.floor(max);

		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// get the distance between two points
	getDistance = (obj1: IBubble, obj2: IBubble) => {
		const distX = obj1.x - obj2.x;
		const distY = obj1.y - obj2.y;
		return Math.sqrt(distX * distX + distY * distY);
	}

	// check for collision between two circles
	collides = (obj1: IBubble, obj2: IBubble) => {
		return this.getDistance(obj1, obj2) < obj1.radius + obj2.radius;
	}

	// find the closest bubbles that collide with the object
	getClosestBubble = (obj: IBubble, activeState = false) => {
		const closestBubbles = this.bubbles
			.filter(bubble => bubble.active == activeState && this.collides(obj, bubble));

		if (!closestBubbles.length) {
			return;
		}

		return closestBubbles
			// turn the array of bubbles into an array of distances
			.map(bubble => {
				return {
					distance: this.getDistance(obj, bubble),
					bubble
				}
			})
			.sort((a, b) => a.distance - b.distance)[0].bubble;
	}

	// create the bubble grid bubble. passing a color will create
	// an active bubble
	createBubble = (x: number, y: number, color: string) => {
		const row = Math.floor(y / this.grid);
		const col = Math.floor(x / this.grid);

		// bubbles on odd rows need to start half-way on the grid
		const startX = row % 2 === 0 ? 0 : 0.5 * this.grid;

		// because we are drawing circles we need the x/y position
		// to be the center of the circle instead of the top-left
		// corner like you would for a square
		const center = this.grid / 2;

		this.bubbles.push({
			x: this.wallSize + (this.grid + this.bubbleGap) * col + startX + center,

			// the bubbles are closer on the y axis so we subtract 4 on every
			// row
			y: this.wallSize + (this.grid + this.bubbleGap - 4) * row + center,

			radius: this.grid / 2,
			color: color,
			active: color ? true : false
		});
	}

	// get all bubbles that touch the passed in bubble
	getNeighbors = (bubble: IBubble) => {
		const neighbors: IBubble[] = [];

		// check each of the 6 directions by "moving" the bubble by a full
		// grid in each of the 6 directions (60 degree intervals)
		// @see https://www.redblobgames.com/grids/hexagons/#angles
		const dirs = [
			// right
			this.rotatePoint(this.grid, 0, 0),
			// up-right
			this.rotatePoint(this.grid, 0, this.degToRad(60)),
			// up-left
			this.rotatePoint(this.grid, 0, this.degToRad(120)),
			// left
			this.rotatePoint(this.grid, 0, this.degToRad(180)),
			// down-left
			this.rotatePoint(this.grid, 0, this.degToRad(240)),
			// down-right
			this.rotatePoint(this.grid, 0, this.degToRad(300))
		];

		for (let i = 0; i < dirs.length; i++) {
			const dir = dirs[i];

			const newBubble = {
				x: bubble.x + dir.x,
				y: bubble.y + dir.y,
				radius: bubble.radius
			};
			const neighbor = this.getClosestBubble(newBubble, true);
			if (neighbor && neighbor !== bubble && !neighbors.includes(neighbor)) {
				neighbors.push(neighbor);
			}
		}

		return neighbors;
	}

	// remove bubbles that create a match of 3 colors
	removeMatch = (targetBubble: IBubble) => {
		const matches = [targetBubble];

		this.bubbles.forEach(bubble => bubble.processed = false);
		targetBubble.processed = true;

		// loop over the neighbors of matching colors for more matches
		let neighbors = this.getNeighbors(targetBubble);
		for (let i = 0; i < neighbors.length; i++) {
			const neighbor = neighbors[i];

			if (!neighbor.processed) {
				neighbor.processed = true;

				if (neighbor.color === targetBubble.color) {
					matches.push(neighbor);
					neighbors = neighbors.concat(this.getNeighbors(neighbor));
				}
			}
		}

		if (matches.length >= 3) {
			matches.forEach(bubble => {
				bubble.active = false;
			});
		}
	}

	// make any floating bubbles (bubbles that don't have a bubble chain
	// that touch the ceiling) drop down the screen
	dropFloatingBubbles = () => {
		const activeBubbles = this.bubbles.filter(bubble => bubble.active);
		activeBubbles.forEach(bubble => bubble.processed = false);

		// start at the bubbles that touch the ceiling
		let neighbors = activeBubbles
			.filter(bubble => bubble.y - this.grid <= this.wallSize);

		// process all bubbles that form a chain with the ceiling bubbles
		for (let i = 0; i < neighbors.length; i++) {
			const neighbor = neighbors[i];

			if (!neighbor.processed) {
				neighbor.processed = true;
				neighbors = neighbors.concat(this.getNeighbors(neighbor));
			}
		}

		// any bubble that is not processed doesn't touch the ceiling
		activeBubbles
			.filter(bubble => !bubble.processed)
			.forEach(bubble => {
				bubble.active = false;
				// create a particle bubble that falls down the screen
				this.particles.push({
					x: bubble.x,
					y: bubble.y,
					color: bubble.color,
					radius: bubble.radius,
					active: true
				});
			});
	}

	// reset the bubble to shoot to the bottom of the screen
	getNewBubble = () => {
		this.curBubble.x = this.curBubblePos.x;
		this.curBubble.y = this.curBubblePos.y;
		this.curBubble.dx = this.curBubble.dy = 0;

		const existingColors = this.bubbles.filter(bubble => bubble.active && bubble.color)
			.map(({ color }) => color)
			.reduce((colors: string[], color?: string) => !color || colors.includes(color) ? colors : [...colors, color], []);

		const randInt = this.getRandomInt(0, existingColors.length - 1);
		this.curBubble.color = existingColors[randInt];

		// End game check
		if (existingColors.length === 0) {
			this.endGameCallback();
			this.rAF && window.cancelAnimationFrame(this.rAF);
		}
	}

	// handle collision between the current bubble and another bubble
	handleCollision = (bubble: IBubble) => {
		bubble.color = this.curBubble.color;
		bubble.active = true;
		this.removeMatch(bubble);
		this.dropFloatingBubbles();
		this.getNewBubble();
	}

	// game loop
	loop = () => {
		this.rAF = requestAnimationFrame(this.loop);
		this.context.drawImage(this.assetsManager.get('background.minigame'), 0, 0, this.canvasBoundingRect.width, this.canvasBoundingRect.height);

		this.update();
		this.rAF && this.draw();
	}

	update = () => {
		// move the shooting arrow
		this.shootDeg += this.degToRad(2) * this.shootDir;

		// prevent shooting arrow from going below/above min/max
		if (this.shootDeg < this.minDeg) {
			this.shootDeg = this.minDeg;
		}
		else if (this.shootDeg > this.maxDeg) {
			this.shootDeg = this.maxDeg
		}

		// move current bubble by it's velocity
		this.curBubble.x += this.curBubble.dx;
		this.curBubble.y += this.curBubble.dy;

		// prevent bubble from going through walls by changing its velocity
		if (this.curBubble.x - this.grid / 2 < this.wallSize) {
			this.curBubble.x = this.wallSize + this.grid / 2;
			this.curBubble.dx *= -1;
		}
		else if (this.curBubble.x + this.grid / 2 > this.size.width - this.wallSize) {
			this.curBubble.x = this.size.width - this.wallSize - this.grid / 2;
			this.curBubble.dx *= -1;
		}

		// check to see if bubble collides with the top wall
		if (this.curBubble.y - this.grid / 2 < this.wallSize) {
			// make the closest inactive bubble active
			const closestBubble = this.getClosestBubble(this.curBubble);
			closestBubble && this.handleCollision(closestBubble);
		}

		// check to see if bubble collides with another bubble
		for (let i = 0; i < this.bubbles.length; i++) {
			const bubble = this.bubbles[i];

			if (bubble.active && this.collides(this.curBubble, bubble)) {
				const closestBubble = this.getClosestBubble(this.curBubble);
				if (!closestBubble) {
					this.showGameOver();
				}

				if (closestBubble) {
					this.handleCollision(closestBubble);
				}
			}
		}

		// move bubble particles
		this.particles.forEach(particle => {
			particle.y += 8;
		});

		// remove particles that went off the screen
		this.particles = this.particles.filter(particles => particles.y < this.size.height - this.grid / 2);
	}

	showGameOver() {
		this.rAF && cancelAnimationFrame(this.rAF);
		this.rAF = null;
		const xShift = this.canvasBoundingRect.width / 2 - (this.size.width / 2);

		this.context.fillStyle = 'black';
		this.context.globalAlpha = 0.75;
		this.context.fillRect(0, this.size.height / 2 - 30, this.canvasBoundingRect.width, 80);

		this.context.globalAlpha = 1;
		this.context.fillStyle = 'white';
		this.context.font = '36px monospace';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('О неет, игрушки..', xShift + this.size.width / 2, this.size.height / 2);

		this.context.fillStyle = 'white';
		this.context.font = '16px monospace';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('Нажмите Esc', xShift + this.size.width / 2, this.size.height / 2 + 30);

	}
	
	draw = () => {
		const xShift = this.canvasBoundingRect.width / 2 - (this.size.width / 2);

		// draw walls
		this.context.fillStyle = 'lightgrey';
		this.context.fillRect(xShift, 0, this.size.width, this.wallSize);
		this.context.fillRect(xShift, 0, this.wallSize, this.size.height);
		this.context.fillRect(xShift + this.size.width - this.wallSize, 0, this.wallSize, this.size.height);

		// draw bubbles and particles
		this.bubbles.concat(this.particles).forEach(bubble => {
			if (!bubble.active) return;
			// draw a circle
			if (bubble.color) {
				const asset = this.assetsManager.get(`bubbles.${this.colors.indexOf(bubble.color) + 1}`);
				asset && this.context.drawImage(asset, xShift + bubble.x - bubble.radius, bubble.y - bubble.radius, 2 * bubble.radius, 2 * bubble.radius )
			}
		});

		// draw fire arrow. since we're rotating the canvas we need to save
		// the state and restore it when we're done
		this.context.save();

		// move to the center of the rotation (the middle of the bubble)
		this.context.translate(xShift + this.curBubblePos.x, this.curBubblePos.y);
		this.context.rotate(this.shootDeg);

		// move to the top-left corner of or fire arrow
		this.context.translate(0, -this.grid / 2 * 4.5);

		// draw arrow ↑
		this.context.strokeStyle = 'black';
		this.context.lineWidth = 2;
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.lineTo(0, this.grid * 2);
		this.context.moveTo(0, 0);
		this.context.lineTo(-10, this.grid * 0.4);
		this.context.moveTo(0, 0);
		this.context.lineTo(10, this.grid * 0.4);
		this.context.stroke();

		this.context.restore();

		// draw current bubble
		if (this.curBubble.color) {
			const asset = this.assetsManager.get(`bubbles.${this.colors.indexOf(this.curBubble.color) + 1}`);
			asset && this.context.drawImage(asset, xShift + this.curBubble.x - this.curBubble.radius, this.curBubble.y - this.curBubble.radius, 2 * this.curBubble.radius, 2 * this.curBubble.radius)
		}
	}

	release = () => {
		this.rAF && window.cancelAnimationFrame(this.rAF);
		this.stopListeningControls();
		this.endGameCallback();
	}

	initControlsListeners = () => {
		this.controlsEvents = [
			{ action: 'keydown', event: new ControlsEvent(['ArrowRight', 'KeyD'], this.handleMoveRight) },
			{ action: 'keydown', event: new ControlsEvent(['ArrowLeft', 'KeyA'], this.handleMoveLeft) },
			{ action: 'keydown', event: new ControlsEvent(['Space'], this.handleShoot) },
			{ action: 'keydown', event: new ControlsEvent(['Escape'], this.release) },
			{ action: 'keyup', event: new ControlsEvent(['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'], this.handleMoveStop) },
		];
	}

	startListeningControls = () => this.controlsEvents
			.map(({ action, event }) => this.controlsManager.addEventListener(action, event));

	stopListeningControls = () => this.controlsEvents
		.map(({ event }) => this.controlsManager.removeEventListener(event));

	handleShoot = () => {
		if (this.curBubble.dx === 0 && this.curBubble.dy === 0) {
			this.curBubble.dx = Math.sin(this.shootDeg) * this.curBubble.speed;
			this.curBubble.dy = -Math.cos(this.shootDeg) * this.curBubble.speed;
		}
	}

	handleMoveLeft = () => this.shootDir = -1;
	handleMoveRight = () => this.shootDir = 1;
	handleMoveStop = () => this.shootDir = 0;
}