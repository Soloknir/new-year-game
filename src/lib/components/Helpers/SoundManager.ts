import { BASE_URL } from "../Constants";

export class SoundManager {
	sounds: { [key: string]: HTMLAudioElement } = {};
	get = async (path: string, format: 'mp3' | 'wav' = 'mp3') => this.sounds[path] || await this.loadSound(path, format);

	loadSounds = async (paths: string[]) => {
		const sound = await Promise.all(paths.map((path: string) => this.loadSound(path)));
		paths.map((path, index) => this.sounds[path] = sound[index]);
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
