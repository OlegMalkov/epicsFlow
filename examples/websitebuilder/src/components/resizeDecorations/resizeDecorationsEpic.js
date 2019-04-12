// @flow strict

import { componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentPositionCondition, componentDimensionsCondition } from '../component/componentEvents'
import { createEpicCondition, createEpic, createUpdater } from '../../../../../src/epics'
import {
	resizeDecorationsInitialState,
	resizeDecorationsResetActiveHandleKey,
	resizeDecorationsSetActiveHandleKey,
	resizeDecorationsSetVisible,
	resizeDecorationsSetResizeNHandlePosition,
	halfResizeHandleSidePx,
	resizeDecorationsVerticalResizeHandleTreshold,
} from './resizeDecorationsState'
import { resizeDecorationsNMouseDown } from './resizeDecorationsEvents'

const resizeDecorationsEpicVcet = 'RESIZE_DECORATIONS_VCET'
const resizeDecorationsCondition = createEpicCondition<typeof resizeDecorationsInitialState>(resizeDecorationsEpicVcet)
const resizeHandleNTopCondition = resizeDecorationsCondition.wsk('handles').wsk('n').wsk('position').wsk('top')
const resizeDecorationsVisibleCondition = resizeDecorationsCondition.wsk('visible')

const resizeDecorationsEpic = createEpic<typeof resizeDecorationsInitialState, *, *>({
	vcet: resizeDecorationsEpicVcet,
	initialState: resizeDecorationsInitialState,
	updaters: {
		detectActiveHandleKey: createUpdater({
			given: {
				nMouseDown: resizeDecorationsNMouseDown.condition.toOptional(),
			},
			when: {
				componentIsResizing: componentIsResizingCondition.resetConditionsByKeyAfterReducerCall(['nMouseDown']),
			},
			then: ({ values: { nMouseDown, componentIsResizing }, R, changedActiveConditionsKeysMap }) => {
				if (changedActiveConditionsKeysMap.componentIsResizing && componentIsResizing === false) {
					return R.mapState(resizeDecorationsResetActiveHandleKey)
				}

				if (nMouseDown) {
					return R.mapState(resizeDecorationsSetActiveHandleKey('n'))
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
				R.mapState(resizeDecorationsSetVisible(componentSelected && !componentIsMoving && !componentIsResizing)),
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
					return R.mapState(resizeDecorationsSetResizeNHandlePosition({
						left: componentPosition.left + componentDimensions.width / 2 - halfResizeHandleSidePx,
						top: componentPosition.top
							- halfResizeHandleSidePx
							- Math.max(0, (resizeDecorationsVerticalResizeHandleTreshold - componentDimensions.height)),
					}))
				}
				return R.doNothing
			},
		}),
	},
})

export {
	resizeHandleNTopCondition,
	resizeDecorationsVisibleCondition,
	resizeDecorationsEpic,
}
