// @flow strict

import { createEpicCondition } from '../../../../../src/epics'
import { componentInitialState } from './componentState'

const componentVat = 'COMPONENT_VAT'
const componentCondition = createEpicCondition<typeof componentInitialState>(componentVat)
const componentRightCondition = componentCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width)
const componentPositionCondition = componentCondition.withSelectorKey('position')
const componentDimensionsCondition = componentCondition.withSelectorKey('dimensions')
const componentSelectedCondition = componentCondition.withSelectorKey('selected')
const componentIsMovingCondition = componentCondition.withSelectorKey('isMoving')
const componentIsResizingCondition = componentCondition.withSelectorKey('isResizing')

export {
	componentVat,
	componentRightCondition,
	componentPositionCondition,
	componentDimensionsCondition,
	componentSelectedCondition,
	componentIsMovingCondition,
	componentIsResizingCondition,
}
