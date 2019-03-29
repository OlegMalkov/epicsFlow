// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type MainActionsPanelStateType: {| dimensions: *, position: *, visible: * |} = {|
    dimensions: DimensionsType,
    position: LTPositionType,
    visible: bool,
|}


const _setPosition = setPropDeepCompare<MainActionsPanelStateType, *>('position')
const mainActionsPanelInitialState: MainActionsPanelStateType = { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false }
const mainActionsPanelSetVisible = setPropDeepCompare<MainActionsPanelStateType, *>('visible')
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

export {
	mainActionsPanelInitialState,
	mainActionsPanelSetVisible,
	mainActionsPanelSetPosition,
}
