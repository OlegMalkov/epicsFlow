/* @flow */

function getRandomInt_IMPURE(min: number, max: number) {
	const ceiledMin = Math.ceil(min)
	const flooredMax = Math.floor(max)

	return Math.floor(Math.random() * (flooredMax - ceiledMin + 1)) + ceiledMin
}

export {
	getRandomInt_IMPURE,
}
