export interface IUseAssets {
	assetsManager: AssetManager;
}

export interface IAsset {
	key: string,
	path: string,
}

export default class AssetManager {
	private static _instance: AssetManager;
	private assets: { [key: string]: HTMLImageElement } = {};

	private constructor() { /**/ }

	public static get Instance() {
		return this._instance || (this._instance = new this());
	}

	get = (key: string) => this.assets[key];
	
	loadAssets = async (assets: IAsset[]) => {
		const loadedAssets = await Promise.all(assets.map(({ path }) => this.loadAsset(path)));
		assets.map(({ key }, index) => this.assets[key] = loadedAssets[index]);
	}

	private loadAsset = (path: string) => new Promise<HTMLImageElement>((resolve) => {
		const image = new Image();
		image.src = `${import.meta.env.DEV ? '' : '/new-year-game'}/assets/${path}`;
		image.onload = () => resolve(image);
	});
}