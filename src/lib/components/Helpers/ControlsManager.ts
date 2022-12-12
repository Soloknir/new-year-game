/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid';

export interface IUseControls {
	controlsManager: ControlsManager;
	controlsEvents: { action: string, event: ControlsEvent }[];
	initControlsListeners: () => void;
	startListeningControls: () => void;
	stopListeningControls: () => void;
}

export class ControlsEvent {
	id: string;
	keys: string[];
	callback: () => void;

	constructor(keys: string[], callback: () => void) {
		this.id = uuid();
		this.keys = keys;
		this.callback = callback;
	}
}

export default class ControlsManager {
	private static _instance: ControlsManager;

	events: { [key: string]: ControlsEvent[] } = {};

	private constructor() {
		window.addEventListener('keydown', this.getHandler('keydown'));
		window.addEventListener('keyup', this.getHandler('keyup'));
	}

	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	getHandler = (action: string) => (event: any) => {
		this.events[action]?.filter(({ keys }) => keys.includes(event.code)).map(({ callback }) => callback());
	};

	addEventListener = (action: string, event: ControlsEvent) => {
		if (this.events[action]) {
			this.events[action].push(event);	
		} else {
			this.events[action] = [event];
		}
	}

	removeEventListener = (event: ControlsEvent) => {
		Object.keys(this.events).forEach((action) => {
			this.events[action] = this.events[action].filter(({ id }) => event.id !== id);
		});
	}
}
