// @flow strict
import { type AnyMsgType } from '../../../../src/epics'
import { colorPickerReducer } from '../colorpicker/redux/colorPickerReducer'
import { type AppStateType } from './reduxTypes'
import { colorpickerInitialState } from '../colorpicker/colorPickerState'

const initialAppState: AppStateType = {
	colorpicker: colorpickerInitialState,
}

const rootReducer = (appState: AppStateType | void, msg: AnyMsgType): AppStateType => {
	if (appState === undefined) {
		return initialAppState
	}

	const nextColorpickerState = colorPickerReducer(appState.colorpicker, msg)

	if (nextColorpickerState !== appState.colorpicker) {
		return { ...appState, colorpicker: nextColorpickerState }
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
