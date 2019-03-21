// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare } from '../../utils'

opaque type ComponentMainActionsState: {| dimensions: *, position: *, visible: * |} = {|
    dimensions: DimensionsType,
    position: LTPositionType,
    visible: bool,
|}


const _setPosition = setPropDeepCompare<ComponentMainActionsState, *>('position')
const componentMainActionsInitialState: ComponentMainActionsState = { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false }
const componentMainActionsSetVisible = setPropDeepCompare<ComponentMainActionsState, *>('visible')
const componentMainActionsSetPosition = (position: LTPositionType) => {
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
	ComponentMainActionsState,
}

// eslint-disable-next-line import/group-exports
export {
	componentMainActionsInitialState,
	componentMainActionsSetVisible,
	componentMainActionsSetPosition,
}
