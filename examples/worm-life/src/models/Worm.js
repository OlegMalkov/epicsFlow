/* @flow strict */

import { type PositionType } from '../types'
import { type RgbaColorType, rgbaColorRed } from './RgbaColor'

opaque type WormType: * = {|
    name: string,
    speed: number,
    size: number,
	vision: number,
	color: RgbaColorType,
    position: PositionType,
    headingDegree: number,
	applesEaten: number,
	subconsciousScript: string,
|}

type WormSubconsciousScriptResultType = {| speed: number, size: number, vision: number, headingDegree: number |}

const wormDefaultSubconsciousScript = `(world: WorldType, worm: WormType): WormSubconsciousScriptResultType => 
	{| speed: 100, size: 100, vision: 100, headingDegree: 75 |}`

const createWorm = ({ name, speed = 100, size = 100, vision = 100 }: {|
    name: string,
    speed?: number,
    size?: number,
    vision?: number,
|}): WormType | null => {
	if (!name || speed + size + vision !== 300) return null

	return {
		name,
		speed: speed + 500,
		size,
		vision,
		color: rgbaColorRed,
		position: { x: -1, y: -1 },
		headingDegree: 45,
		applesEaten: 0,
		subconsciousScript: wormDefaultSubconsciousScript,
	}
}

const setWormPosition = (position: PositionType) => (worm: WormType): WormType => {
	return { ...worm, position }
}

const setWormHeadingDegree = (headingDegree: number) => (worm: WormType): WormType => {
	return { ...worm, headingDegree }
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
}
