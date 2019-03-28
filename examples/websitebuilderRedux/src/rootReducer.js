// @flow strict
import { componentReducer, type ReduxComponentStateType } from './components/component/componentReducer'
import { type AnyActionType } from '../../../src/epics'
import {
	resizeDecorationsReducer,
	type ReduxResizeDecorationsStateType,
} from './components/resizeDecorations/resizeDecorationsReducer'
import { mainActionsPanelReducer, type ReduxMainActionsPanelStateType } from './components/mainActionsPanel/mainActionsPanelReducer'
import { propertiesPanelReducer, type ReduxPropertiesPanelStateType } from './components/propertiesPanel/propertiesPanelReducer'

type AppStateType = {|
	component: ReduxComponentStateType,
	resizeDecorations: ReduxResizeDecorationsStateType,
	mainActionsPanel: ReduxMainActionsPanelStateType,
	propertiesPanel: ReduxPropertiesPanelStateType,
|}

const rootReducer = (appState: AppStateType | void, action: AnyActionType): AppStateType => {
	if (appState === undefined) {
		return {
			component: componentReducer(undefined, action),
			resizeDecorations: resizeDecorationsReducer(undefined, action),
			mainActionsPanel: mainActionsPanelReducer(undefined, action),
			propertiesPanel: propertiesPanelReducer(undefined, action),
		}
	}

	return appState
}

// eslint-disable-next-line import/group-exports
export type {
	AppStateType,
}

// eslint-disable-next-line import/group-exports
export {
	rootReducer,
}
