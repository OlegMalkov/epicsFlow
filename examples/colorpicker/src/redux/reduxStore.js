// @flow

import { rootReducer, type AppStateType } from './rootReducer'
import { type AnyMsgType } from '../../../../src/epics'
import { storageMiddleware } from './storageMiddleware/storageMiddleware'
import { colorpickerMiddleware } from '../colorpicker/redux/colorPickerMiddleware'
import { dispatchActionWithDelayMiddleware } from './dispatchActionWithDelayMiddleware/dispatchActionWithDelayMiddleware'

const reduxStore = (() => {
	const initialState = rootReducer(undefined, { type: '@INIT'})

	let state: AppStateType = initialState
	const subscribers = []

	const store = {
		dispatch: (event: AnyMsgType) => {
			state = rootReducer(state, event)
			subscribers.forEach((sub) => sub(state))
		},
		getState: () => state,
		subscribe: (sub: AppStateType => void) => subscribers.push(sub),
		resetToInitialState: () => {
			state = initialState
		},
	}

	store.dispatch = [
		dispatchActionWithDelayMiddleware,
		storageMiddleware,
		colorpickerMiddleware,
	].reduce((next, middleware) => middleware(store)(next), store.dispatch)

	return store
})()

window.$R = {}
window.$R.store = reduxStore

export {
	reduxStore,
}
