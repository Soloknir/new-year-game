import type Circle from "./Circle";
import type Player from "./Characters/Player";
import type Platform from "./Platform";
import type Snowman from "./Characters/Snowman";

type RectangularType = Player | Snowman | Platform;
type RoundType = Circle;
type GameObjectType = RectangularType | RoundType;


export type {
	RectangularType,
	RoundType,
	GameObjectType
}
