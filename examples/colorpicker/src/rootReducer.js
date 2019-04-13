// @flow strict
import { type AnyMsgType } from '../../../src/epics'
import {
	type ColorPickerStateType,
	colorpickerInitialState,
} from './colorpicker/colorPickerState'
import { colorPickerReducer } from './colorpicker/redux/colorPickerReducer'

type AppStateType = {|
	colorpicker: ColorPickerStateType,
|}

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
