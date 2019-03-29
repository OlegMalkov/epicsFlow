// @flow strict
import { componentReducer, type ReduxComponentStateType } from './components/component/componentReducer'
import { type AnyActionType } from '../../../src/epics'
import {
	resizeDecorationsReducer,
	type ReduxResizeDecorationsStateType,
} from './components/resizeDecorations/resizeDecorationsReducer'
import { mainActionsPanelReducer, type ReduxMainActionsPanelStateType } from './components/mainActionsPanel/mainActionsPanelReducer'
import { propertiesPanelReducer, type ReduxPropertiesPanelStateType } from './components/propertiesPanel/propertiesPanelReducer'
import { scopeReducer, type ScopeType } from './scopeReducer'

type AppStateType = {|
	component: ReduxComponentStateType,
	resizeDecorations: ReduxResizeDecorationsStateType,
	mainActionsPanel: ReduxMainActionsPanelStateType,
	propertiesPanel: ReduxPropertiesPanelStateType,
	scope: ScopeType,
|}

const rootReducer = (appState: AppStateType | void, action: AnyActionType): AppStateType => {
	if (appState === undefined) {
		const initialScope = scopeReducer(undefined, action)

		return {
			component: componentReducer(undefined, action, { mousePosition: initialScope.mousePosition }),
			resizeDecorations: resizeDecorationsReducer(undefined, action),
			mainActionsPanel: mainActionsPanelReducer(undefined, action),
			propertiesPanel: propertiesPanelReducer(undefined, action),
			scope: initialScope,
		}
	}

	const nextScope = scopeReducer(appState.scope, action)
	const componentDeps = { mousePosition: nextScope.mousePosition }
	const nextComponentState = componentReducer(appState.component, action, componentDeps)
	const nextResizeDecorationsState = resizeDecorationsReducer(appState.resizeDecorations, action)
	const nextMainActionsPanelState = mainActionsPanelReducer(appState.mainActionsPanel, action)
	const nextPropertiesPanelState = propertiesPanelReducer(appState.propertiesPanel, action)

	if (
		nextComponentState !== appState.component
		|| nextResizeDecorationsState !== appState.resizeDecorations
		|| nextMainActionsPanelState !== appState.mainActionsPanel
		|| nextPropertiesPanelState !== appState.propertiesPanel
		|| nextScope !== appState.scope
	) {
		return {
			component: nextComponentState,
			resizeDecorations: nextResizeDecorationsState,
			mainActionsPanel: nextMainActionsPanelState,
			propertiesPanel: nextPropertiesPanelState,
			scope: nextScope,
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
