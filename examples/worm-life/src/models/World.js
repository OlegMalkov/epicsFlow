/* @flow */

import {
	type WormType,
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
} from './Worm'
import { type PositionType } from '../types'
import { xMoveDiff, yMoveDiff, updateEachMapValue, getObjectValues, filterObject } from '../utils'
import { getRandomInt_IMPURE } from '../utils_IMPURE'
import { deepFreeze } from '../../../../src/epics'
import '../globalHelpers'
import { globalsStub } from '../globalHelpers'
import { createRgbaColor } from './RgbaColor'

type AppleType = {|
	position: PositionType,
	size: number,
|}

type ApplesType = $ReadOnlyArray<AppleType>

opaque type WorldType: {|
    worms: { [name: string]: WormType },
    apples: ApplesType,
    age: number,
|} = {|
    worms: { [name: string]: WormType },
    apples: ApplesType,
    age: number,
|}

type ScriptDataType = {|
    world: WorldType,
	me: WormType,
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

const getApplesAroundPosition = ({ searchRadius = 200, position, world }: {|
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

const generateFreeSpawnPosition_IMPURE = (world: WorldType, searchRadius: number = 200): PositionType | null => {
	let position: PositionType = generateRandomWorldPosition_IMPURE()

	let tries = 1

	while (getApplesAroundPosition({ position, world, searchRadius }).length > 0) {
		position = generateRandomWorldPosition_IMPURE()
		tries ++

		if (tries > 100) return null
	}


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
	return { ...world, apples: world.apples.map(apple => ({ ...apple, size: Math.min(apple.size + 1, 100) })) }
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

const turnWormBack = (worm: WormType) => setWormHeadingDegree(((worm.headingDegree + 180) % 360))(worm)

type CircleType = {| position: PositionType, radius: number |}

const circleIntersects = (circle1: CircleType) => (circle2: CircleType): bool => {
	const dx = circle1.position.x - circle2.position.x
	const dy = circle1.position.y - circle2.position.y
	const d = Math.sqrt((dy*dy) + (dx*dx))

	return d < circle2.radius + circle1.radius
}

const intersectsWithApple = (position: PositionType, radius: number) => (apple: AppleType): bool => {
	return circleIntersects({ position, radius })({ position: apple.position, radius: apple.size / 2 })
}

const collisionWithApple = (worm: WormType, apples: ApplesType): number => {
	const wormMouthSize = Math.max(2, worm.size / 25)

	return apples.indexOf(apples.find(intersectsWithApple(worm.position, wormMouthSize)))
}

const forbiddenWords = [
	'for',
	'while',
	'do',
	'eval',
	'arguments',
]

function evalInContext(js: string) {
	const forbiddenWordsInJs = forbiddenWords.filter(fw => js.indexOf(fw) !== -1)

	return function() { return eval(`
	${globalsStub}
	
	${forbiddenWordsInJs.length > 0 ? `throw new Error('${forbiddenWordsInJs.join(',')} forbidden.');`: js}
`) }.call({})
}

const processWormsSubconscious = (world: WorldType): WorldType => {
	const updatedWorms = updateEachMapValue(_worm => {
		let worm = _worm

		try {
			window.name = worm.name
			const fn = evalInContext(worm.subconsciousScript)

			const otherWorms = filterObject(
				w =>
					circleIntersects({
						position: worm.position,
						radius: worm.vision,
					})({
						position: w.position,
						radius: worm.size,
					}),
				world.worms
			)
			const scriptData: ScriptDataType = {
				world: {
					...world,
					apples: world.apples.filter(intersectsWithApple(worm.position, worm.vision)),
					worms: otherWorms,
				},
				me: worm,
			}

			const desiredWorld = fn(deepFreeze(scriptData))

			if (!desiredWorld) return worm

			const { me: { headingDegree, speed, size, vision, move, color } } = desiredWorld

			if (headingDegree !== undefined) {
				const currentHeading = (worm.headingDegree + 360) % 360
				const desiredHeading = (headingDegree + 360) % 360

				let headingDiff = desiredHeading - currentHeading

				if (headingDiff < -180) {
					headingDiff += 360
				} else if (headingDiff > 180) {
					headingDiff -= 360
				}

				const diffToApply = Math.max(Math.abs(headingDiff) / headingDiff * worm.speed / 30, 1)

				if (currentHeading !== desiredHeading) {
					worm = setWormHeadingDegree(Math.abs(headingDiff) <= 5 ? desiredHeading : currentHeading + diffToApply)(worm)
				}
			}

			if (move !== undefined) {
				worm = setWormMove(move)(worm)
			}
			const rgbaColor = createRgbaColor(color)

			worm = setWormDesiredAttributes({
				speed: speed === undefined ? worm.speed : speed,
				size: size === undefined ? worm.size : size,
				vision: vision === undefined ? worm.vision : vision,
				color: rgbaColor,
			})(worm)

			worm.subconsciousError = ''

			return worm
		} catch (e) {
			return setWormSubconsciousError(e.message)(worm)
		}
	}, world.worms)

	return {
		...world,
		worms: updatedWorms,
	}
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
			const moveBackDistance = Math.max(1, worm.bounceBackDistance / 5)

			worm = setWormBounceBackDistance(worm.bounceBackDistance - moveBackDistance)(worm)
			worm = moveWorm(moveBackDistance)(worm)
			worm = turnWormBack(worm)
		} else if (apple) {
			const baitSize = Math.min(apple.size, Math.sqrt(worm.size * worm.speed) / 1000)

			worm = feedWorm(baitSize)(worm)
			appleBaits[collisionAppleIndex] += baitSize
		} else if (worm.speed !== 0 && worm.move) {
			worm = moveWorm(Math.max(25, (worm.speed - (worm.size / 2 - 50))) / 100)(worm)
		}

		if (outOfWorld(worm.position)) {
			worm = turnWormBack(worm)
			worm = moveWorm(worm.speed / 2)(worm)
			worm = turnWormBack(worm)
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

	updatedApples = updatedApples.filter(apple => apple.size > 2)
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
	ScriptDataType,
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
	processWormsSubconscious,
}
