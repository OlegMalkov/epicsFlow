// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	makeSimpleEvent,
	type PluginType,
	storeCreatedEvent,
	createPluginStateKey,
	type EpicType,
} from '../epics'
import { type LocalStorageEffectType } from '../effectManagers/localStorageEM'

type PluginConfigType = {| injectStateIncOnCreateStore: bool |}

const a = makeSimpleEvent('A')

describe('plugin', () => {
	it('can inject epics and then initialization on storeCreatedEvent', async () => {
		const plugin: PluginType = ({ injectEpics }) => {
			injectEpics({
				e1: createEpic<number, LocalStorageEffectType, empty>({
					vcet: 'E1_VCET',
					initialState: 0,
					updaters: {
						init: createUpdater({
							given: {},
							when: { _: storeCreatedEvent.condition },
							then: ({ R }) => {
								return R.mapState(() => 1)
							},
						}),
					},
				}),
				e2: createEpic<number, LocalStorageEffectType, empty>({
					vcet: 'E2_VCET',
					initialState: 0,
					updaters: {
						init: createUpdater({
							given: {},
							when: { _: storeCreatedEvent.condition },
							then: ({ R }) => {
								return R.mapState(() => 2)
							},
						}),
					},
				}),
			})
		}
		const store = createStore({
			epics: { },
			plugins: {
				p: plugin,
			},
		})

		expect(store.getState()[createPluginStateKey('e1')]).toBe(1)
		expect(store.getState()[createPluginStateKey('e2')]).toBe(2)
	})
	it('can inject updaters, updaters name spaced by plugin key', async () => {
		const e1 = createEpic<number, empty, PluginConfigType>({
			vcet: 'e1',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(() => -1),
				}),
			},
			pluginConfig: { injectStateIncOnCreateStore: true },
		})
		const e2 = createEpic<number, empty, empty>({
			vcet: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(() => 2),
				}),
			},
		})
		const e3 = createEpic<number, empty, PluginConfigType>({
			vcet: 'e3',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(() => 3),
				}),
			},
			pluginConfig: { injectStateIncOnCreateStore: true },
		})
		const plugin: PluginType = ({ injectUpdaters }) => {
			injectUpdaters((epic: EpicType<number, *, *, PluginConfigType>) => {
				const pluginConfig = epic.pluginConfig

				if (!pluginConfig || !pluginConfig.injectStateIncOnCreateStore) return

				return {
					inc: createUpdater<number, *, *, *, *>({
						given: {},
						when: { _: storeCreatedEvent.condition },
						then: ({ R }) => R.mapState(state => state + 1),
					}),
				}
			})
		}

		const store = createStore({
			epics: { e1, e2, e3 },
			plugins: { testPlugin: plugin },
		})

		expect(store.getState().e1).toBe(1)
		expect(store.getState().e2).toBe(0)
		expect(store.getState().e3).toBe(1)

		store.dispatch(a.create())

		expect(store.getState().e1).toBe(-1)
		expect(store.getState().e2).toBe(2)
		expect(store.getState().e3).toBe(3)
	})
})
