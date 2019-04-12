// @flow

import { type MainActionsPanelStateType } from './mainActionsPanelState'
import { makeSimpleEvent, createEpicCondition } from '../../../../../src/epics'

const mainActionsPanelEpicVcet = 'COMPONENT_MAIN_ACTIONS_VCET'
const mainActionsPanelEditButtonPress = makeSimpleEvent('COMPONENT_MAIN_ACTIONS_EDIT_PRESSED')
const mainActionsPanelCondition = createEpicCondition<MainActionsPanelStateType>(mainActionsPanelEpicVcet)
const mainActionsIsVisibleCondition = mainActionsPanelCondition.withSelectorKey('visible')
const mainActionsWhenVisibleCondition = mainActionsPanelCondition.withGuard<MainActionsPanelStateType>(s => s.visible)
const mainActionsPositionWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('position')
const mainActionsDimensionsWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('dimensions')

export {
	mainActionsPanelEditButtonPress,
	mainActionsIsVisibleCondition,
	mainActionsPositionWhenVisibleCondition,
	mainActionsDimensionsWhenVisibleCondition,
	mainActionsPanelEpicVcet,
}
