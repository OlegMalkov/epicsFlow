// @flow strict

import { makeCondition, makeEpic, makeUpdater, createStore, traceToString } from '../epics'
import { type RequestAnimationFrameEffectType, rafEC, afC, requestAnimationFrameEM } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

type CustomEpicEffectType = RequestAnimationFrameEffectType
type AType = {| to: {| v: {| n: number |} |}, type: typeof aAT |}

const aAT: 'a' = 'a'
const aAC = (n): AType => ({ type: aAT, to: { v: { n } }})
const aC = makeCondition<AType>(aAT)

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const
			e1 = makeEpic<number, CustomEpicEffectType>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					af: makeUpdater({
						conditions: { _af: afC },
						reducer: ({ R }) => R.updateState(() => 1),
					}),
				},
			})


		const e2 = makeEpic<number, CustomEpicEffectType>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				a: makeUpdater({
					conditions: { _a: aC },
					reducer: ({ R }) => R.sideEffect(rafEC()),
				}),
				af: makeUpdater({
					conditions: { _af: afC },
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

		store.dispatch(aAC(5))
		await waitEffectManagers(store)

		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
})
