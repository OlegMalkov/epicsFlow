/* @flow strict */

import {
	type WormType,
	setWormPosition,
	setWormHeadingDegree,
	isWormCollide,
	setWormColisionAnimation,
	decreaseWormColisionAnimation,
	setWormBounceBackDistance,
	feedWorm,
} from './Worm'
import { type PositionType } from '../types'
import { xMoveDiff, yMoveDiff, updateEachMapValue, getObjectValues } from '../utils'
import { getRandomInt_IMPURE } from '../utils_IMPURE'

type AppleType = {|
	position: PositionType,
	size: number,
|}

opaque type WorldType: {|
    worms: { [name: string]: WormType },
    apples: Array<AppleType>,
    age: number,
|} = {|
    worms: { [name: string]: WormType },
    apples: Array<AppleType>,
    age: number,
|}

const worldInitialState: WorldType = {
	worms: {},
	apples: [],
	age: 0,
}

const WorldBoundaries = {
	left: 0,
	top: 0,
	right: 1000,
	bottom: 600,
}

const WorldDimensions = {
	width: WorldBoundaries.right - WorldBoundaries.left,
	height: WorldBoundaries.bottom - WorldBoundaries.top,
}

const getApplesAroundPosition = ({ searchRadius = 10, position, world }: {|
    searchRadius?: number, position: PositionType, world: WorldType,
|}): Array<AppleType> => {
	return world.apples.filter(apple =>
		Math.sqrt(
			Math.pow(apple.position.x - position.x, 2) + Math.pow(apple.position.y - position.y, 2)
		) < searchRadius
	)
}

const Gap = 10
const generateRandomWorldPosition_IMPURE = (): PositionType => ({
	x: getRandomInt_IMPURE(WorldBoundaries.left + Gap, WorldBoundaries.right - Gap),
	y: getRandomInt_IMPURE(WorldBoundaries.top + Gap, WorldBoundaries.bottom - Gap),
})

const generateFreeSpawnPosition_IMPURE = (world: WorldType): PositionType | null => {
	let position: PositionType = generateRandomWorldPosition_IMPURE()

	let tries = 1

	while (getApplesAroundPosition({ position, world }).length > 0) {
		position = generateRandomWorldPosition_IMPURE()
		tries ++
	}

	if (tries > 100) return null

	return position
}

const spawnWorm = (worm: WormType, spawnPosition: PositionType) => (world: WorldType): ?WorldType => {
	if (world.hasOwnProperty(worm.name)) return null

	return { ...world, worms: { ...world.worms, [worm.name]: setWormPosition(spawnPosition)(worm) } }
}

const spawnApple = (spawnPosition: PositionType) => (world: WorldType): WorldType => {
	return { ...world, apples: [...world.apples, { position: spawnPosition, size: 10 }] }
}

const growApples = (world: WorldType): WorldType => {
	return { ...world, apples: world.apples.map(apple => ({ ...apple, size: apple.size + 1 })) }
}

const outOfWorld = (position: PositionType) =>
	position.x >= WorldBoundaries.right ||
	position.x <= WorldBoundaries.left	||
	position.y >= WorldBoundaries.bottom ||
	position.y <= WorldBoundaries.top

const colisionWithOtherWorms = (worm, otherWorms) =>
	otherWorms.find(w => isWormCollide(worm, w))

const moveWorm = (movedDistance: number) => (worm: WormType) => setWormPosition({
	x: worm.position.x + xMoveDiff(worm.headingDegree, movedDistance),
	y: worm.position.y + yMoveDiff(worm.headingDegree, movedDistance),
})(worm)

const turnWormBack = (worm: WormType) => setWormHeadingDegree(worm.headingDegree + 180)(worm)

const collisionWithApple = (worm: WormType, apples: Array<AppleType>): number => {
	const wormMouthSize = worm.size / 15

	return apples.indexOf(
		apples.find(apple => {
			const r = apple.size / 2
			const dx = worm.position.x - apple.position.x
			const dy = worm.position.y - apple.position.y
			const d = Math.sqrt((dy*dy) + (dx*dx))

			return !(d > (r + wormMouthSize) || d < Math.abs(wormMouthSize - r))
		})
	)
}
const moveWorms = (world: WorldType): WorldType => {
	const wormsNamesToShowCollision = []
	const appleBaits = world.apples.map(() => 0)

	let updatedWorms = updateEachMapValue(_worm => {
		let worm = _worm

		const collisionAppleIndex = collisionWithApple(worm, world.apples)
		const apple = world.apples[collisionAppleIndex]

		if (worm.bounceBackDistance > 0) {
			worm = turnWormBack(worm)
			const moveBackDistance = Math.max(1, worm.bounceBackDistance / 30)

			worm = setWormBounceBackDistance(worm.bounceBackDistance - moveBackDistance)(worm)
			worm = moveWorm(moveBackDistance)(worm)
			worm = turnWormBack(worm)
		} else if (apple) {
			const baitSize = Math.min(apple.size, worm.size / 300)

			worm = feedWorm(baitSize)(worm)
			appleBaits[collisionAppleIndex] += baitSize
		} else if (worm.speed !== 0) {
			worm = setWormHeadingDegree(worm.headingDegree + 0.5)(worm)
			worm = moveWorm(Math.max(0, (worm.speed - (worm.size / 2 - 50))) / 100)(worm)
		}

		if (outOfWorld(worm.position)) {
			worm = turnWormBack(worm)
			worm = moveWorm(worm.speed / 50)(worm)
		}

		const otherWorms = getObjectValues(world.worms).filter(w => w.name !== worm.name)
		const otherWormColision = colisionWithOtherWorms(worm, otherWorms)

		if (otherWormColision && worm.bounceBackDistance <= 0) {
			if (otherWormColision.size > worm.size) {
				worm = setWormBounceBackDistance(otherWormColision.size - worm.size)(worm)
				wormsNamesToShowCollision.push(otherWormColision.name)
			}
		}

		if (worm.position.x < 0) {
			worm = setWormPosition({ x: 10, y: worm.position.y })(worm)
		}
		if (worm.position.x > WorldBoundaries.right) {
			worm = setWormPosition({ x: WorldBoundaries.right - 10, y: worm.position.y })(worm)
		}
		if (worm.position.y < 0) {
			worm = setWormPosition({ y: 0, x: worm.position.x })(worm)
		}
		if (worm.position.y > WorldBoundaries.bottom) {
			worm = setWormPosition({ y: WorldBoundaries.bottom - 10, x: worm.position.x })(worm)
		}

		return worm
	}, world.worms)

	updatedWorms = updateEachMapValue(worm => {
		if (wormsNamesToShowCollision.includes(worm.name)) {
			return setWormColisionAnimation(worm)
		}
		return worm
	}, updatedWorms)

	let updatedApples = world.apples.map((apple, index) => {
		if (appleBaits[index] > 0) {
			return { ...apple, size: apple.size - appleBaits[index] }
		}
		return apple
	})

	updatedApples = updatedApples.filter(apple => apple.size > 1)

	return { ...world, worms: updatedWorms, apples: updatedApples }
}

const decreaseCollisionAnimationCounter = (world: WorldType): WorldType => {
	const updatedWorms = updateEachMapValue(worm => {
		if (worm.collisionAnimationCounter === 0) {
			return worm
		}

		return decreaseWormColisionAnimation(worm)
	}, world.worms)

	return {
		...world,
		worms: updatedWorms,
	}
}

const applyWormsSubconsciousInstructions = (world: WorldType): WorldType => world

const applyWormsConsciousInstructions = (world: WorldType): WorldType => world

const increaseAge = (world: WorldType): WorldType => ({ ...world, age: world.age + 1 })

// eslint-disable-next-line import/group-exports
export type {
	WorldType,
}

// eslint-disable-next-line import/group-exports
export {
	worldInitialState,
	decreaseCollisionAnimationCounter,
	spawnWorm,
	spawnApple,
	growApples,
	generateFreeSpawnPosition_IMPURE,
	moveWorms,
	increaseAge,
	applyWormsSubconsciousInstructions,
	applyWormsConsciousInstructions,
	WorldBoundaries,
	WorldDimensions,
}
