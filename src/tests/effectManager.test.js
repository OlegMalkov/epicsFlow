// @flow strict
import { initEpics } from '../epics'
import { type RequestAnimationFrameEffect, rafEC, initRequestAnimationFrameEM } from '../effectManagers/requestAnimationFrameEM'
import { waitEffectManagers } from './utils'

const
	aAT: 'a' = 'a'

type A = {| type: typeof aAT, to: {| v: {| n: number |} |} |}

const 
	aAC = (n): A => ({ type: aAT, to: { v: { n } }})
	
let
	E = initEpics(),
	raf = initRequestAnimationFrameEM(E),
	aC = E.makeCondition<A>(aAT)

type CustomEpicEffect = RequestAnimationFrameEffect

describe('effectManager', () => {
	beforeEach(() => {
		(E = initEpics(), raf = initRequestAnimationFrameEM(E))
		aC = E.makeCondition<A>(aAT)
	})

	it('only epic that requested effect can receive response from effect manager (animation frame)', async () => {
		const 
			e1 = E.makeEpic<number, CustomEpicEffect>({
				vat: 'e1',
				initialState: 0,
				updaters: { 
					af: E.makeUpdater({ 
						conditions: { _af: raf.afC }, 
						reducer: () => E.RT.updateState(1)
					})
				} 
			}),
			e2 = E.makeEpic<number, CustomEpicEffect>({
				vat: 'e2',
				initialState: 0,
				updaters: {
					a: E.makeUpdater({ 
						conditions: { _a: aC }, 
						reducer: () => E.RT.sideEffects([rafEC()])
					}),
					af: E.makeUpdater({
						conditions: { _af: raf.afC },
						reducer: ({ state }) => E.RT.updateState(state + 1)
					})
				}
			}),
			store = E.createStore({ 
				effectManagers: {
					requestAnimationFrame: raf.requestAnimationFrameEM,
				},
				epics: { e1, e2 }
			})
				
		store.dispatch(aAC(5))
		await waitEffectManagers(store)
	
		expect(store.getState().e1).toBe(0)
		expect(store.getState().e2).toBe(1)
	})
})