// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type MainActionsPanelState: {| dimensions: *, position: *, visible: * |} = {|
    dimensions: DimensionsType,
    position: LTPositionType,
    visible: bool,
|}


const _setPosition = setPropDeepCompare<MainActionsPanelState, *>('position')
const mainActionsPanelInitialState: MainActionsPanelState = { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false }
const mainActionsPanelSetVisible = setPropDeepCompare<MainActionsPanelState, *>('visible')
const mainActionsPanelSetPosition = (position: LTPositionType) => {
	let { left, top } = position

	const minTop = 0

	if (top < minTop) {
		top = minTop
	}

	const minLeft = 0

	if (left < minLeft) {
		left = minLeft
	}

	return _setPosition({ top, left })
}

// eslint-disable-next-line import/group-exports
export type {
	MainActionsPanelState,
}

// eslint-disable-next-line import/group-exports
export {
	mainActionsPanelInitialState,
	mainActionsPanelSetVisible,
	mainActionsPanelSetPosition,
}
