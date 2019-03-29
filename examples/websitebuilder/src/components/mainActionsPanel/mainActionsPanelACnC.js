// @flow

import { makeSimpleActionCreatorAndCondition, createEpicCondition } from '../../../../../src/epics'
import { mainActionsPanelInitialState } from './mainActionsPanelState'

const mainActionsPanelEpicVat = 'COMPONENT_MAIN_ACTIONS_VAT'
const mainActionsPanelEditButtonPress = makeSimpleActionCreatorAndCondition('COMPONENT_MAIN_ACTIONS_EDIT_PRESSED')
const mainActionsPanelCondition = createEpicCondition<typeof mainActionsPanelInitialState>(mainActionsPanelEpicVat)
const mainActionsIsVisibleCondition = mainActionsPanelCondition.withSelectorKey('visible')
const mainActionsWhenVisibleCondition = mainActionsPanelCondition.withGuard<typeof mainActionsPanelInitialState>(s => s.visible)
const mainActionsPositionWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('position')
const mainActionsDimensionsWhenVisibleCondition = mainActionsWhenVisibleCondition.wsk('dimensions')

export {
	mainActionsPanelEditButtonPress,
	mainActionsIsVisibleCondition,
	mainActionsPositionWhenVisibleCondition,
	mainActionsDimensionsWhenVisibleCondition,
	mainActionsPanelEpicVat,
}
