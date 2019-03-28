// @flow strict

import { type ComponentStateType } from './componentState'
import { makeSimpleActionCreatorAndCondition, createEpicCondition } from '../../../../../src/epics'

const componentVat = 'COMPONENT_VAT'
const componentMouseDown = makeSimpleActionCreatorAndCondition('COMPONENT_MOUSE_DOWN')
const componentCondition = createEpicCondition<ComponentStateType>(componentVat)
const componentRightCondition = componentCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width)
const componentPositionCondition = componentCondition.withSelectorKey('position')
const componentDimensionsCondition = componentCondition.withSelectorKey('dimensions')
const componentSelectedCondition = componentCondition.withSelectorKey('selected')
const componentIsMovingCondition = componentCondition.withSelectorKey('isMoving')
const componentIsResizingCondition = componentCondition.withSelectorKey('isResizing')

export {
	componentVat,
	componentMouseDown,
	componentRightCondition,
	componentPositionCondition,
	componentDimensionsCondition,
	componentSelectedCondition,
	componentIsMovingCondition,
	componentIsResizingCondition,
}
