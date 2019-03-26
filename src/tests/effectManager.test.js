// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	createSACAC,
	type BuiltInEffectType,
	storeCreated,
	dispatchBatchedActionsEffectCreator,
} from '../epics'
import { type RequestAnimationFrameEffectType, animationFrame, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = createSACAC('A')
const b = createSACAC('B')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = createEpic<number, CustomEpicEffectType, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					af: createUpdater({
						dependsOn: {},
						when: { _af: animationFrame.condition },
						then: ({ R }) => R.updateState(() => 1),
					}),
				},
			})


		const e2 = createEpic<number, CustomEpicEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.sideEffect(requestAnimationFrameEC()),
				}),
				af: createUpdater({
					dependsOn: {},
					when: { _af: animationFrame.condition },
					then: ({ R }) => R.updateState(state => state + 1),
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
	it.only('can then batched dispach', async () => {
		const
			e1 = createEpic<number, BuiltInEffectType, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					storeCreatedOrB: createUpdater({
						dependsOn: {},
						when: { _: storeCreated.condition.to(), _b: b.c.to() },
						then: ({ R }) => R.sideEffect(dispatchBatchedActionsEffectCreator([
							{ actions: [a.ac(), a.ac()], targetEpicVat: 'e2' },
							{ actions: [a.ac(), a.ac(), a.ac()], targetEpicVat: 'e3' },
						])),
					}),
				},
			})


		const e2 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(state => state + 1),
				}),
				b: createUpdater({
					dependsOn: {},
					when: { _a: b.c },
					then: ({ R }) => R.updateState(() => 10),
				}),
			},
		})

		const e3 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				a: createUpdater({
					dependsOn: {},
					when: { _a: a.c },
					then: ({ R }) => R.updateState(state => state + 1),
				}),
				b: createUpdater({
					dependsOn: {},
					when: { _b: b.c },
					then: ({ R }) => R.updateState(() => 10),
				}),
			},
		})

		const e4 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e4',
			initialState: 0,
			updaters: {
				e2: createUpdater({
					dependsOn: {},
					when: { e2: e2.c },
					then: ({ values: { e2 }, R }) => R.updateState(state => state + e2),
				}),
				e3: createUpdater({
					dependsOn: {},
					when: { e3: e3.c },
					then: ({ values: { e3 }, R }) => R.updateState(state => state + e3),
				}),
				b: createUpdater({
					dependsOn: {},
					when: { _b: b.c },
					then: ({ R }) => R.updateState(() => 0),
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
