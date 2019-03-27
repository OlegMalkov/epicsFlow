// @flow

import { type ComponentMainActionsState } from './componentMainActionsState'
import { makeSimpleActionCreatorAndCondition, createEpicCondition } from '../../../../../src/epics'

const componentMainActionsEpicVat = 'COMPONENT_MAIN_ACTIONS_VAT'
const componentMainActionsEditButtonPress = makeSimpleActionCreatorAndCondition('COMPONENT_MAIN_ACTIONS_EDIT_PRESSED')
const componentMainActionsCondition = createEpicCondition<ComponentMainActionsState>(componentMainActionsEpicVat)
const componentsMainActionsIsVisibleCondition = componentMainActionsCondition.withSelectorKey('visible')
const componentsMainActionsWhenVisibleCondition = componentMainActionsCondition.withGuard<ComponentMainActionsState>(s => s.visible)
const componentsMainActionsPositionWhenVisibleCondition = componentsMainActionsWhenVisibleCondition.wsk('position')
const componentsMainActionsDimensionsWhenVisibleCondition = componentsMainActionsWhenVisibleCondition.wsk('dimensions')

export {
	componentMainActionsEditButtonPress,
	componentsMainActionsIsVisibleCondition,
	componentsMainActionsPositionWhenVisibleCondition,
	componentsMainActionsDimensionsWhenVisibleCondition,
	componentMainActionsEpicVat,
}
