// @flow strict

import { type ComponentStateType } from './componentState'
import { makeSimpleEvent, createEpicCondition } from '../../../../../src/epics'

const componentVcet = 'COMPONENT_VCET'
const componentMouseDownEvent = makeSimpleEvent('COMPONENT_MOUSE_DOWN')
const componentCondition = createEpicCondition<ComponentStateType>(componentVcet)
const componentRightCondition = componentCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width)
const componentPositionCondition = componentCondition.withSelectorKey('position')
const componentDimensionsCondition = componentCondition.withSelectorKey('dimensions')
const componentSelectedCondition = componentCondition.withSelectorKey('selected')
const componentIsMovingCondition = componentCondition.withSelectorKey('isMoving')
const componentIsResizingCondition = componentCondition.withSelectorKey('isResizing')

export {
	componentVcet,
	componentMouseDownEvent,
	componentRightCondition,
	componentPositionCondition,
	componentDimensionsCondition,
	componentSelectedCondition,
	componentIsMovingCondition,
	componentIsResizingCondition,
}
