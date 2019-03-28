// @flow strict
import { type AnyActionType } from '../../../../../src/epics'
import { propertiesPanelInitialState, type PropertiesPanelStateType } from '../../../../websitebuilder/src/components/propertiesPanel/propertiesPanelState';
import { propertiesPanelInitialScope, type PropertiesPanelScopeType } from '../../../../websitebuilder/src/components/propertiesPanel/propertiesPanelScope';

type ReduxPropertiesPanelStateType = {| state: PropertiesPanelStateType, scope: PropertiesPanelScopeType |}

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
