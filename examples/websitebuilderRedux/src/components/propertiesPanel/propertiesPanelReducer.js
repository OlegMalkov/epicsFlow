// @flow strict
import { type AnyActionType } from '../../../../../src/epics'
import { propertiesPanelInitialState } from '../../../../websitebuilder/src/components/propertiesPanel/propertiesPanelState'
import { propertiesPanelInitialScope } from '../../../../websitebuilder/src/components/propertiesPanel/propertiesPanelScope'

type ReduxPropertiesPanelStateType = {|
	state: typeof propertiesPanelInitialState,
	scope: typeof propertiesPanelInitialScope,
|}

const reduxPropertiesPanelInitialState = { state: propertiesPanelInitialState, scope: propertiesPanelInitialScope }

const propertiesPanelReducer = (
	state: ReduxPropertiesPanelStateType = reduxPropertiesPanelInitialState,
	action: AnyActionType
): ReduxPropertiesPanelStateType => {
	return state
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxPropertiesPanelStateType,
}

// eslint-disable-next-line import/group-exports
export {
	propertiesPanelReducer,
}
