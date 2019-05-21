// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	createSimpleEvent,
	createPluginStateKey,
} from '../epics'
import { localStorageEM } from '../effectManagers/localStorageEM'
import {
	esdbPlugin,
	type EsdbPluginConfigType,
	esdbSave,
	esdbAggregatesStateLocalStorageKey,
	esdbCreateEventsLocalStorageKey,
} from './eventSourceDbPlugin'
import { setNow } from '../tests/mocks'

const a = createSimpleEvent('A')
const b = createSimpleEvent('B')
const z = createSimpleEvent('Z')

const inc = x => x + 1

describe('eventSourceDbPlugin', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	const countOfABEpics = {
		countOfA: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vcet: 'COUNT_OF_A_VCET',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(inc),
				}),
			},
			pluginConfig: { esdbAggregate: true },
		}),
		countOfB: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vcet: 'COUNT_OF_B_VCET',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _b: b.condition },
					then: ({ R }) => R.mapState(inc),
				}),
			},
			pluginConfig: { esdbAggregate: true },
		}),
		countOfAorB: createEpic<number, *, *, EsdbPluginConfigType>({
			initialState: 0,
			vcet: 'COUNT_OF_A_OR_B_VCET',
			updaters: {
				inc: createUpdater({
					given: {},
					when: { _a: a.condition.to(), _b: b.condition.to() },
					then: ({ R }) => R.mapState(inc),
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

		store.dispatch(a.create())
		setNow(1)
		store.dispatch(b.create())
		setNow(2)
		store.dispatch(b.create())
		setNow(3)
		store.dispatch(z.create())
		setNow(4)
		store.dispatch(a.create())
		setNow(5)
		store.dispatch(b.create())
		setNow(6)

		return store
	}

	it('saves events used by aggregates and aggregates states to local storage on esdbSave', async () => {
		const store = createPopulatedStore()

		expect(store.getState().countOfA).toBe(2)
		expect(store.getState().countOfB).toBe(3)
		expect(store.getState().countOfAorB).toBe(5)

		store.dispatch(esdbSave.create())

		const expectedEventsSaveKey = esdbCreateEventsLocalStorageKey(6)

		expect(Object.keys(localStorage)).toEqual([expectedEventsSaveKey, esdbAggregatesStateLocalStorageKey])
		expect(localStorage.getItem(expectedEventsSaveKey)).toEqual(JSON.stringify({
			'0': a.create(),
			'1': b.create(),
			'2': b.create(),
			'4': a.create(),
			'5': b.create(),
		}))
		expect(localStorage.getItem(esdbAggregatesStateLocalStorageKey)).toEqual(JSON.stringify({
			'COUNT_OF_A_VCET': 2,
			'COUNT_OF_B_VCET': 3,
			'COUNT_OF_A_OR_B_VCET': 5,
		}))
	})

	it('rehydrates store', async () => {
		const store = createPopulatedStore()

		store.dispatch(esdbSave.create())

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
