export class SoundManager {
	sounds: { [key: string]: HTMLAudioElement } = {};
	get = async (path: string, format: 'mp3' | 'wav' = 'mp3') => this.sounds[path] || await this.loadSound(path, format);

	loadSounds = async (paths: string[]) => {
		const sound = await Promise.all(paths.map((path: string) => this.loadSound(path)));
		paths.map((path, index) => this.sounds[path] = sound[index]);
	}

	loadSound = (path: string, format: 'mp3' | 'wav' = 'mp3') => new Promise<HTMLAudioElement>((resolve) => {
		const sound = document.createElement("audio"); 
		
		sound.src = `${import.meta.env.DEV ? '' : '/new-year-game'}/assets/music/holiday_game_theme.mp3`;
		sound.setAttribute("preload", "auto");
		sound.setAttribute("controls", "none");
		sound.setAttribute("loop", "true");
		sound.volume = 0.05;
		sound.style.display = "none";
		document.body.appendChild(sound);

	});

}
