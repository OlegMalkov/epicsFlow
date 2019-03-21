// @flow strict
import {
    createStore,
    makeEpic,
    makeCondition,
    makeEpicCondition,
    makeUpdater,
    dispatchActionEffectCreator,
    type BuiltInEffectType,
    traceToString
} from '../epics';

describe('sequence', () => {
	it('simple actions sequence', () => {
		type StateType = {| a: number |}
		const x = 'x'
		const xAC = value => ({ type: x, value })
		const xCondition = makeCondition<{ type: 'x', value: number }>(x)
		const y = 'y'
		const yAC = value => ({ type: y, value })
		const yC = makeCondition<{ type: 'y', value: number }>(y)


		const e1 = makeEpic<StateType, empty>({
			vat: 'e1',
			initialState: { a: 0 },
			updaters: {
				a: makeUpdater<StateType, *, *, *>({
					conditions: { x: xCondition.wsk('value'), y: yC.wsk('value') },
					reducer: ({ R, values: { x, y } }) => R.updateState(state => ({ a: state.a + x + y })),
				}),
			},
		})


		const store = createStore({ epics: { e1 } })

		store.dispatch(xAC(10))
		store.dispatch(yAC(10))
		store.dispatch(xAC(20))

		expect(store.getState().e1.a).toBe(50)
	})
	it.skip('should call e3 once if e1 and e2 are changed withing A and e3 depends on e1 and e2', () => {
		const a = 'a'
		const aC = makeCondition(a)
		const e1 = makeEpic<number, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				a: makeUpdater<number, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const e2 = makeEpic<number, empty>({
			vat: 'e2',
			initialState: 1,
			updaters: {
				a: makeUpdater<number, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const e3 = makeEpic<number, empty>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				e1ORe2Changed: makeUpdater<number, *, *, *>({
					conditions: { e1: e1.c, e2: e2.c },
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2, e3 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe(2)
	})

	it('should call e2 once if e1 changed e2 has to active conditions with selectors to it', () => {
		type StateType = {| a: number, b: number |}
		const a = 'a'
		const aC = makeCondition<{ type: 'a' }>(a)
		const e1 = makeEpic<StateType, empty>({
			vat: 'e1',
			initialState: { a: 1, b: 1 },
			updaters: {
				a: makeUpdater<StateType, *, *, *>({
					conditions: { _a: aC },
					reducer: ({ R }) => R.updateState(state => ({ a: state.a + 1, b: state.b - 1 })),
				}),
			},
		})
		const e2 = makeEpic<number, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				aORb: makeUpdater<number, *, *, *>({
					conditions: {
						_a: e1.c.wsk('a'),
						_b: e1.c.wsk('b'),
					},
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e2).toBe(2)
	})

	it.skip('should have ro(e1.m) and e1.i in sync inside e3 when A changes e1.m and e1.i and e2 has active sub to e1.m and e3 has active sub to e2', () => {
		const a = 'a'
		const aC = makeCondition(a)
		const e1 = makeEpic<{| i: string, m: { [string]: {| kind: string |} } |}, empty>({
			vat: 'e1',
			initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
			updaters: {
				a: makeUpdater<{| i: string, m: { [string]: {| kind: string |} } |}, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R.updateState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' })),
				}),
			},
		})
		const e2 = makeEpic<Array<string>, empty>({
			vat: 'e2',
			initialState: [],
			updaters: {
				e1m: makeUpdater<Array<string>, *, *, *>({
					conditions: { e1m: e1.c.wsk('m') },
					reducer: ({ values: { e1m }, R }) => R.updateState(() => Object.keys(e1m)),
				}),
			},
		})
		const e3 = makeEpic<string, empty>({
			vat: 'e3',
			initialState: '',
			updaters: {
				e1iORe2Changed: makeUpdater<string, *, *, *>({
					conditions: { e1mRO: e1.c.wsk('m').tp(), e1i: e1.c.wsk('i'), e2: e2.c },
					reducer: ({ values: { e1mRO, e1i, e2 }, R }) => R.updateState(state => state + e1i + e1mRO[e1i].kind + e2.length),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2, e3 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe('atext2')
	})

	it.skip('should have compute e3 once when A changes e1.m and e1.i and e2 has active sub to e1.m, e1.i and e3 has active sub to e2', () => {
		const a = 'a'
		const aC = makeCondition(a)
		const e1 = makeEpic<{| i: string, m: { [string]: {| kind: string |} } |}, empty>({
			vat: 'e1',
			initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
			updaters: {
				a: makeUpdater<{| i: string, m: { [string]: {| kind: string |} } |}, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R.updateState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' })),
				}),
			},
		})
		const e2 = makeEpic<Array<string>, empty>({
			vat: 'e2',
			initialState: [],
			updaters: {
				e1m: makeUpdater<Array<string>, *, *, *>({
					conditions: { e1m: e1.c.wsk('m') },
					reducer: ({ values: { e1m }, R }) => R.updateState(() => Object.keys(e1m)),
				}),
			},
		})
		const e3 = makeEpic<string, empty>({
			vat: 'e3',
			initialState: '',
			updaters: {
				e1iORe2Changed: makeUpdater<string, *, *, *>({
					conditions: { e1mRO: e1.c.wsk('m'), e1i: e1.c.wsk('i'), e2: e2.c },
					reducer: ({ values: { e1mRO, e1i, e2 }, R }) => R.updateState(state => state + e1i + e1mRO[e1i].kind + e2.length),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2, e3 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe('atext2')
	})

	it('when e1 changes because of change in e1, e2 should be called only once', () => {
		const a = 'a'
		const aC = makeCondition(a)
		const e1C = makeEpicCondition<{| i: string, m: number, n: number |}>('e1')
		const e1 = makeEpic<{| i: string, m: number, n: number |}, empty>({
			vat: 'e1',
			initialState: { n: 0, m: 0, i: 'x' },
			updaters: {
				a: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R.updateState(state => ({ ...state, n: state.n + 1 })),
				}),
				e1nChanged: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { e1n: e1C.wsk('n').wg(n => n === 1) },
					reducer: ({ R, values: { e1n } }) => R.updateState(state => ({ ...state, m: state.m + e1n })),
				}),
				e1mChanged: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { e1m: e1C.wsk('m').wg(m => m === 1) },
					reducer: ({ R, values: { e1m } }) => R.updateState(state => ({ ...state, i: state.i + e1m })),
				}),
			},
		})
		const e2 = makeEpic<{| a: string, b: string |}, empty>({
			vat: 'e2',
			initialState: { a: '', b: '' },
			updaters: {
				e1: makeUpdater<{| a: string, b: string |}, *, *, *>({
					conditions: { e1: e1.c },
					reducer: ({ values: { e1 }, R }) => R.updateState(state => ({ ...state, a: state.a + e1.i })),
				}),
				e1n: makeUpdater<{| a: string, b: string |}, *, *, *>({
					conditions: { n: e1.c.wsk('n') },
					reducer: ({ values: { n }, R }) => R.updateState(state => ({ ...state, b: state.b + n })),
				}),
			},
		})
		const store = createStore({ epics: { e2, e1 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e2).toEqual({ a: 'xx1', b: '01' })
	})

	it('when e1 dispatch action and e1 has condition for this action, e2 should be called only once', () => {
		const a = 'a'
		const b = 'b'
		const x = 'x'
		const aC = makeCondition(a)
		const bC = makeCondition(b)
		const xCondition = makeCondition(x)
		const e1 = makeEpic<{| i: string, m: number, n: number |}, BuiltInEffectType>({
			vat: 'e1',
			initialState: { n: 0, m: 0, i: 'x' },
			updaters: {
				a: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { whatever: aC },
					reducer: ({ R }) => R
						.sideEffect(dispatchActionEffectCreator({ type: b }))
						.updateState(state => ({ ...state, n: state.n + 1 })),
				}),
				b: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { b: bC },
					reducer: ({ R }) => R
						.updateState(state => ({ ...state, m: state.m + 1 }))
						.sideEffect(dispatchActionEffectCreator({ type: x })),
				}),
				x: makeUpdater<{| i: string, m: number, n: number |}, *, *, *>({
					conditions: { x: xCondition },
					reducer: ({ R }) => R.updateState(state => ({ ...state, i: state.i + 1 })),
				}),
			},
		})
		const e2 = makeEpic<{| a: string, b: string |}, empty>({
			vat: 'e2',
			initialState: { a: '', b: '' },
			updaters: {
				e1: makeUpdater<{| a: string, b: string |}, *, *, *>({
					conditions: { e1: e1.c },
					reducer: ({ values: { e1 }, R }) => R.updateState(state => ({ ...state, a: state.a + e1.i })),
				}),
				e1n: makeUpdater<{| a: string, b: string |}, *, *, *>({
					conditions: { n: e1.c.wsk('n') },
					reducer: ({ values: { n }, R }) => R.updateState(state => ({ ...state, b: state.b + n })),
				}),
			},
		})
		const store = createStore({ epics: { e2, e1 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e2).toEqual({ a: 'xx1', b: '01' })
	})
})
