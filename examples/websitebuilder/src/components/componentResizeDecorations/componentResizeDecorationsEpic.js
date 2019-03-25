// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentResizeNMouseDown, componentPositionCondition, componentDimensionsCondition } from '../component/componentACAC'
import { setProp, setPathDeepCompare3 } from '../../utils'
import { makeEpicCondition, makeEpic, makeUpdater } from '../../epics'

type ResizeHandlesType = {|
    n: {| dimensions: DimensionsType, position: LTPositionType |},
|}

type ComponentResizeDecorationsStateType = {|
    activeHandleKey: $Keys<ResizeHandlesType> | null,
    handles: ResizeHandlesType,
    visible: bool,
|}

const ResizeHandleSidePx = 20
const HalfResizeHandleSidePx = ResizeHandleSidePx / 2
const setVisible = setProp<ComponentResizeDecorationsStateType, *>('visible')
const setActiveHandleKey = setProp<ComponentResizeDecorationsStateType, *>('activeHandleKey')
const resetActiveHandleKey = setActiveHandleKey(null)
const setResizeNHandlePosition = setPathDeepCompare3<ComponentResizeDecorationsStateType, *, *, *>('handles', 'n', 'position')
const handleInitialPosition: LTPositionType = { left: 0, top: -99999 }
const handleInitialDimensions: DimensionsType = { width: ResizeHandleSidePx, height: ResizeHandleSidePx }
const initialResizeHandlesState = { n: { position: handleInitialPosition, dimensions: handleInitialDimensions } }
// Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
const verticalResizeHandleTreshold = 50
const componentResizeDecorationsEpicVat = 'COMPONENT_RESIZE_DECORATIONS_VAT'
const resizeDecorationsCondition = makeEpicCondition<ComponentResizeDecorationsStateType>(componentResizeDecorationsEpicVat)
const componentResizeHandleNTopCondition = resizeDecorationsCondition.wsk('handles').wsk('n').wsk('position').wsk('top')
const componentResizeDecorationsVisibleCondition = resizeDecorationsCondition.wsk('visible')
const componentResizeDecorationsEpic = makeEpic<ComponentResizeDecorationsStateType, *, *>({
	vat: componentResizeDecorationsEpicVat,
	initialState: { activeHandleKey: null, handles: initialResizeHandlesState, visible: false },
	updaters: {
		detectActiveHandleKey: makeUpdater({
			dependsOn: {
				nMouseDown: componentResizeNMouseDown.condition.toOptional(),
			},
			reactsTo: {
				componentIsResizing: componentIsResizingCondition.resetConditionsByKeyAfterReducerCall(['nMouseDown']),
			},
			exec: ({ values: { nMouseDown, componentIsResizing }, R, changedActiveConditionsKeysMap }) => {
				if (changedActiveConditionsKeysMap.componentIsResizing && componentIsResizing === false) {
					return R.updateState(resetActiveHandleKey)
				}

				if (nMouseDown) {
					return R.updateState(setActiveHandleKey('n'))
				}

				return R.doNothing
			},
		}),
		computeVisibile: makeUpdater({
			dependsOn: {},
			reactsTo: {
				componentIsMoving: componentIsMovingCondition,
				componentIsResizing: componentIsResizingCondition,
				componentSelected: componentSelectedCondition,
			},
			exec: ({ values: { componentIsMoving, componentIsResizing, componentSelected }, R }) =>
				R.updateState(setVisible(componentSelected && !componentIsMoving && !componentIsResizing)),
		}),
		computePositionsForHandles: makeUpdater({
			dependsOn: {},
			reactsTo: {
				componentPosition: componentPositionCondition,
				componentDimensions: componentDimensionsCondition,
				isVisible: resizeDecorationsCondition.withSelectorKey('visible'),
				activeHandleKey: resizeDecorationsCondition.withSelectorKey('activeHandleKey'),
			},
			exec: ({ values: { componentPosition, componentDimensions, isVisible, activeHandleKey }, R }) => {
				if (isVisible || activeHandleKey === 'n') {
					return R.updateState(setResizeNHandlePosition({
						left: componentPosition.left + componentDimensions.width / 2 - HalfResizeHandleSidePx,
						top: componentPosition.top - HalfResizeHandleSidePx - Math.max(0, (verticalResizeHandleTreshold - componentDimensions.height)),
					}))
				}
				return R.doNothing
			},
		}),
	},
})

// eslint-disable-next-line import/group-exports
export type {
	ComponentResizeDecorationsStateType,
}

// eslint-disable-next-line import/group-exports
export {
	componentResizeHandleNTopCondition,
	componentResizeDecorationsVisibleCondition,
	componentResizeDecorationsEpic,
}
