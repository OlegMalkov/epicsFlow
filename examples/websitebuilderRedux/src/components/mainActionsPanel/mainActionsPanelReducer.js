// @flow strict

import { mainActionsPanelInitialState, type MainActionsPanelStateType } from '../../../../websitebuilder/src/components/mainActionsPanel/mainActionsPanelState'
import { type AnyMsgType } from '../../../../../src/epics'

type ReduxMainActionsPanelStateType = MainActionsPanelStateType

const mainActionsPanelReducer = (
	state: ReduxMainActionsPanelStateType = mainActionsPanelInitialState,
	event: AnyMsgType
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
