// @flow strict


import { createStore } from '../../../src/epics'
import { wsbStoreConfig } from './wsbStoreConfig'

export const wsbStore = createStore<*>(wsbStoreConfig)

// $FlowFixMe
if (module.hot) {
	// $FlowFixMe
	module.hot.accept('./wsbStoreConfig', () => {
		wsbStore.replaceConfig(wsbStoreConfig)
	})
}

window.$R = {}
window.$R.store = wsbStore

