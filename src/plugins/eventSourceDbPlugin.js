// @flow
import { type PluginType, makeEpic, storeCreated, makeSACAC, makeUpdater } from '../epics';
import { type LocalStorageEffectType } from '../effectManagers/localStorageEM'

const rehydrate = makeSACAC('REHYDRADE')

const esdbPlugin: PluginType = ({ injectEpics }) => {
	injectEpics({
		esdb: makeEpic<{| localStorageKeys: Array<string> | null |}, LocalStorageEffectType, empty>({
			vat: 'ESDB_VAT',
			initialState: {
				localStorageKeys: null,
			},
			updaters: {
				init: makeUpdater({
					conditions: { _: storeCreated.condition },
					reducer: ({ R }) => {
						return R.updateState((state) => ({ ...state, localStorageKeys: ['k'] }))
					},
				}),
			},
		}),
	})
}

export {
	esdbPlugin,
}
