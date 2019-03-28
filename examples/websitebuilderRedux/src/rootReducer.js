// @flow strict
import { componentReducer, type ReduxComponentStateType } from './components/component/componentReducer'
import { type AnyActionType } from '../../../src/epics'
import {
	resizeDecorationsReducer,
	type ReduxResizeDecorationsStateType,
} from './components/componentResizeDecorations/componentResizeDecorationsReducer'

type AppStateType = {|
	component: ReduxComponentStateType,
	resizeDecorations: ReduxResizeDecorationsStateType,
|}

const rootReducer = (appState: AppStateType | void, action: AnyActionType): AppStateType => {
	if (appState === undefined) {
		return {
			component: componentReducer(undefined, action),
			resizeDecorations: resizeDecorationsReducer(undefined, action),
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
