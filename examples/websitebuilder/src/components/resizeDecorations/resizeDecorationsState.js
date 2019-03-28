// @flow strict
import { setProp, setPathDeepCompare3 } from '../../../../../src/utils'
import { type DimensionsType, type LTPositionType } from '../../types'

type ResizeHandlesType = {|
    n: {| dimensions: DimensionsType, position: LTPositionType |},
|}

type ResizeDecorationsStateType = {|
    activeHandleKey: $Keys<ResizeHandlesType> | null,
    handles: ResizeHandlesType,
    visible: bool,
|}

const handleInitialPosition: LTPositionType = { left: 0, top: -99999 }
const resizeHandleSidePx = 20
const halfResizeHandleSidePx = resizeHandleSidePx / 2
const handleInitialDimensions: DimensionsType = { width: resizeHandleSidePx, height: resizeHandleSidePx }
const initialResizeHandlesState = { n: { position: handleInitialPosition, dimensions: handleInitialDimensions } }
const resizeDecorationsInitialState: ResizeDecorationsStateType = {
	activeHandleKey: null,
	handles: initialResizeHandlesState,
	visible: false,
}
const resizeDecorationsSetVisible = setProp<ResizeDecorationsStateType, *>('visible')
const resizeDecorationsSetActiveHandleKey = setProp<ResizeDecorationsStateType, *>('activeHandleKey')
const resizeDecorationsResetActiveHandleKey = resizeDecorationsSetActiveHandleKey(null)
const resizeDecorationsSetResizeNHandlePosition = setPathDeepCompare3<ResizeDecorationsStateType, *, *, *>('handles', 'n', 'position')
// Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
const resizeDecorationsVerticalResizeHandleTreshold = 50

// eslint-disable-next-line import/group-exports
export type {
	ResizeDecorationsStateType,
}

// eslint-disable-next-line import/group-exports
export {
	resizeDecorationsInitialState,
	resizeDecorationsSetVisible,
	resizeDecorationsSetActiveHandleKey,
	resizeDecorationsResetActiveHandleKey,
	resizeDecorationsSetResizeNHandlePosition,
	resizeDecorationsVerticalResizeHandleTreshold,
	resizeHandleSidePx,
	halfResizeHandleSidePx,
}
