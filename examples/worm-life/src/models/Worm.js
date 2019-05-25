/* @flow strict */

import { type PositionType } from '../types'
import { type RgbaColorType, rgbaColorRed } from './RgbaColor'
import { xMoveDiff, yMoveDiff } from '../utils'

opaque type WormType: {|
    name: string,
    speed: number,
    size: number,
	vision: number,
	color: RgbaColorType,
    position: PositionType,
    headingDegree: number,
	applesEaten: number,
	subconsciousScript: string,
	subconsciousError: string,
	collisionAnimationCounter: number,
	bounceBackDistance: number,
	attributesCapacity: number,
	move: bool,
|} = {|
    name: string,
    speed: number,
    size: number,
	vision: number,
	color: RgbaColorType,
    position: PositionType,
    headingDegree: number,
	applesEaten: number,
	subconsciousScript: string,
	subconsciousError: string,
	collisionAnimationCounter: number,
	bounceBackDistance: number,
	attributesCapacity: number,
	move: bool,
|}

type WormSubconsciousScriptResultType = {|
	speed: number,
	size: number,
	vision: number,
	headingDegree: number,
	move: bool,
|}

const wormDefaultSubconsciousScript = `({ world, self }) => {
	const apple = getClosestApple(world.apples, self.position)

	if (!apple) return { speed: 500, vision: 2000, size: 1, move: true }
	const headingDegree = angleBetween2Points(self.position, apple.position)
	const distanceToApple = getDistanceBetweenPoints(self.position, apple.position)

	return ({ 
		move: Math.floor(headingDegree) === Math.floor(self.headingDegree) ? true : false,
		headingDegree,
		vision: distanceToApple * 1.2,
		speed: distanceToApple > apple.size + 10 ? 2000 : 1,
		size: distanceToApple > apple.size + 10 ? 1 : 2000 / Math.sqrt(getDistanceBetweenPoints(self.position, apple.position))
	})
}`

const initialWormAttributesCapacity = 300
const createWorm = ({ name, speed = 100, size = 100, vision = 100 }: {|
    name: string,
    speed?: number,
    size?: number,
    vision?: number,
|}): WormType | null => {
	if (!name || speed + size + vision !== initialWormAttributesCapacity) return null

	return {
		name,
		speed,
		size,
		vision,
		color: rgbaColorRed,
		position: { x: -1, y: -1 },
		headingDegree: 45,
		applesEaten: 0,
		subconsciousScript: wormDefaultSubconsciousScript,
		subconsciousError: '',
		collisionAnimationCounter: 0,
		bounceBackDistance: 0,
		attributesCapacity: initialWormAttributesCapacity,
		move: true,
	}
}

const setWormSubconsciousError = (error: string) => (worm: WormType): WormType => {
	return { ...worm, subconsciousError: error }
}

const setWormPosition = (position: PositionType) => (worm: WormType): WormType => {
	return { ...worm, position }
}

const setWormMove = (move: bool) => (worm: WormType): WormType => {
	return { ...worm, move }
}

const feedWorm = (amount: number) => (worm: WormType): WormType => {
	const digestedAmount = amount / 10

	return {
		...worm,
		attributesCapacity: worm.attributesCapacity + digestedAmount,
		size: worm.size + digestedAmount,
	}
}

const setWormHeadingDegree = (headingDegree: number) => (worm: WormType): WormType => {
	return { ...worm, headingDegree }
}

const getWormLine = (worm: WormType): {| x: number, y: number, xe: number, ye: number |} => {
	return {
		x: worm.position.x,
		y: worm.position.y,
		xe: worm.position.x + xMoveDiff(worm.headingDegree, -worm.size),
		ye: worm.position.y + yMoveDiff(worm.headingDegree, -worm.size),
	}
}

const setWormBounceBackDistance = (distance: number) => (worm: WormType): WormType => {
	return { ...worm, bounceBackDistance: distance }
}

function checkLineIntersection(
	line1StartX: number,
	line1StartY: number,
	line1EndX: number,
	line1EndY: number,
	line2StartX: number,
	line2StartY: number,
	line2EndX: number,
	line2EndY: number
) {
	const denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY))

	if (denominator === 0) {
		return false
	}
	let a = line1StartY - line2StartY

	let b = line1StartX - line2StartX

	const numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b)
	const numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b)

	a = numerator1 / denominator
	b = numerator2 / denominator

	return a > 0 && a < 1 && b > 0 && b < 1
}

function isWormCollide(worm1: WormType, worm2: WormType): bool {
	const { x: x0, y: y0, xe: x0e, ye: y0e } = getWormLine(worm1)
	const { x: x1, y: y1, xe: x1e, ye: y1e } = getWormLine(worm2)

	return checkLineIntersection(x0, y0, x0e, y0e, x1, y1, x1e, y1e)
}

function setWormColisionAnimation (worm: WormType): WormType {
	return ({ ...worm, collisionAnimationCounter: 80 }: WormType)
}

function decreaseWormColisionAnimation (worm: WormType): WormType {
	return ({ ...worm, collisionAnimationCounter: worm.collisionAnimationCounter - 2 }: WormType)
}

const MinAttributeValue = 25
const tickDiff = 0.3

const setWormDesiredAttributes = ({ speed, size, vision }: {| speed: number, size: number, vision: number |}) =>
	(_worm: WormType): WormType => {
		let worm = _worm

		const calcFreePoints = () => worm.attributesCapacity - worm.speed - worm.size - worm.vision

		const totalDesiredPoints = speed + size + vision
		const idealSpeed = worm.attributesCapacity * speed / totalDesiredPoints
		const idealSize = worm.attributesCapacity * size / totalDesiredPoints
		const idealVision = worm.attributesCapacity * vision / totalDesiredPoints

		if (worm.speed > idealSpeed && worm.speed > MinAttributeValue) {
			worm = { ...worm, speed: worm.speed - tickDiff }
		}
		if (worm.size > idealSize && worm.size > MinAttributeValue) {
			worm = { ...worm, size: worm.size - tickDiff }
		}
		if (worm.vision > idealVision && worm.vision > MinAttributeValue) {
			worm = { ...worm, vision: worm.vision - tickDiff }
		}
		if (calcFreePoints() > 0 && worm.speed < idealSpeed) {
			worm = { ...worm, speed: worm.speed + tickDiff }
		}
		if (calcFreePoints() > 0 && worm.size < idealSize) {
			worm = { ...worm, size: worm.size + tickDiff }
		}
		if (calcFreePoints() > 0 && worm.vision < idealVision) {
			worm = { ...worm, vision: worm.vision + tickDiff }
		}

		return worm
	}

// eslint-disable-next-line import/group-exports
export type {
	WormType,
	WormSubconsciousScriptResultType,
}

// eslint-disable-next-line import/group-exports
export {
	createWorm,
	setWormPosition,
	setWormHeadingDegree,
	isWormCollide,
	setWormColisionAnimation,
	decreaseWormColisionAnimation,
	setWormBounceBackDistance,
	feedWorm,
	setWormSubconsciousError,
	setWormDesiredAttributes,
	setWormMove,
}
