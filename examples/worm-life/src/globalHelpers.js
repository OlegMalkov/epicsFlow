// @flow

import * as R from 'ramda'
import { type AnyValueType } from '../../../src/epics'
import { type PositionType } from './types'
import { type ScriptDataType } from './models/World'


function angleBetween2Points(point1: PositionType, point2: PositionType) {
	const dy = point2.y - point1.y
	const dx = point2.x - point1.x

	let theta = Math.atan2(dy, dx)

	theta *= 180 / Math.PI

	return theta < 0 ? 360 + theta : theta
}

const getDistanceBetweenPoints = (p1: PositionType, p2: PositionType) =>
	Math.hypot(p1.x - p2.x, p1.y - p2.y)

const applesSortedByDistance = (data: ScriptDataType): ScriptDataType => {

	mutableApples.sort((a1, a2) => getDistanceBetweenPoints(a2.position, position)
		- getDistanceBetweenPoints(a1.position, position))

	return mutableApples[mutableApples.length - 1]
}

const remember = (key: string, value: AnyValueType) => (data: ScriptDataType) => {
    return {
        ...data,
        me: { ...data.me, memory: { ...data.me.memory, [key]: value }}
    }
}


if (typeof window !== 'undefined') {
	Object.assign(window, {
		angleBetween2Points,
		getClosestApple,
		getDistanceBetweenPoints,
		...R,
	})
}

export {
	angleBetween2Points,
	getDistanceBetweenPoints,
    getClosestApple,
    remember,
}
