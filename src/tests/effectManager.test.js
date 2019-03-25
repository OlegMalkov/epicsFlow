// @flow strict

import {
	makeEpic,
	makeUpdater,
	createStore,
	makeSACAC,
	type BuiltInEffectType,
	storeCreated,
	dispatchBatchedActionsEffectCreator,
} from '../epics'
import { type RequestAnimationFrameEffectType, animationFrame, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = makeSACAC('A')
const b = makeSACAC('B')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = makeEpic<number, CustomEpicEffectType, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					af: makeUpdater({
						dependsOn: {},
						reactsTo: { _af: animationFrame.condition },
						exec: ({ R }) => R.updateState(() => 1),
					}),
				},
			})


		const e2 = makeEpic<number, CustomEpicEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					reactsTo: { _a: a.c },
					exec: ({ R }) => R.sideEffect(requestAnimationFrameEC()),
				}),
				af: makeUpdater({
					dependsOn: {},
					reactsTo: { _af: animationFrame.condition },
					exec: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})


		const store = createStore({
			effectManagers: {
				requestAnimationFrame: requestAnimationFrameEM,
			},
			epics: { e1, e2 },
		})

		store.dispatch(a.ac())
		await waitEffectManagers(store)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
	it.only('can exec batched dispach', async () => {
		const
			e1 = makeEpic<number, BuiltInEffectType, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					storeCreatedOrB: makeUpdater({
						dependsOn: {},
						reactsTo: { _: storeCreated.condition.to(), _b: b.c.to() },
						exec: ({ R }) => R.sideEffect(dispatchBatchedActionsEffectCreator([
							{ actions: [a.ac(), a.ac()], targetEpicVat: 'e2' },
							{ actions: [a.ac(), a.ac(), a.ac()], targetEpicVat: 'e3' },
						])),
					}),
				},
			})


		const e2 = makeEpic<number, BuiltInEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					reactsTo: { _a: a.c },
					exec: ({ R }) => R.updateState(state => state + 1),
				}),
				b: makeUpdater({
					dependsOn: {},
					reactsTo: { _a: b.c },
					exec: ({ R }) => R.updateState(() => 10),
				}),
			},
		})

		const e3 = makeEpic<number, BuiltInEffectType, empty>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					dependsOn: {},
					reactsTo: { _a: a.c },
					exec: ({ R }) => R.updateState(state => state + 1),
				}),
				b: makeUpdater({
					dependsOn: {},
					reactsTo: { _b: b.c },
					exec: ({ R }) => R.updateState(() => 10),
				}),
			},
		})

		const e4 = makeEpic<number, BuiltInEffectType, empty>({
			vat: 'e4',
			initialState: 0,
			updaters: {
				e2: makeUpdater({
					dependsOn: {},
					reactsTo: { e2: e2.c },
					exec: ({ values: { e2 }, R }) => R.updateState(state => state + e2),
				}),
				e3: makeUpdater({
					dependsOn: {},
					reactsTo: { e3: e3.c },
					exec: ({ values: { e3 }, R }) => R.updateState(state => state + e3),
				}),
				b: makeUpdater({
					dependsOn: {},
					reactsTo: { _b: b.c },
					exec: ({ R }) => R.updateState(() => 0),
				}),
			},
		})


		const store = createStore({
			effectManagers: {
				requestAnimationFrame: requestAnimationFrameEM,
			},
			epics: { e1, e2, e3, e4 },
		})
		let storeStateChangedCounter = 0

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(2)
		expect(store.getState().e3).toBe(3)
		expect(store.getState().e4).toBe(5)

		store.subscribeOnStateChange(() => {
			storeStateChangedCounter = storeStateChangedCounter + 1
		})

		store.dispatch(b.ac())

		expect(storeStateChangedCounter).toBe(1)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(12)
		expect(store.getState().e3).toBe(13)
		expect(store.getState().e4).toBe(25)
	})
})
