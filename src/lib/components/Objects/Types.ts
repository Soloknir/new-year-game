import type Circle from "./Circle";
import type Player from "./Player";
import type Rectangle from "./Rectangle";
import type StaticPlatform from "./StaticPlatform";

type RectangularType = Player | Rectangle | StaticPlatform;
type RoundType = Circle;
type GameObjectType = RectangularType | RoundType;

const isInstanceOfRectangular = (obj: GameObjectType) => 'width' in obj && 'height' in obj;
const isInstanceOfRound = (obj: GameObjectType) => 'radius' in obj;

export type {
	RectangularType,
	RoundType,
	GameObjectType
}

export {
	isInstanceOfRectangular,
	isInstanceOfRound
}