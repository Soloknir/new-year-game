/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid';

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

export class ControlsManager {
	events: { [key: string]: ControlsEvent[] } = {};

	getHandler = (action: string) => (event: any) => {
		this.events[action]?.filter(({ keys }) => keys.includes(event.code)).map(({ callback }) => callback());
	}

	addEventListener = (action: string, event: ControlsEvent) => {
		if (this.events[action]) {
			this.events[action].push(event);	
		} else {
			this.events[action] = [event];
			window.addEventListener(action, this.getHandler(action));
		}
	}

	removeAllListeners = () => {
		Object.keys(this.events).forEach((action) => window.removeEventListener(action, this.getHandler(action)));
		this.events = {};
	}

	removeEventListener = (event: ControlsEvent) => {
		Object.keys(this.events).forEach((action) => {
			this.events[action] = this.events[action].filter(({ id }) => event.id === id);
			if (this.events[action].length === 0) {
				window.removeEventListener(action, this.getHandler(action));
			}		
		});
	}
}
