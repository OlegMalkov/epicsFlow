// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	makeSimpleActionCreatorAndCondition,
	type BuiltInEffectType,
	storeCreated,
	dispatchBatchedActionsEffectCreator,
} from '../epics'
import { type RequestAnimationFrameEffectType, animationFrame, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = makeSimpleActionCreatorAndCondition('A')
const b = makeSimpleActionCreatorAndCondition('B')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = createEpic<number, CustomEpicEffectType, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					af: createUpdater({
						given: {},
						when: { _af: animationFrame.condition },
						then: ({ R }) => R.mapState(() => 1),
					}),
				},
			})


		const e2 = createEpic<number, CustomEpicEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.c },
					then: ({ R }) => R.sideEffect(requestAnimationFrameEC()),
				}),
				af: createUpdater({
					given: {},
					when: { _af: animationFrame.condition },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
			},
		})


		const store = createStore({
			effectManagers: {
				requestAnimationFrame: requestAnimationFrameEM,
			},
			epics: { e1, e2 },
		})

		store.dispatch(a.actionCreator())
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
						given: {},
						when: { _: storeCreated.condition.to(), _b: b.c.to() },
						then: ({ R }) => R.sideEffect(dispatchBatchedActionsEffectCreator([
							{ actions: [a.actionCreator(), a.actionCreator()], targetEpicVat: 'e2' },
							{ actions: [a.actionCreator(), a.actionCreator(), a.actionCreator()], targetEpicVat: 'e3' },
						])),
					}),
				},
			})


		const e2 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.c },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
				b: createUpdater({
					given: {},
					when: { _a: b.c },
					then: ({ R }) => R.mapState(() => 10),
				}),
			},
		})

		const e3 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.c },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
				b: createUpdater({
					given: {},
					when: { _b: b.c },
					then: ({ R }) => R.mapState(() => 10),
				}),
			},
		})

		const e4 = createEpic<number, BuiltInEffectType, empty>({
			vat: 'e4',
			initialState: 0,
			updaters: {
				e2: createUpdater({
					given: {},
					when: { e2: e2.c },
					then: ({ values: { e2 }, R }) => R.mapState(state => state + e2),
				}),
				e3: createUpdater({
					given: {},
					when: { e3: e3.c },
					then: ({ values: { e3 }, R }) => R.mapState(state => state + e3),
				}),
				b: createUpdater({
					given: {},
					when: { _b: b.c },
					then: ({ R }) => R.mapState(() => 0),
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

		store.subscribe(() => {
			storeStateChangedCounter = storeStateChangedCounter + 1
		})

		store.dispatch(b.actionCreator())

		expect(storeStateChangedCounter).toBe(1)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(12)
		expect(store.getState().e3).toBe(13)
		expect(store.getState().e4).toBe(25)
	})
})
