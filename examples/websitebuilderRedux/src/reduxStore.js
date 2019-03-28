// @flow strict

import { rootReducer, type AppStateType } from './rootReducer'
import { type AnyActionType } from '../../../src/epics'

const reduxStore = (() => {
	let state: AppStateType = rootReducer(undefined, { type: '@INIT'})
	const subscribers = []

	return {
		dispatch: (action: AnyActionType) => {
			state = rootReducer(state, action)
			subscribers.forEach((sub) => sub(state))
		},
		getState: () => state,
		subscribe: (sub: AppStateType => void) => subscribers.push(sub),
	}
})()

window.$R = {}
window.$R.store = reduxStore

export {
	reduxStore,
}
