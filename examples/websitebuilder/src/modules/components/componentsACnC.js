// @flow strict

import { createEpicCondition } from '../../../../../src/epics'
import { componentsInitialState } from './componentsState'

const componentsVat = 'COMPONENT_VAT'
const componentsCondition = createEpicCondition<typeof componentsInitialState>(componentsVat)
const componentsSelectedComponentsIdCondition = componentsCondition.withSelectorKey('selectedComponentsIds')
const componentsIsMovingCondition = componentsCondition.withSelectorKey('isMoving')
const componentsIsResizingCondition = componentsCondition.withSelectorKey('isResizing')

export {
	componentsVat,
	componentsSelectedComponentsIdCondition,
	componentsIsMovingCondition,
	componentsIsResizingCondition,
}
