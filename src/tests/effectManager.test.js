// @flow strict

import { makeEpic, makeUpdater, createStore, makeSACAC } from '../epics'
import { type RequestAnimationFrameEffectType, animationFrame, requestAnimationFrameEM, requestAnimationFrameEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType

const a = makeSACAC('A')

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = makeEpic<number, CustomEpicEffectType>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					af: makeUpdater({
						conditions: { _af: animationFrame.condition },
						reducer: ({ R }) => R.updateState(() => 1),
					}),
				},
			})


		const e2 = makeEpic<number, CustomEpicEffectType>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					conditions: { _a: a.c },
					reducer: ({ R }) => R.sideEffect(requestAnimationFrameEC()),
				}),
				af: makeUpdater({
					conditions: { _af: animationFrame.condition },
					reducer: ({ R }) => R.updateState(state => state + 1),
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
})
