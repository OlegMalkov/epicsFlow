// @flow strict
import { componentsReducer, type ReduxComponentsStateType } from './modules/components/componentsReducer'
import { type AnyActionType } from '../../../src/epics'
import {
	resizeDecorationsReducer,
	type ReduxResizeDecorationsStateType,
} from './modules/resizeDecorations/resizeDecorationsReducer'
import { mainActionsPanelReducer, type ReduxMainActionsPanelStateType } from './modules/mainActionsPanel/mainActionsPanelReducer'
import { propertiesPanelReducer, type ReduxPropertiesPanelStateType } from './modules/propertiesPanel/propertiesPanelReducer'
import { scopeReducer, type ScopeType } from './scopeReducer'

type AppStateType = {|
	components: ReduxComponentsStateType,
	resizeDecorations: ReduxResizeDecorationsStateType,
	mainActionsPanel: ReduxMainActionsPanelStateType,
	propertiesPanel: ReduxPropertiesPanelStateType,
	scope: ScopeType,
|}

const rootReducer = (appState: AppStateType | void, action: AnyActionType): AppStateType => {
	if (appState === undefined) {
		const initialScope = scopeReducer(undefined, action)

		// REDUX_ISSUE BOILERPLATE manual state initialization
		return {
			components: componentsReducer(undefined, action, { mousePosition: initialScope.mousePosition }),
			resizeDecorations: resizeDecorationsReducer(undefined, action),
			mainActionsPanel: mainActionsPanelReducer(undefined, action),
			propertiesPanel: propertiesPanelReducer(undefined, action),
			scope: initialScope,
		}
	}

	const nextScope = scopeReducer(appState.scope, action)
	// REDUX_ISSUE BOILERPLATE need to manually construct dependencies
	const componentsDeps = { mousePosition: nextScope.mousePosition }
	const nextComponentsState = componentsReducer(appState.components, action, componentsDeps)
	const nextResizeDecorationsState = resizeDecorationsReducer(appState.resizeDecorations, action)
	const nextMainActionsPanelState = mainActionsPanelReducer(appState.mainActionsPanel, action)
	const nextPropertiesPanelState = propertiesPanelReducer(appState.propertiesPanel, action)

	// REDUX_ISSUE BOILERPLATE need to manually check if anything changed (giving up the combineReducers, as we passing dependencies as third argument to sub reducers)
	if (
		nextComponentsState !== appState.components
		|| nextResizeDecorationsState !== appState.resizeDecorations
		|| nextMainActionsPanelState !== appState.mainActionsPanel
		|| nextPropertiesPanelState !== appState.propertiesPanel
		|| nextScope !== appState.scope
	) {
		return {
			components: nextComponentsState,
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
