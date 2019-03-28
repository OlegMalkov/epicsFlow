// @flow

import { type MainActionsPanelStateType } from './mainActionsPanelState'
import { makeSimpleActionCreatorAndCondition, createEpicCondition } from '../../../../../src/epics'

const mainActionsPanelEpicVat = 'COMPONENT_MAIN_ACTIONS_VAT'
const mainActionsPanelEditButtonPress = makeSimpleActionCreatorAndCondition('COMPONENT_MAIN_ACTIONS_EDIT_PRESSED')
const mainActionsPanelCondition = createEpicCondition<MainActionsPanelStateType>(mainActionsPanelEpicVat)
const mainActionsIsVisibleCondition = mainActionsPanelCondition.withSelectorKey('visible')
const mainActionsWhenVisibleCondition = mainActionsPanelCondition.withGuard<MainActionsPanelStateType>(s => s.visible)
const mainActionsPositionWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('position')
const mainActionsDimensionsWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('dimensions')

export {
	mainActionsPanelEditButtonPress,
	mainActionsIsVisibleCondition,
	mainActionsPositionWhenVisibleCondition,
	mainActionsDimensionsWhenVisibleCondition,
	mainActionsPanelEpicVat,
}