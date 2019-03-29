// @flow strict

import { rootReducer, type AppStateType } from './rootReducer'
import { type AnyActionType } from '../../../src/epics'

const reduxWsbStore = (() => {
	const initialState = rootReducer(undefined, { type: '@INIT'})

	let state: AppStateType = initialState
	const subscribers = []

	return {
		dispatch: (action: AnyActionType) => {
			state = rootReducer(state, action)
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
window.$R.store = reduxWsbStore

export {
	reduxWsbStore,
}
