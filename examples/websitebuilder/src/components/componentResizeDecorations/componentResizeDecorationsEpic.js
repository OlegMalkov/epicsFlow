// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentResizeNMouseDown, componentPositionCondition, componentDimensionsCondition } from '../component/componentACnC'
import { setProp, setPathDeepCompare3 } from '../../../../../src/utils'
import { createEpicCondition, createEpic, createUpdater } from '../../../../../src/epics'

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
const resizeDecorationsCondition = createEpicCondition<ComponentResizeDecorationsStateType>(componentResizeDecorationsEpicVat)
const componentResizeHandleNTopCondition = resizeDecorationsCondition.wsk('handles').wsk('n').wsk('position').wsk('top')
const componentResizeDecorationsVisibleCondition = resizeDecorationsCondition.wsk('visible')
const componentResizeDecorationsEpic = createEpic<ComponentResizeDecorationsStateType, *, *>({
	vat: componentResizeDecorationsEpicVat,
	initialState: { activeHandleKey: null, handles: initialResizeHandlesState, visible: false },
	updaters: {
		detectActiveHandleKey: createUpdater({
			given: {
				nMouseDown: componentResizeNMouseDown.condition.toOptional(),
			},
			when: {
				componentIsResizing: componentIsResizingCondition.resetConditionsByKeyAfterReducerCall(['nMouseDown']),
			},
			then: ({ values: { nMouseDown, componentIsResizing }, R, changedActiveConditionsKeysMap }) => {
				if (changedActiveConditionsKeysMap.componentIsResizing && componentIsResizing === false) {
					return R.mapState(resetActiveHandleKey)
				}

				if (nMouseDown) {
					return R.mapState(setActiveHandleKey('n'))
				}

				return R.doNothing
			},
		}),
		computeVisibile: createUpdater({
			given: {},
			when: {
				componentIsMoving: componentIsMovingCondition,
				componentIsResizing: componentIsResizingCondition,
				componentSelected: componentSelectedCondition,
			},
			then: ({ values: { componentIsMoving, componentIsResizing, componentSelected }, R }) =>
				R.mapState(setVisible(componentSelected && !componentIsMoving && !componentIsResizing)),
		}),
		computePositionsForHandles: createUpdater({
			given: {},
			when: {
				componentPosition: componentPositionCondition,
				componentDimensions: componentDimensionsCondition,
				isVisible: resizeDecorationsCondition.withSelectorKey('visible'),
				activeHandleKey: resizeDecorationsCondition.withSelectorKey('activeHandleKey'),
			},
			then: ({ values: { componentPosition, componentDimensions, isVisible, activeHandleKey }, R }) => {
				if (isVisible || activeHandleKey === 'n') {
					return R.mapState(setResizeNHandlePosition({
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
