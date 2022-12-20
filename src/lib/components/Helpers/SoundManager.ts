import { BASE_URL } from "../Constants";

export class SoundManager {
	private static _instance: SoundManager;
	sounds: { [key: string]: HTMLAudioElement } = {};

	private constructor() { /**/ }

	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get = (path: string) => this.sounds[path];

	loadSounds = async (sounds: { path: string, format: 'mp3' | 'wav' }[]) => {
		const sound = await Promise.all(sounds.map(({ path, format }) => this.loadSound(path, format)));
		sounds.map(({ path }, index) => this.sounds[path] = sound[index]);
	}

	loadSound = (path: string, format: 'mp3' | 'wav' = 'mp3') => new Promise<HTMLAudioElement>((resolve) => {
		const sound = new Audio(`${BASE_URL}/assets/music/${path}.${format}`);
		sound.preload = 'auto';
		sound.controls = false;
		sound.loop = true;
		sound.volume = 0.05;
		sound.onloadstart = () => resolve(sound);
	});

}
