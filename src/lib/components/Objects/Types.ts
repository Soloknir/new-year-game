import type Circle from "./Circle";
import type Player from "./Characters/Player";
import type Platform from "./Platform";
import type Santa from "./Characters/Santa";

type RectangularType = Player | Santa | Platform;
type RoundType = Circle;
type GameObjectType = RectangularType | RoundType;


export type {
	RectangularType,
	RoundType,
	GameObjectType
}
