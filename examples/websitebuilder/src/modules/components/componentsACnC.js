// @flow strict

import { createEpicCondition } from '../../../../../src/epics'
import { componentsInitialState } from './componentsState'

const componentsVat = 'COMPONENT_VAT'
const componentsCondition = createEpicCondition<typeof componentsInitialState>(componentsVat)
const componentsRightCondition = componentsCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width)
const componentsPositionCondition = componentsCondition.withSelectorKey('position')
const componentsDimensionsCondition = componentsCondition.withSelectorKey('dimensions')
const componentsSelectedCondition = componentsCondition.withSelectorKey('selected')
const componentsIsMovingCondition = componentsCondition.withSelectorKey('isMoving')
const componentsIsResizingCondition = componentsCondition.withSelectorKey('isResizing')

export {
	componentsVat,
	componentsRightCondition,
	componentsPositionCondition,
	componentsDimensionsCondition,
	componentsSelectedCondition,
	componentsIsMovingCondition,
	componentsIsResizingCondition,
}
