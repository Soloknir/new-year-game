import type Circle from "../Objects/Circle";
import type Rectangle from "../Objects/Rectangle";
import type Player from "../Objects/Player";
import type { Vector2D } from "../Vector";
import type StaticPlatform from "../Objects/StaticPlatform";
import type { RoundType } from "../Objects/Types";

const detectRectIntersect = (r1: Rectangle | Player | StaticPlatform, r2: Rectangle | Player | StaticPlatform): boolean => {
	return !(r2.vCoordinates.x > r1.width + r1.vCoordinates.x
		|| r1.vCoordinates.x > r2.width + r2.vCoordinates.x
		|| r2.vCoordinates.y > r1.height + r1.vCoordinates.y
		|| r1.vCoordinates.y > r2.height + r2.vCoordinates.y
	);
}

const detectRectCircleIntersect = (rect: Rectangle | Player | StaticPlatform, circle: Circle): boolean => {
	const vTestCoordinates: Vector2D = circle.vCoordinates.getCopy();
	const { width, height } = rect;

	vTestCoordinates.x = (circle.vCoordinates.x < rect.vCoordinates.x)
		? rect.vCoordinates.x // left edge
		: (circle.vCoordinates.x > rect.vCoordinates.x + width)
			? rect.vCoordinates.x + width // right edge
			: vTestCoordinates.x;

	vTestCoordinates.y = (circle.vCoordinates.y < rect.vCoordinates.y)
		? rect.vCoordinates.y	// top edge
		: (circle.vCoordinates.y > rect.vCoordinates.y + height)
			? rect.vCoordinates.y + height // bottom edge
			: vTestCoordinates.y;

	return circle.vCoordinates.getDistance(vTestCoordinates) <= circle.radius;
}

const detectCircleIntersect = (c1: RoundType, c2: RoundType): boolean => {
	return c1.vCoordinates.getDistance(c2.vCoordinates) <= (c1.radius + c2.radius);
}

export {
	detectRectIntersect,
	detectRectCircleIntersect,
	detectCircleIntersect
}