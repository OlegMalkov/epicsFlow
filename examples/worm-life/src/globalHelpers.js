// @flow

import * as R from 'ramda'
import { type AnyValueType } from '../../../src/epics'
import { type PositionType } from './types'

const { assocPath, path, converge, evolve, always, tap, pipe, prop, head, identity, equals, when } = R

function angleBetween2Points(point1: PositionType, point2: PositionType) {
	const dy = point2.y - point1.y
	const dx = point2.x - point1.x

	let theta = Math.atan2(dy, dx)

	theta *= 180 / Math.PI

	return theta < 0 ? 360 + theta : theta
}

const getDistanceBetweenPoints = (p1: PositionType, p2: PositionType) =>
	Math.hypot(p1.x - p2.x, p1.y - p2.y)

/* const applesSortedByDistance = (data: ScriptDataType): ScriptDataType => {
	mutableApples.sort((a1, a2) => getDistanceBetweenPoints(a2.position, position)
		- getDistanceBetweenPoints(a1.position, position))

	return mutableApples[mutableApples.length - 1]
} */

const memoryPath = (key: string) => ['data', 'me', 'memory', key]
const remember = (key: string) => (value: AnyValueType) => assocPath(memoryPath(key), value)
const recall = (key: string) => path(memoryPath(key))
const recallConverge = converge(path, [memoryPath])

const makeSetter = prop => assocPath(['me', prop])

const setMove = makeSetter('move')
const startMove = setMove(true)
const stopMove = setMove(false)

const setSpeed = makeSetter('speed')
const setSize = makeSetter('size')
const setVision = makeSetter('vision')
const setHeading = makeSetter('headingDegree')
const setColor = makeSetter('color')
// print something for debugging
const p = tap(x => {
	// $FlowFixMe
	document.getElementById(`print_${window.name}`).innerText = JSON.stringify(x)
})

const pp = fn => pipe(fn, tap(x => {
	// $FlowFixMe
	document.getElementById(`print_${window.name}`).innerText = JSON.stringify(x)
}))

const say = (text) => tap(pp(always(text)))

setInterval(() => {
	Array.from(document.getElementsByClassName('print')).forEach(x => x.innerText = '')
}, 5000)

const setAll = (speed: number, size: number, vision: number, heading: number, move: bool) => evolve({
	me: {
		speed: always(speed),
		size: always(size),
		vision: always(vision),
		headingDegree: always(heading),
		move: always(move),
	},
})

const me = prop('me')
const heading = pipe(
	me,
	prop('headingDegree')
)
const world = prop('world')
const position = prop('position')
const apples = pipe(
	world,
	prop('apples')
)
const firstApple = pipe(
	apples,
	head
)
const myPosition = pipe(
	me,
	position
)
const firstApplePos = pipe(
	firstApple,
	position
)
const degreeToFirstApple = converge(
	angleBetween2Points,
	[myPosition, firstApplePos]
)
const turnToFirstApple = converge(
	setHeading,
	[degreeToFirstApple, identity]
)

const megaVision = pipe(
	setVision(1000),
	setSize(0),
	setSpeed(0)
)

const megaSize = pipe(
	setVision(0),
	setSize(1000),
	setSpeed(0)
)

const megaSpeed = pipe(
	setVision(0),
	setSize(0),
	setSpeed(1000)
)

const megaEater = pipe(
	setVision(0),
	setSize(1000),
	setSpeed(1000)
)

const megaExplorer = pipe(
	setVision(1000),
	setSize(0),
	setSpeed(1000)
)

const x = prop('x')
const y = prop('y')
const myPositionX = pipe(
	myPosition,
	x
)
const myPositionY = pipe(
	myPosition,
	y
)
const headingIs = degree => pipe(
	heading,
	equals(degree)
)
const startMoveIfHeadingIs =
heading => when(
	headingIs(heading),
	startMove
)

const globalKeys = []

if (typeof window !== 'undefined') {
	for (const i in window) {
		globalKeys.push(i)
	}
	Object.assign(window, {
		...R,

		angleBetween2Points,
		getDistanceBetweenPoints,

		startMove,
		stopMove,
		remember,
		recall,
		setSpeed,
		setSize,
		setVision,
		setHeading,
		setAll,
		setColor,

		rm: remember,
		rc: recall,
		spd: setSpeed,
		sz: setSize,
		vn: setVision,
		hd: setHeading,

		megaVision,
		megaSize,
		megaSpeed,
		megaEater,
		megaExplorer,

		p,
		pp,
		say,

		me,
		heading,
		world,
		apples,
		firstApple,
		x,
		y,
		myPositionX,
		myPositionY,
		headingIs,
		startMoveIfHeadingIs,

		position,
		firstApplePos,
		myPosition,
		degreeToFirstApple,
		turnToFirstApple,
	})
}

const globalsStub = `${globalKeys.map(k => `const ${k} = {};`).join('\n')}`

export {
	globalsStub,
	angleBetween2Points,
	getDistanceBetweenPoints,
	remember,
	recall,
	recallConverge,

	startMove,
	stopMove,

	setSpeed,
	setSize,
	setVision,
	setHeading,
	setAll,
	setColor,
}
