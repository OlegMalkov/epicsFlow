// @flow strict

import { type ComponentStateType } from './componentState'
import { makeSACAC } from '../../epics'
import { makeEpicCondition } from '../../epics'

const componentVat = 'COMPONENT_VAT'
const componentMouseDown = makeSACAC('COMPONENT_MOUSE_DOWN')
const componentResizeNMouseDown = makeSACAC('COMPONENT_RESIZE_N_MOUSE_DOWN')
const componentCondition = makeEpicCondition<ComponentStateType>(componentVat)
const componentRightCondition = componentCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width)
const componentRightPassiveCondition = componentRightCondition.toPassive()
const componentPositionCondition = componentCondition.withSelectorKey('position')
const componentDimensionsCondition = componentCondition.withSelectorKey('dimensions')
// $FlowFixMe
const componentPositionPassiveCondition = componentPositionCondition.toPassive()
// $FlowFixMe
const componentDimensionsPassiveCondition = componentDimensionsCondition.toPassive()
const componentSelectedCondition = componentCondition.withSelectorKey('selected')
const componentIsMovingCondition = componentCondition.withSelectorKey('isMoving')
const componentIsResizingCondition = componentCondition.withSelectorKey('isResizing')

export {
	componentVat,
	componentMouseDown,
	componentResizeNMouseDown,
	componentRightPassiveCondition,
	componentPositionPassiveCondition,
	componentDimensionsPassiveCondition,
	componentSelectedCondition,
	componentIsMovingCondition,
	componentIsResizingCondition,
	componentPositionCondition,
	componentDimensionsCondition,
}
