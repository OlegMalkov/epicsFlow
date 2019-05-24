/* @flow */

const moveDiffFactory = (fn) => (degree: number, movedDistance: number) =>
	Math.round(fn(degree * Math.PI / 180) * 100) / 100 * movedDistance
const xMoveDiff = moveDiffFactory(Math.cos)
const yMoveDiff = moveDiffFactory(Math.sin)
const updateEachMapValue = <V, O: { [string]: V }>(updater: V => V, obj: O): O => {
	return (Object.keys(obj).reduce((acc, k) => {
		acc[k] = updater(obj[k])
		return acc
	}, {}): any)
}

const getObjectValues = <V, O: { [string]: V }>(obj: O): Array<V> => {
	return (Object.values(obj): any)
}

export {
	xMoveDiff,
	yMoveDiff,
	updateEachMapValue,
	getObjectValues,
}
