// @flow strict
import { initEpics } from '../epics'

type A = {| type: 'a', o: {| flag: boolean, v: {| flag: boolean, n: number |} |} |}

const 
	a = 'a',
	aAC = (n, oFlag = true, vFlag = true): A => ({ 
		type: a,
		o: {
			flag: oFlag,
			v: {
				flag: vFlag,
				n 
			} 
		}
	})

// conditions are using global variable to ensure reuse across app, so we need to reset epics before each test
let
	E = initEpics(),
	aC = E.makeCondition<A>(a),
	aoC = aC.wsk('o'),
	aovnC = aoC.wsk('v').wsk('n')

describe('conditions', () => {
	beforeEach(() => {
		E = initEpics(),
		aC = E.makeCondition<A>(a),
		aoC = aC.wsk('o'),
		aovnC = aoC.wsk('v').wsk('n')
	})

	it('can chain selectors', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { n: aovnC }, 
						reducer: ({ values: { n }, R }) => R.updateState(state => state + n) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(6)
	})


	it('condition is sealed if .withSelector is used', () => {
		const nC = aovnC.withSelector(n => { return { a: n } })

		// $FlowFixMe
		expect(nC.withSelector).toBe(undefined)
		// $FlowFixMe
		expect(nC.ws).toBe(undefined)
		// $FlowFixMe
		expect(nC.withSelectorKey).toBe(undefined)
		// $FlowFixMe
		expect(nC.wsk).toBe(undefined)
	})
	
	it('condition .withSelector works', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({
						conditions: { 
							n: aovnC.withSelector(n => { return { a: n } }),
							n1: aovnC.ws(() => { return { a11: 11 } })
						}, 
						reducer: ({ R, values: { n, n1 } }) => { 
							return R.updateState(state => state + n.a + n1.a11)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(16)
	})

	it('condition .withSelector + .withGuard works', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({
						conditions: { 
							n: aovnC.withSelector(n => { return { a: n } }).wg((value) => value.a > 5)
						}, 
						reducer: ({ R, values: { n } }) => { 
							return R.updateState(state => state + n.a)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
			
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(10))
		expect(store.getState().e1).toBe(16)
	})

	it('condition .withGuard + .toOptional works', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({
						conditions: { 
							n: aovnC.wg(value => value > 5).toOptional()
						}, 
						reducer: ({ R, values: { n } }) => { 
							return R.updateState(state => state + n)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
			
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(10))
		expect(store.getState().e1).toBe(16)
	})

	it('condition .withGuard + .withSelector works', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({
						conditions: { 
							n: aovnC.wg((n) => n > 5).withSelector(n => { return { a: n } })
						}, 
						reducer: ({ R, values: { n } }) => { 
							return R.updateState(state => state + n.a)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 } })
			
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(6)

		store.dispatch(aAC(10))
		expect(store.getState().e1).toBe(16)
	})

	it('calls once if selector return same value by ref compare', () => {
		const 
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { n: aovnC }, 
						reducer: ({ R, values: { n } }) => R.updateState(state => state + n) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(6)
	})

	it('calls twice if selector return different values by ref compare', () => {
		const 
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { o: aoC }, 
						reducer: ({ R, values: { o } }) => R.updateState(state => state + o.v.n) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(11)
	})

	it('calls twice if no selector present, even same action reference dispatched twice', () => {
		const 
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { _: aC }, 
						reducer: ({ R }) => R.updateState(state => state + 1) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
				
		const action = aAC(5)
		store.dispatch(action)
		store.dispatch(action)
	
		expect(store.getState().e1).toBe(3)
	})

	it('compute key correctly', () => {
		const 
			aC = E.makeCondition('A'),
			aP1C = aC.wsk('p1'),
			aP1GPassiveOC = aP1C.tp().wg(() => true).to(),
			aP1GP2PassiveC = aP1GPassiveOC.wsk('p2')

		// $FlowFixMe
		expect(aP1C.valueKey).toBe('A.p1')
		// $FlowFixMe
		expect(aP1GPassiveOC.valueKey).toBe('A.p1.$$guard0')
		// $FlowFixMe
		expect(aP1GP2PassiveC.valueKey).toBe('A.p1.$$guard0.p2')
	})

	it('reuse existiting root conditions', () => {
		const 
			aC = E.makeCondition('A'),
			aC1 = E.makeCondition('A')

		expect(aC).toBe(aC1)
	})

	it('reuse existiting child conditions', () => {
		const 
			aC = E.makeCondition('A'),
			aP1C = aC.wsk('p1'),
			aP1C1 = aC.wsk('p1'),
			selector = () => 1,
			guard = () => true,
			aSC = aC.ws(selector),
			aSC1 = aC.ws(selector),
			aGC = aC.wg(guard),
			aGC1 = aC.wg(guard)

		expect(aP1C).toBe(aP1C1)
		expect(aSC).toBe(aSC1)
		expect(aGC).toBe(aGC1)
	})

	it('not reuse existiting child conditions', () => {
		const 
			akC = E.makeCondition('A').wsk('k'),
			akPC = E.makeCondition('A').wsk('k').tp(),
			akGC = E.makeCondition('A').wsk('k').wg(() => true),
			akOPC = E.makeCondition('A').to().wsk('k').tp(),
			akmC = akC.wsk('m'),
			akmPC = akPC.wsk('m'),
			akmOPC = akOPC.wsk('m'),
			akGmC = akGC.wsk('m'),
			akGmSC = akGC.wsk('m').ws(() => 1),
			akGmSPC = akGmSC.tp()

		expect(akmC).not.toBe(akmPC)
		expect(akmC).not.toBe(akmOPC)
		expect(akmC).not.toBe(akGmC)
		expect(akmPC).not.toBe(akmOPC)
		expect(akGmC).not.toBe(akGmSC)
		expect(akGmSC).not.toBe(akGmSPC)
		expect(akGmC).not.toBe(akGmSPC)

		// $FlowFixMe
		expect(akmC.passive).toBe(false)
		// $FlowFixMe
		expect(akmC.optional).toBe(false)
		// $FlowFixMe
		expect(akmPC.passive).toBe(true)
		// $FlowFixMe
		expect(akmPC.optional).toBe(false)
		// $FlowFixMe
		expect(akmOPC.passive).toBe(true)
		// $FlowFixMe
		expect(akmOPC.optional).toBe(true)
	})

	it('can not have guards for same level', () => {
		expect(
			() => aC.wg(() => true).wg(() => false)
		).toThrow('Guards can be applied only once per level. Condition "a.$$guard0" already has guard.')
	})

	it('can have nested guards', () => {
		const 
			aGC = aC.wg(({ o }) => o.flag),
			aoGC = aGC.wsk('o').wg(({ v }) => v.flag),
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { a: aGC, o: aoGC }, 
						reducer: ({ R, values: { a, o } }) => R.updateState(state => state + a.o.v.n + o.v.n) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 } })
				
		store.dispatch(aAC(5, false, false))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(5, true, false))
		expect(store.getState().e1).toBe(0) // still 0 because o is not fullifiled yet

		store.dispatch(aAC(5, false, true))
		expect(store.getState().e1).toBe(0) // still 0 because o is not fullifiled yet

		store.dispatch(aAC(5, true, true))
		expect(store.getState().e1).toBe(10)

		store.dispatch(aAC(5, false, true)) // if oFlag is false, child conditions are not evaluated
		expect(store.getState().e1).toBe(10)

		store.dispatch(aAC(5, true, false)) // o is already happend, so we using it's value when a changed
		expect(store.getState().e1).toBe(20)

		store.dispatch(aAC(5, false, false))
		expect(store.getState().e1).toBe(20)
	})
	
	it('it is possible to have different guards for root level', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					aChangedWhenNMoreThan5: E.makeUpdater({
						conditions: { 
							a: aC.wg((value) => value.o.v.n > 5)
						}, 
						reducer: ({ R, values: { a } }) => { 
							return R.updateState(state => state + a.o.v.n)
						}
					}),
					aChangedWhenNLessThan5: E.makeUpdater({
						conditions: { 
							a: aC.wg((value) => value.o.v.n < 5)
						}, 
						reducer: ({ R, values: { a } }) => { 
							return R.updateState(state => state - a.o.v.n)
						}
					}),
					aChangedWhenNEquals5: E.makeUpdater({
						conditions: { 
							a: aC.wg((value) => value.o.v.n === 5)
						}, 
						reducer: ({ R }) => { 
							return R.updateState(state => state === 0 ? 1 : state * 2)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
			
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(1)
			
		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(7)

		store.dispatch(aAC(4))
		expect(store.getState().e1).toBe(3)
	})	

	it('it is possible to have different guards for not root level', () => {
		const
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nMoreThan5: E.makeUpdater({
						conditions: { 
							n: aovnC.wg((value) => value > 5)
						}, 
						reducer: ({ R, values: { n } }) => { 
							return R.updateState(state => state + n)
						}
					}),
					nLessThan5: E.makeUpdater({
						conditions: { 
							n: aovnC.wg((value) => value < 5)
						}, 
						reducer: ({ R, values: { n } }) => { 
							return R.updateState(state => state - n)
						}
					}),
					nEquals5: E.makeUpdater({
						conditions: { 
							n: aovnC.wg((value) => value === 5)
						}, 
						reducer: ({ R }) => { 
							return R.updateState(state => state === 0 ? 1 : state * 2)
						}
					})
				}
			}),
			store = E.createStore({ epics: { e1 } })
			
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(1)
			
		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(7)

		store.dispatch(aAC(4))
		expect(store.getState().e1).toBe(3)
	})

	it('can use prevValue inside selector of condition', () => {
		const 
			nDiffC = aC.ws((value, prevValue) => prevValue ? value.o.v.n - prevValue.o.v.n : 0),
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 0,
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { diff: nDiffC }, 
						reducer: ({ R, values: { diff } }) => R.updateState(state => state + diff) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 } })
				
		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(9))
		expect(store.getState().e1).toBe(4)

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(0)

		store.dispatch(aAC(20))
		expect(store.getState().e1).toBe(15)

		store.dispatch(aAC(40))
		expect(store.getState().e1).toBe(35)
	})

	it('if epic is changed multiple times during same action, but condition changed only once, updater should be called only once', () => {
		const
			E = initEpics(),
			aC = E.makeCondition<A>(a), 
			e1 = E.makeEpic<{| value: number, flag: boolean |}, empty>({
				vat: 'e1',
				initialState: { value: 0, flag: false },
				updaters: {
					nChanged: E.makeUpdater({ 
						conditions: { a: aC }, 
						reducer: ({ R }) => R.updateState(state => ({ ...state, flag: true })) 
					}),
					e2Changed: E.makeUpdater({ 
						conditions: { e2: E.makeEpicCondition<number>('e2') }, 
						reducer: ({ R }) => R.updateState(state => ({ ...state, value: state.value + 1 }))
					})
				}
			}),
			e2 = E.makeEpic<number, empty>({
				vat: 'e2',
				initialState: 0,
				updaters: {
					e1Changed: E.makeUpdater({ 
						conditions: { e1: e1.c.wsk('flag') }, 
						reducer: ({ R }) => R.updateState(state => state + 1)
					})
				}
			}),
			store = E.createStore({ epics: { e1, e2 } })

		store.dispatch(aAC(3))
		expect(store.getState()).toEqual({ e1: { flag: true, value: 2 }, e2: 2 })
	})

	// TODO resetAllConditionsAfterThis
	// TODO matchAnyActionCondition
})