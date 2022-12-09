
export default class AssetManager {
	assets: { [key: string]: HTMLImageElement } = {};
	get = async (path: string, format: 'png' | 'jpg' = 'png') => this.assets[path] || await this.loadAsset(path, format);

	loadAssets = async (paths: string[]) => {
		const assets = await Promise.all(paths.map((path: string) => this.loadAsset(path)));
		paths.map((path, index) => this.assets[path] = assets[index]);
	}

	loadAsset = (path: string, format: 'png' | 'jpg' = 'png') => new Promise<HTMLImageElement>((resolve) => {
		const image = new Image();
		image.src = `${import.meta.env.DEV ? '' : '/new-year-game'}/assets/${path}.${format}`;
		image.onload = () => resolve(image);
	});
}