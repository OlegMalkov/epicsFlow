// @flow strict
import { initEpics } from '../epics'

let	E = initEpics()

describe('sequence', () => {
	beforeEach(() => {
		E = initEpics()
	})

	it('simple actions sequence', () => {
		type State = {| a: number |}
		const 
			x = 'x',
			xAC = value => ({ type: x, value }),
			xC = E.makeCondition<{ type: 'x', value: number }>(x),
			y = 'y',
			yAC = value => ({ type: y, value }),
			yC = E.makeCondition<{ type: 'y', value: number }>(y),
			e1 = E.makeEpic<State, empty>({
				vat: 'e1',
				initialState: { a: 0 },
				updaters: {
					a: E.makeUpdater<State, *, *, *>({ 
						conditions: { x: xC.wsk('value'), y: yC.wsk('value') }, 
						reducer: ({ R, values: { x, y } }) => R.updateState(state => ({ a: state.a + x + y })) 
					})
				}
			}),
			store = E.createStore({ epics: { e1 }	})
            
		store.dispatch(xAC(10))
		store.dispatch(yAC(10))
		store.dispatch(xAC(20))

		expect(store.getState().e1.a).toBe(50)
	})
	it.skip('should call e3 once if e1 and e2 are changed withing A and e3 depends on e1 and e2', () => {
		const 
			a = 'a',
			aC = E.makeCondition(a),
			e1 = E.makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					a: E.makeUpdater<number, *, *, *>({ 
						conditions: { whatever: aC }, 
						reducer: ({ R }) => R.updateState(state => state + 1) 
					})
				} 
			}),
			e2 = E.makeEpic<number, empty>({ 
				vat: 'e2', 
				initialState: 1,
				updaters: {
					a: E.makeUpdater<number, *, *, *>({ 
						conditions: { whatever: aC }, 
						reducer: ({ R }) => R.updateState(state => state + 1) 
					})
				}
			}),
			e3 = E.makeEpic<number, empty>({ 
				vat: 'e3',
				initialState: 0, 
				updaters: {
					e1ORe2Changed: E.makeUpdater<number, *, *, *>({ 
						conditions: { e1: e1.c, e2: e2.c }, 
						reducer: ({ R }) => R.updateState(state => state + 1) 
					})
				}
			}),
			store = E.createStore({ epics: { e1, e2, e3 }	})
            
		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe(2)
	})
    
	it('should call e2 once if e1 changed e2 has to active conditions with selectors to it', () => {
		type State = {| a: number, b: number |}
		const 
			a = 'a',
			aC = E.makeCondition<{ type: 'a' }>(a),
			e1 = E.makeEpic<State, empty>({
				vat: 'e1',
				initialState: { a: 1, b: 1 },
				updaters: {
					a: E.makeUpdater<State, *, *, *>({ 
						conditions: { _a: aC }, 
						reducer: ({ R }) => R.updateState(state => ({ a: state.a + 1, b: state.b - 1 })) 
					})
				}
			}),
			e2 = E.makeEpic<number, empty>({ 
				vat: 'e2', 
				initialState: 0,
				updaters: {
					aORb: E.makeUpdater<number, *, *, *>({ 
						conditions: { 
							_a: e1.c.wsk('a'), 
							_b: e1.c.wsk('b') 
						}, 
						reducer: ({ R }) => R.updateState(state => state + 1) 
					})
				}
			}),
			store = E.createStore({ epics: { e1, e2 }	})
            
		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e2).toBe(2)
	})

	it.skip('should have ro(e1.m) and e1.i in sync inside e3 when A changes e1.m and e1.i and e2 has active sub to e1.m and e3 has active sub to e2', () => {
		const 
			a = 'a',
			aC = E.makeCondition(a),
			e1 = E.makeEpic<{| m: { [string]: {| kind: string |} }, i: string |}, empty>({
				vat: 'e1',
				initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
				updaters: {
					a: E.makeUpdater<{| m: { [string]: {| kind: string |} }, i: string |}, *, *, *>({ 
						conditions: { whatever: aC }, 
						reducer: ({ R }) => R.updateState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' }))
					})
				} 
			}),
			e2 = E.makeEpic<Array<string>, empty>({ 
				vat: 'e2', 
				initialState: [],
				updaters: {
					e1m: E.makeUpdater<Array<string>, *, *, *>({ 
						conditions: { e1m: e1.c.wsk('m') }, 
						reducer: ({ values: { e1m }, R }) => R.updateState(() => Object.keys(e1m)) 
					})
				}
			}),
			e3 = E.makeEpic<string, empty>({ 
				vat: 'e3',
				initialState: '', 
				updaters: {
					e1iORe2Changed: E.makeUpdater<string, *, *, *>({ 
						conditions: { e1mRO: e1.c.wsk('m').tp(), e1i: e1.c.wsk('i'), e2: e2.c }, 
						reducer: ({ values: { e1mRO, e1i, e2 }, R }) => R.updateState(state => state + e1i + e1mRO[e1i].kind + e2.length) 
					})
				}
			}),
			store = E.createStore({ epics: { e1, e2, e3 } })
		
		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe('atext2')
	})

	it.skip('should have compute e3 once when A changes e1.m and e1.i and e2 has active sub to e1.m, e1.i and e3 has active sub to e2', () => {
		const 
			a = 'a',
			aC = E.makeCondition(a),
			e1 = E.makeEpic<{| m: { [string]: {| kind: string |} }, i: string |}, empty>({
				vat: 'e1',
				initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
				updaters: {
					a: E.makeUpdater<{| m: { [string]: {| kind: string |} }, i: string |}, *, *, *>({ 
						conditions: { whatever: aC }, 
						reducer: ({ R }) => R.updateState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' }))
					})
				} 
			}),
			e2 = E.makeEpic<Array<string>, empty>({ 
				vat: 'e2', 
				initialState: [],
				updaters: {
					e1m: E.makeUpdater<Array<string>, *, *, *>({ 
						conditions: { e1m: e1.c.wsk('m') }, 
						reducer: ({ values: { e1m }, R }) => R.updateState(() => Object.keys(e1m)) 
					})
				}
			}),
			e3 = E.makeEpic<string, empty>({ 
				vat: 'e3',
				initialState: '', 
				updaters: {
					e1iORe2Changed: E.makeUpdater<string, *, *, *>({ 
						conditions: { e1mRO: e1.c.wsk('m'), e1i: e1.c.wsk('i'), e2: e2.c }, 
						reducer: ({ values: { e1mRO, e1i, e2 }, R }) => R.updateState(state => state + e1i + e1mRO[e1i].kind + e2.length) 
					})
				}
			}),
			store = E.createStore({ epics: { e1, e2, e3 } })
		
		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe('atext2')
	})
})