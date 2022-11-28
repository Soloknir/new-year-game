import type Circle from "../Objects/Circle";
import type Rectangle from "../Objects/Rectangle";
import type Player from "../Objects/Player";

const detectRectIntersect = (r1: Rectangle | Player, r2: Rectangle | Player): boolean => {
	// Check x and y for overlap
	if (r2.vCoordinates.x > r1.width + r1.vCoordinates.x
		|| r1.vCoordinates.x > r2.width + r2.vCoordinates.x
		|| r2.vCoordinates.y > r1.height + r1.vCoordinates.y
		|| r1.vCoordinates.y > r2.height + r2.vCoordinates.y
	) {
		return false;
	}

	return true;
}

const detectRectCircleIntersect = (rect: Rectangle | Player, circle: Circle): boolean => {
	const { width, height } = rect;

	let testX = circle.vCoordinates.x, testY = circle.vCoordinates.y;

	if (circle.vCoordinates.x < rect.vCoordinates.x) testX = rect.vCoordinates.x;	// left edge
	else if (circle.vCoordinates.x > rect.vCoordinates.x + width) testX = rect.vCoordinates.x + width;		// right edge

	if (circle.vCoordinates.y < rect.vCoordinates.y) testY = rect.vCoordinates.y;	// top edge
	else if (circle.vCoordinates.y > rect.vCoordinates.y + height) testY = rect.vCoordinates.y + height;	// bottom edge

	const distX = circle.vCoordinates.x - testX;
	const distY = circle.vCoordinates.y - testY;
	const distance = Math.sqrt((distX * distX) + (distY * distY));

	return distance <= circle.radius;
}

const detectCircleIntersect = (c1: Circle, c2: Circle): boolean => {
	// Calculate the distance between the two circles
	const squareDistance = c1.vCoordinates.getDistance(c2.vCoordinates);

	// When the distance is smaller or equal to the sum
	// of the two radius, the circles touch or overlap
	return squareDistance <= (c1.radius + c2.radius);
}

export {
	detectRectIntersect,
	detectRectCircleIntersect,
	detectCircleIntersect
}