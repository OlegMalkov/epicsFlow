// @flow strict

import { componentsIsMovingCondition, componentsIsResizingCondition } from '../components/componentsACnC'
import { createEpicCondition, createEpic, createUpdater } from '../../../../../src/epics'
import {
	selectedComponentsDecorationsInitialState,
	selectedComponentsDecorationsResetActiveHandleKey,
	selectedComponentsDecorationsSetActiveHandleKey,
	selectedComponentsDecorationsSetVisible,
} from './selectedComponentsDecorationsState'

const selectedComponentsDecorationsEpicVat = 'RESIZE_DECORATIONS_VAT'
const selectedComponentsDecorationsCondition = createEpicCondition<typeof selectedComponentsDecorationsInitialState>(selectedComponentsDecorationsEpicVat)
const selectedComponentsHandleNTopCondition = selectedComponentsDecorationsCondition.wsk('handles').wsk('n').wsk('position').wsk('top')
const selectedComponentsDecorationsVisibleCondition = selectedComponentsDecorationsCondition.wsk('visible')

const selectedComponentsDecorationsEpic = createEpic<typeof selectedComponentsDecorationsInitialState, *, *>({
	vat: selectedComponentsDecorationsEpicVat,
	initialState: selectedComponentsDecorationsInitialState,
	updaters: {
		computeVisibile: createUpdater({
			given: {},
			when: {
				componentsIsMoving: componentsIsMovingCondition,
				componentsIsResizing: componentsIsResizingCondition,
				componentsSelected: componentsSelectedCondition,
			},
			then: ({ values: { componentsIsMoving, componentsIsResizing, componentsSelected }, R }) =>
				R.mapState(selectedComponentsDecorationsSetVisible(componentsSelected && !componentsIsMoving && !componentsIsResizing)),
		}),
		computePositionsAndDimensions: createUpdater({
			given: {},
			when: {
				componentsPosition: componentsPositionCondition,
				componentsDimensions: componentsDimensionsCondition,
				isVisible: selectedComponentsDecorationsCondition.withSelectorKey('visible'),
				activeHandleKey: selectedComponentsDecorationsCondition.withSelectorKey('activeHandleKey'),
			},
			then: ({ values: { componentsPosition, componentsDimensions, isVisible, activeHandleKey }, R }) => {
				if (isVisible || activeHandleKey === 'n') {
					return R.mapState(selectedComponentsDecorationsSetSelectedComponentsNHandlePosition({
						left: componentsPosition.left + componentsDimensions.width / 2 - halfSelectedComponentsHandleSidePx,
						top: componentsPosition.top
							- halfSelectedComponentsHandleSidePx
							- Math.max(0, (selectedComponentsDecorationsVerticalSelectedComponentsHandleTreshold - componentsDimensions.height)),
					}))
				}
				return R.doNothing
			},
		}),
	},
})

export {
	selectedComponentsHandleNTopCondition,
	selectedComponentsDecorationsVisibleCondition,
	selectedComponentsDecorationsEpic,
}
