// @flow strict

import {
	makeEpic,
	makeUpdater,
	createStore,
	makeSACAC,
	type PluginType,
	storeCreated,
	makePluginStateKey,
	type EpicType,
} from '../epics'
import { type LocalStorageEffectType } from '../effectManagers/localStorageEM'

type PluginConfigType = {| injectStateIncOnCreateStore: bool |}

const a = makeSACAC('A')

describe('plugin', () => {
	it('can inject epics and then initialization on storeCreated', async () => {
		const plugin: PluginType = ({ injectEpics }) => {
			injectEpics({
				e1: makeEpic<number, LocalStorageEffectType, empty>({
					vat: 'E1_VAT',
					initialState: 0,
					updaters: {
						init: makeUpdater({
							dependsOn: {},
							when: { _: storeCreated.condition },
							then: ({ R }) => {
								return R.updateState(() => 1)
							},
						}),
					},
				}),
				e2: makeEpic<number, LocalStorageEffectType, empty>({
					vat: 'E2_VAT',
					initialState: 0,
					updaters: {
						init: makeUpdater({
							dependsOn: {},
							when: { _: storeCreated.condition },
							then: ({ R }) => {
								return R.updateState(() => 2)
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

		expect(store.getState()[makePluginStateKey('e1')]).toBe(1)
		expect(store.getState()[makePluginStateKey('e2')]).toBe(2)
	})
	it('can inject updaters, updaters name spaced by plugin key', async () => {
		const e1 = makeEpic<number, empty, PluginConfigType>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(() => -1),
				}),
			},
			pluginConfig: { injectStateIncOnCreateStore: true },
		})
		const e2 = makeEpic<number, empty, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(() => 2),
				}),
			},
		})
		const e3 = makeEpic<number, empty, PluginConfigType>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(() => 3),
				}),
			},
			pluginConfig: { injectStateIncOnCreateStore: true },
		})
		const plugin: PluginType = ({ injectUpdaters }) => {
			injectUpdaters((epic: EpicType<number, *, *, PluginConfigType>) => {
				const pluginConfig = epic.pluginConfig

				if (!pluginConfig || !pluginConfig.injectStateIncOnCreateStore) return

				return {
					inc: makeUpdater<number, *, *, *, *>({
						dependsOn: {},
						when: { _: storeCreated.condition },
						then: ({ R }) => R.updateState(state => state + 1),
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

		store.dispatch(a.ac())

		expect(store.getState().e1).toBe(-1)
		expect(store.getState().e2).toBe(2)
		expect(store.getState().e3).toBe(3)
	})
})
