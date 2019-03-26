// @flow strict
import { componentReducer, type ReduxComponentStateType } from './components/component/componentReducer'
import { type AnyActionType } from './epics'

type AppStateType = {|
	component: ReduxComponentStateType,
|}
const rootReducer = (appState: AppStateType, action: AnyActionType): AppStateType => {
	if (appState === undefined) {
		return {
			component: componentReducer(appState, action),
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
