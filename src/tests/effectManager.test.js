// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	makeSimpleEvent,
	type BuiltInEffectType,
	storeCreatedEvent,
	dispatchBatchedMsgsEffectCreator,
} from '../epics'
import { type RequestAnimationFrameEffectType, AnimationFrameEvent, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = makeSimpleEvent('A')
const b = makeSimpleEvent('B')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = createEpic<number, CustomEpicEffectType, empty>({
				vcet: 'e1',
				initialState: 0,
				updaters: {
					af: createUpdater({
						given: {},
						when: { _af: AnimationFrameEvent.condition },
						then: ({ R }) => R.mapState(() => 1),
					}),
				},
			})


		const e2 = createEpic<number, CustomEpicEffectType, empty>({
			vcet: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.sideEffect(requestAnimationFrameEC()),
				}),
				af: createUpdater({
					given: {},
					when: { _af: AnimationFrameEvent.condition },
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

		store.dispatch(a.create())
		await waitEffectManagers(store)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
	it('can then batched dispach', async () => {
		const
			e1 = createEpic<number, BuiltInEffectType, empty>({
				vcet: 'e1',
				initialState: 0,
				updaters: {
					storeCreatedOrB: createUpdater({
						given: {},
						when: { _: storeCreatedEvent.condition.to(), _b: b.condition.to() },
						then: ({ R }) => R.sideEffect(dispatchBatchedMsgsEffectCreator([
							{ msgs: [a.create(), a.create()], targetEpicVcet: 'e2' },
							{ msgs: [a.create(), a.create(), a.create()], targetEpicVcet: 'e3' },
						])),
					}),
				},
			})


		const e2 = createEpic<number, BuiltInEffectType, empty>({
			vcet: 'e2',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
				b: createUpdater({
					given: {},
					when: { _a: b.condition },
					then: ({ R }) => R.mapState(() => 10),
				}),
			},
		})

		const e3 = createEpic<number, BuiltInEffectType, empty>({
			vcet: 'e3',
			initialState: 0,
			updaters: {
				a: createUpdater({
					given: {},
					when: { _a: a.condition },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
				b: createUpdater({
					given: {},
					when: { _b: b.condition },
					then: ({ R }) => R.mapState(() => 10),
				}),
			},
		})

		const e4 = createEpic<number, BuiltInEffectType, empty>({
			vcet: 'e4',
			initialState: 0,
			updaters: {
				e2: createUpdater({
					given: {},
					when: { e2: e2.condition },
					then: ({ values: { e2 }, R }) => R.mapState(state => state + e2),
				}),
				e3: createUpdater({
					given: {},
					when: { e3: e3.condition },
					then: ({ values: { e3 }, R }) => R.mapState(state => state + e3),
				}),
				b: createUpdater({
					given: {},
					when: { _b: b.condition },
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

		store.dispatch(b.create())

		expect(storeStateChangedCounter).toBe(1)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(12)
		expect(store.getState().e3).toBe(13)
		expect(store.getState().e4).toBe(25)
	})
})
