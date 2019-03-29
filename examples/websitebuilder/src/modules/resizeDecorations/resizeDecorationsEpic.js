// @flow strict

import { componentsIsMovingCondition, componentsIsResizingCondition } from '../components/componentsACnC'
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
import { resizeDecorationsNMouseDown } from './resizeDecorationsACnC'

const resizeDecorationsEpicVat = 'RESIZE_DECORATIONS_VAT'
const resizeDecorationsCondition = createEpicCondition<typeof resizeDecorationsInitialState>(resizeDecorationsEpicVat)
const resizeHandleNTopCondition = resizeDecorationsCondition.wsk('handles').wsk('n').wsk('position').wsk('top')
const resizeDecorationsVisibleCondition = resizeDecorationsCondition.wsk('visible')

const resizeDecorationsEpic = createEpic<typeof resizeDecorationsInitialState, *, *>({
	vat: resizeDecorationsEpicVat,
	initialState: resizeDecorationsInitialState,
	updaters: {
		detectActiveHandleKey: createUpdater({
			given: {
				nMouseDown: resizeDecorationsNMouseDown.condition.toOptional(),
			},
			when: {
				componentsIsResizing: componentsIsResizingCondition.resetConditionsByKeyAfterReducerCall(['nMouseDown']),
			},
			then: ({ values: { nMouseDown, componentsIsResizing }, R, changedActiveConditionsKeysMap }) => {
				if (changedActiveConditionsKeysMap.componentsIsResizing && componentsIsResizing === false) {
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
				componentsIsMoving: componentsIsMovingCondition,
				componentsIsResizing: componentsIsResizingCondition,
				componentsSelected: componentsSelectedCondition,
			},
			then: ({ values: { componentsIsMoving, componentsIsResizing, componentsSelected }, R }) =>
				R.mapState(resizeDecorationsSetVisible(componentsSelected && !componentsIsMoving && !componentsIsResizing)),
		}),
		computePositionsForHandles: createUpdater({
			given: {},
			when: {
				componentsPosition: componentsPositionCondition,
				componentsDimensions: componentsDimensionsCondition,
				isVisible: resizeDecorationsCondition.withSelectorKey('visible'),
				activeHandleKey: resizeDecorationsCondition.withSelectorKey('activeHandleKey'),
			},
			then: ({ values: { componentsPosition, componentsDimensions, isVisible, activeHandleKey }, R }) => {
				if (isVisible || activeHandleKey === 'n') {
					return R.mapState(resizeDecorationsSetResizeNHandlePosition({
						left: componentsPosition.left + componentsDimensions.width / 2 - halfResizeHandleSidePx,
						top: componentsPosition.top
							- halfResizeHandleSidePx
							- Math.max(0, (resizeDecorationsVerticalResizeHandleTreshold - componentsDimensions.height)),
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
