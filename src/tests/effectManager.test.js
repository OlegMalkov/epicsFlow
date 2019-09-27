// @flow strict

import {
	createEpic,
	createUpdater,
	createStore,
	createSimpleEvent,
} from '../epics'
import { type RequestAnimationFrameEffectType, AnimationFrameEvent, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = createSimpleEvent('A')

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
})
