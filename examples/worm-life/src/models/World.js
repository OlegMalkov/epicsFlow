/* @flow strict */

import { type WormType, setWormPosition, setWormHeadingDegree } from './Worm'
import { type PositionType } from '../types'
import { getRandomInt_IMPURE } from '../utils'

type AppleType = {|
    position: PositionType,
|}

opaque type WorldType: * = {|
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
	return { ...world, apples: [...world.apples, { position: spawnPosition }] }
}

const moveDiffFactory = (fn) => (degree, movedDistance) => Math.round(fn(degree * Math.PI / 180) * 100) / 100 * movedDistance
const xMoveDiff = moveDiffFactory(Math.cos)
const yMoveDiff = moveDiffFactory(Math.sin)

const outOfWorld = (position: PositionType) =>
	position.x >= WorldBoundaries.right ||
	position.x <= WorldBoundaries.left	||
	position.y >= WorldBoundaries.bottom ||
	position.y <= WorldBoundaries.top

const colisionWithOtherWorms = (wormPosition, otherWorms) => false
const moveWorms = (world: WorldType): WorldType => {
	return { ...world, worms: Object.keys(world.worms).reduce((worms, wormName) => {
		const worm = world.worms[wormName]

		if (worm.speed === 0) {
			return { ...worms, [wormName]: worm }
		}

		const movedDistance = worm.speed / 100
		const newPosition = {
			x: worm.position.x + xMoveDiff(worm.headingDegree, movedDistance),
			y: worm.position.y + yMoveDiff(worm.headingDegree, movedDistance),
		}

		const otherWorms = Object.keys(worms)
			.filter(n => n !== wormName)
			.map(wormName => worms[wormName])

		if (outOfWorld(newPosition) || colisionWithOtherWorms(worm.position, otherWorms)) {
			return {
				...worms,
				[wormName]: setWormHeadingDegree(worm.headingDegree + 25)(worm),
			}
		}


		return {
			...worms,
			[wormName]: setWormPosition(newPosition)(worm),
		}
	}, {}) }
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
	spawnWorm,
	spawnApple,
	generateFreeSpawnPosition_IMPURE,
	moveWorms,
	increaseAge,
	applyWormsSubconsciousInstructions,
	applyWormsConsciousInstructions,
	WorldBoundaries,
	WorldDimensions,
}
