// @flow strict

import { rootReducer, type AppStateType } from './rootReducer'
import { type AnyMsgType } from '../../../src/epics'

const reduxStore = (() => {
	const initialState = rootReducer(undefined, { type: '@INIT'})

	let state: AppStateType = initialState
	const subscribers = []

	return {
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
})()

window.$R = {}
window.$R.store = reduxStore

export {
	reduxStore,
}
