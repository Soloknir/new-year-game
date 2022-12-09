/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid';

export class ControlsEvent {
	id: string;
	keys: string[];
	callback: () => void;

	handler?: any;

	constructor(keys: string[], callback: () => void) {
		this.id = uuid();
		this.keys = keys;
		this.callback = callback;
	}
}

export class ControlsManager {
	events: { [key: string]: ControlsEvent[] } = {};

	handler = (actionType: string) => (event: any) => {
		this.events[actionType]?.filter(({ keys }) => keys.includes(event.code)).map(({ callback }) => callback());
	}

	addEventListener = (action: string, event: ControlsEvent) => {
		this.events[action] = this.events[action] ? [...this.events[action], event] : [event];
		event.handler = this.handler(action)
		window.addEventListener(action, event.handler);
	}

	removeAllListeners = () => {
		Object.keys(this.events).forEach((action) => {
			this.events[action].forEach((event) => window.removeEventListener(action, event.handler))
		});

		this.events = {};
	}

	removeEventListener = (event: ControlsEvent) => {
		Object.keys(this.events).forEach((action) => {
			const index = this.events[action].findIndex(({ id }) => event.id === id);
			if (index > -1) {
				this.events[action].splice(index, 1);
				window.removeEventListener(action, event.handler);
				return;
			}
		});
	}
}
