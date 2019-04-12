// @flow strict
import { type AnyMsgType } from '../../../src/epics'
import { type ColorPickerStateType, color } from './colorpicker/colorPickerState'

type AppStateType = {|
	colorpicker: ColorPickerStateType
|}

const initialAppState: AppStateType = {
	colorpicker: 
}

const rootReducer = (appState: AppStateType | void, event: AnyMsgType): AppStateType => {
	if (appState === undefined) {
		return initialAppState
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
