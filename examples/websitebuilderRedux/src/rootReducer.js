// @flow strict
import { componentReducer, type ReduxComponentStateType } from './components/component/componentReducer'
import { type AnyMsgType } from '../../../src/epics'
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

const rootReducer = (appState: AppStateType | void, event: AnyMsgType): AppStateType => {
	if (appState === undefined) {
		const initialScope = scopeReducer(undefined, event)

		return {
			component: componentReducer(undefined, event, { mousePosition: initialScope.mousePosition, templateWidth: 700 }), // TODO , templateWidth: 700
			resizeDecorations: resizeDecorationsReducer(undefined, event),
			mainActionsPanel: mainActionsPanelReducer(undefined, event),
			propertiesPanel: propertiesPanelReducer(undefined, event),
			scope: initialScope,
		}
	}

	const nextScope = scopeReducer(appState.scope, event)
	const componentDeps = { mousePosition: nextScope.mousePosition, templateWidth: 700 } // TODO , templateWidth: 700
	const nextComponentState = componentReducer(appState.component, event, componentDeps)
	const nextResizeDecorationsState = resizeDecorationsReducer(appState.resizeDecorations, event)
	const nextMainActionsPanelState = mainActionsPanelReducer(appState.mainActionsPanel, event)
	const nextPropertiesPanelState = propertiesPanelReducer(appState.propertiesPanel, event)

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
