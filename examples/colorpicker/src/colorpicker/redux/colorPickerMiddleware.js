// @flow

import { type DispatchType, type AnyMsgType } from '../../../../../src/epics'
import { type AppStateType } from '../../redux/reduxTypes'
import { DispatchCmdWithDelayCmd } from '../../redux/dispatchActionWithDelayMiddleware/dispatchActionWithDelayMiddlewareMsgs'
import { SaveStorageContentCmd } from '../../redux/storageMiddleware/storageMiddlewareMsgs'

const colorpickerKey = 'colorpicker'
const colorpickerMiddleware = (store: { dispatch: DispatchType, getState: () => AppStateType }) => (next: DispatchType) => (action: AnyMsgType) => {
	const prevColorPickerState = store.getState().colorpicker
	const result = next(action)
	const nextColorPickerState = store.getState().colorpicker

	if (prevColorPickerState !== nextColorPickerState) {
		store.dispatch(DispatchCmdWithDelayCmd.create({
			cmd: SaveStorageContentCmd.create({ key: colorpickerKey, storageData: nextColorPickerState }),
			delayMs: 1000,
			key: colorpickerKey,
		}))
	}

	return result
}

export {
	colorpickerMiddleware,
}
