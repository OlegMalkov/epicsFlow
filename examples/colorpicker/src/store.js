// @flow strict

import { createStore } from '../../../src/epics'
import { storeConfig } from './storeConfig'

export const store = createStore<*>(storeConfig)

// $FlowFixMe
if (module.hot) {
	// $FlowFixMe
	module.hot.accept('./storeConfig', () => {
		store.replaceConfig(storeConfig)
	})
}

window.$R = {}
window.$R.store = store

