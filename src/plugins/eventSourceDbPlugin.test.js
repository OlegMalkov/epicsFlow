// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	createSACAC,
	createPluginStateKey,
} from '../epics'
import { localStorageEM } from '../effectManagers/localStorageEM'
import {
	esdbPlugin,
	type EsdbPluginConfigType,
	esdbSave,
	esdbAggregatesStateLocalStorageKey,
	esdbCreateActionsLocalStorageKey,
} from './eventSourceDbPlugin'
import { setNow } from '../tests/mocks'

const a = createSACAC('A')
const b = createSACAC('B')
const z = createSACAC('Z')

const inc = x => x + 1

describe('eventSourceDbPlugin', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	const countOfABEpics = {
		countOfA: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vat: 'COUNT_OF_A_VAT',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(inc),
				}),
			},
			pluginConfig: { esdbAggregate: true },
		}),
		countOfB: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vat: 'COUNT_OF_B_VAT',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _b: b.c },
					then: ({ R }) => R.updateState(inc),
				}),
			},
			pluginConfig: { esdbAggregate: true },
		}),
		countOfAorB: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vat: 'COUNT_OF_A_OR_B_VAT',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _a: a.c.to(), _b: b.c.to() },
					then: ({ R }) => R.updateState(inc),
				}),
			},
			pluginConfig: { esdbAggregate: true },
		}),
	}

	const createPopulatedStore = () => {
		const store = createStore({
			epics: countOfABEpics,
			plugins: { esdb: esdbPlugin },
			effectManagers: { localStorage: localStorageEM },
		})

		store.dispatch(a.ac())
		setNow(1)
		store.dispatch(b.ac())
		setNow(2)
		store.dispatch(b.ac())
		setNow(3)
		store.dispatch(z.ac())
		setNow(4)
		store.dispatch(a.ac())
		setNow(5)
		store.dispatch(b.ac())
		setNow(6)

		return store
	}

	it('saves actions used by aggregates and aggregates states to local storage on esdbSave', async () => {
		const store = createPopulatedStore()

		expect(store.getState().countOfA).toBe(2)
		expect(store.getState().countOfB).toBe(3)
		expect(store.getState().countOfAorB).toBe(5)

		store.dispatch(esdbSave.ac())

		const expectedActionsSaveKey = esdbCreateActionsLocalStorageKey(6)

		expect(Object.keys(localStorage)).toEqual([expectedActionsSaveKey, esdbAggregatesStateLocalStorageKey])
		expect(localStorage.getItem(expectedActionsSaveKey)).toEqual(JSON.stringify({
			'0': a.ac(),
			'1': b.ac(),
			'2': b.ac(),
			'4': a.ac(),
			'5': b.ac(),
		}))
		expect(localStorage.getItem(esdbAggregatesStateLocalStorageKey)).toEqual(JSON.stringify({
			'COUNT_OF_A_VAT': 2,
			'COUNT_OF_B_VAT': 3,
			'COUNT_OF_A_OR_B_VAT': 5,
		}))
	})

	it('rehydrates store', async () => {
		const store = createPopulatedStore()

		store.dispatch(esdbSave.ac())

		const rehydratedStore = createStore({
			epics: countOfABEpics,
			plugins: { esdb: esdbPlugin },
			effectManagers: { localStorage: localStorageEM },
		})

		expect(rehydratedStore.getState().countOfA).toBe(2)
		expect(rehydratedStore.getState().countOfB).toBe(3)
		expect(rehydratedStore.getState().countOfAorB).toBe(5)
	})

	it.skip('should find all aggregates and rehydrate them on createStore', async () => {
		const store = createStore({
			epics: countOfABEpics,
			plugins: { esdb: esdbPlugin },
			effectManagers: { localStorage: localStorageEM },
		})

		expect(store.getState()[createPluginStateKey('e1')]).toBe(1)
		expect(store.getState()[createPluginStateKey('e2')]).toBe(2)
	})
})
