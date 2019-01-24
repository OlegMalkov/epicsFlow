// @flow
import { createStore, makeEpic, RT, makeCondition, makeUpdater } from '../epics'
import { requestAnimationFrameEM, type RequestAnimationFrameEffect, afC, rafEC } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

const
	aAT: 'a' = 'a'

type A = {| type: typeof aAT, o: {| v: {| n: number |} |} |}

const 
	aAC = (n): A => ({ type: aAT, o: { v: { n } }}),
	aC = makeCondition<A>(aAT)
	
type CustomEpicEffect = RequestAnimationFrameEffect

describe('effectManager', () => {
	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const 
			e1 = makeEpic<number, CustomEpicEffect>({
				vat: 'e1',
				initialState: 0,
				updaters: { 
					af: makeUpdater({ 
						conditions: { _af: afC }, 
						reducer: () => RT.updateState(1)
					})
				} 
			}),
			e2 = makeEpic<number, CustomEpicEffect>({
				vat: 'e2',
				initialState: 0,
				updaters: {
					a: makeUpdater({ 
						conditions: { _a: aC }, 
						reducer: () => RT.sideEffects([rafEC()])
					}),
					af: makeUpdater({
						conditions: { _af: afC },
						reducer: ({ state }) => RT.updateState(state + 1)
					})
				}
			}),
			store = createStore({ 
				effectManagers: {
					requestAnimationFrame: requestAnimationFrameEM,
				},
				epics: { e1, e2 }
			})
				
		store.dispatch(aAC(5))
		await waitEffectManagers(store)
	
		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
})