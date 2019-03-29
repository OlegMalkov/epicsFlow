// @flow strict
import { setProp, setPathDeepCompare3 } from '../../../../../src/utils'
import { type DimensionsType, type LTPositionType } from '../../types'

type SelectedComponentsHandlesType = {|
    n: {| dimensions: DimensionsType, position: LTPositionType |},
|}

opaque type SelectedComponentsDecorationsStateType: {| activeHandleKey: *, handles: *, visible: * |} = {|
    activeHandleKey: $Keys<SelectedComponentsHandlesType> | null,
    handles: SelectedComponentsHandlesType,
    visible: bool,
|}

const handleInitialPosition: LTPositionType = { left: 0, top: -99999 }
const selectedComponentsHandleSidePx = 20
const halfSelectedComponentsHandleSidePx = selectedComponentsHandleSidePx / 2
const handleInitialDimensions: DimensionsType = { width: selectedComponentsHandleSidePx, height: selectedComponentsHandleSidePx }
const initialSelectedComponentsHandlesState = { n: { position: handleInitialPosition, dimensions: handleInitialDimensions } }
const selectedComponentsDecorationsInitialState: SelectedComponentsDecorationsStateType = {
	activeHandleKey: null,
	handles: initialSelectedComponentsHandlesState,
	visible: false,
}
const selectedComponentsDecorationsSetVisible = setProp<SelectedComponentsDecorationsStateType, *>('visible')
const selectedComponentsDecorationsSetActiveHandleKey = setProp<SelectedComponentsDecorationsStateType, *>('activeHandleKey')
const selectedComponentsDecorationsResetActiveHandleKey = selectedComponentsDecorationsSetActiveHandleKey(null)
const selectedComponentsDecorationsSetSelectedComponentsNHandlePosition = setPathDeepCompare3<SelectedComponentsDecorationsStateType, *, *, *>('handles', 'n', 'position')
// Components can be selectedComponentsd using top resizing handle. Top selectedComponents handle is 20px above components top if components height > 50px, otherwise 20 + (50 - componentsHeight) px.
const selectedComponentsDecorationsVerticalSelectedComponentsHandleTreshold = 50

export {
	selectedComponentsDecorationsInitialState,
	selectedComponentsDecorationsSetVisible,
	selectedComponentsDecorationsSetActiveHandleKey,
	selectedComponentsDecorationsResetActiveHandleKey,
	selectedComponentsDecorationsSetSelectedComponentsNHandlePosition,
	selectedComponentsDecorationsVerticalSelectedComponentsHandleTreshold,
	selectedComponentsHandleSidePx,
	halfSelectedComponentsHandleSidePx,
}
