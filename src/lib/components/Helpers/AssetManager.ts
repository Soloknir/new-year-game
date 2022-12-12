export interface IUseAssets {
	assetsManager: AssetManager;
	loadAssets: () => void;
}

export default class AssetManager {
	private assets: { [key: string]: HTMLImageElement } = {};

	get = (path: string) => this.assets[path];

	loadAssets = async (assets: { path: string, format: 'png' | 'jpg' }[]) => {
		const loadedAssets = await Promise.all(assets.map(({ path, format }) => this.loadAsset(path, format)));
		assets.map(({ path }, index) => this.assets[path] = loadedAssets[index]);
	}

	loadAsset = (path: string, format: 'png' | 'jpg' = 'png') => new Promise<HTMLImageElement>((resolve) => {
		const image = new Image();
		image.src = `${import.meta.env.DEV ? '' : '/new-year-game'}/assets/${path}.${format}`;
		image.onload = () => resolve(image);
	});
}