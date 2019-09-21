// @flow strict


import { createStore } from '../../../src/epics'
import { mbpStoreConfig } from './mbpStoreConfig'

export const mbpStore = createStore<typeof mbpStoreConfig.epics>(mbpStoreConfig)

// $FlowFixMe
if (module.hot) {
	// $FlowFixMe
	module.hot.accept('./mbpStoreConfig', () => {
		mbpStore.replaceConfig(mbpStoreConfig)
	})
}

window.$R = {}
window.$R.store = mbpStore
