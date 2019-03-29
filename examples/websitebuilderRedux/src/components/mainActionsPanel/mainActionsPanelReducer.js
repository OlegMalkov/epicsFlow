// @flow strict

import { mainActionsPanelInitialState } from '../../../../websitebuilder/src/components/mainActionsPanel/mainActionsPanelState'
import { type AnyActionType } from '../../../../../src/epics'

type ReduxMainActionsPanelStateType = typeof mainActionsPanelInitialState

const mainActionsPanelReducer = (
	state: ReduxMainActionsPanelStateType = mainActionsPanelInitialState,
	action: AnyActionType
): ReduxMainActionsPanelStateType => {
	return state
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxMainActionsPanelStateType,
}

// eslint-disable-next-line import/group-exports
export {
	mainActionsPanelReducer,
}
