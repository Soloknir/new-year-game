const easeInOutQuint = (t: number, b: number, c: number, d: number) => {
	if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
	return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
}

const easeLinear = (t: number, b: number, c: number, d: number) => {
	return (c * t) / d + b;
}

export {
	easeInOutQuint,
	easeLinear
}