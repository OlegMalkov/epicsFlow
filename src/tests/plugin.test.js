// @flow

import {
	makeEpic,
	makeUpdater,
	createStore,
	traceToString,
	makeSACAC,
	type PluginType,
} from '../epics'

// can create a plugin that inject updaters into epics

// can do batch dispatch of multiple actions into multiple epics, but have only on onStateChanged will be triggered outside of store
// @flow strict

const a = makeSACAC('A')
const rehydrate = makeSACAC('REHYDRADE')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const e1 = makeEpic<number, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					conditions: { _a: a.c },
					reducer: ({ R }) => R.updateState(() => 1),
				}),
			},
		})
		const e2 = makeEpic<number, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					conditions: { _a: a.c },
					reducer: ({ R }) => R.updateState(() => 2),
				}),
			},
		})
		const esdbPlugin: PluginType = ({
			dispatch,
			dispatchBatchActionsIntoEpics, // dispatch multiple action into epic, but notify everybody only once
			getEpics,
			injectUpdaters,
			injectEpics,
		}) => {
			injectEpics({
				esdb: makeEpic<{| localStorageKeys: Array<string> | null |}, empty>({
					vat: 'ESDB_VAT',
					initialState: {
						localStorageKeys: null,
					},
					updaters: {

					},
				}),
			})
		}
		const store = createStore({
			epics: { e1, e2 },
			plugins: {
				esdb: esdbPlugin,
			},
			debug: { trace: e => console.log(traceToString(e))},
		})

		store.dispatch(a.ac())

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
})
