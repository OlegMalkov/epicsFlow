// @flow strict

import { createStore } from './epics';


const reduxStore = (() => {
	let state: AppState = rootReducer(undefined, { type: "@INIT"})
	const subscribers = []
	return {
		dispatch: action => {
			state = rootReducer(state, action)
			subscribers.forEach((sub) => sub(state))
		},
		getState: () => state,
		subscribe: (sub: AppState => void) => subscribers.push(sub)
	}
})()

window.$R = {}
window.$R.store = reduxStore


export type {
	AppState
}

export {
    reduxStore,
}