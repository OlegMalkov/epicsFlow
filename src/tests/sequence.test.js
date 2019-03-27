// @flow strict
import {
	createStore,
	createEpic,
	createCondition,
	createEpicCondition,
	createUpdater,
	dispatchActionEffectCreator,
	type BuiltInEffectType,
} from '../epics'

describe('sequence', () => {
	it('simple actions sequence', () => {
		type StateType = {| a: number |}
		const x = 'x'
		const xAC = value => ({ type: x, value })
		const xCondition = createCondition<{ type: 'x', value: number }>(x)
		const y = 'y'
		const yAC = value => ({ type: y, value })
		const yC = createCondition<{ type: 'y', value: number }>(y)


		const e1 = createEpic<StateType, empty, empty>({
			vat: 'e1',
			initialState: { a: 0 },
			updaters: {
				a: createUpdater<StateType, *, *, *, *>({
					given: {},
					when: { x: xCondition.wsk('value'), y: yC.wsk('value') },
					then: ({ R, values: { x, y } }) => R.mapState(state => ({ a: state.a + x + y })),
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
		const aC = createCondition(a)
		const e1 = createEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				a: createUpdater<number, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
			},
		})
		const e2 = createEpic<number, empty, empty>({
			vat: 'e2',
			initialState: 1,
			updaters: {
				a: createUpdater<number, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
			},
		})
		const e3 = createEpic<number, empty, empty>({
			vat: 'e3',
			initialState: 0,
			updaters: {
				e1ORe2Changed: createUpdater<number, *, *, *, *>({
					given: {},
					when: { e1: e1.c, e2: e2.c },
					then: ({ R }) => R.mapState(state => state + 1),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2, e3 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e3).toBe(2)
	})

	it('should call e2 once if e1 changed e2 has to active given with selectors to it', () => {
		type StateType = {| a: number, b: number |}
		const a = 'a'
		const aC = createCondition<{ type: 'a' }>(a)
		const e1 = createEpic<StateType, empty, empty>({
			vat: 'e1',
			initialState: { a: 1, b: 1 },
			updaters: {
				a: createUpdater<StateType, *, *, *, *>({
					given: {},
					when: { _a: aC },
					then: ({ R }) => R.mapState(state => ({ a: state.a + 1, b: state.b - 1 })),
				}),
			},
		})
		const e2 = createEpic<number, empty, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				aORb: createUpdater<number, *, *, *, *>({
					given: {},
					when: {
						_a: e1.c.wsk('a'),
						_b: e1.c.wsk('b'),
					},
					then: ({ R }) => R.mapState(state => state + 1),
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
		const aC = createCondition(a)
		const e1 = createEpic<{| i: string, m: { [string]: {| kind: string |} } |}, empty, empty>({
			vat: 'e1',
			initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
			updaters: {
				a: createUpdater<{| i: string, m: { [string]: {| kind: string |} } |}, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R.mapState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' })),
				}),
			},
		})
		const e2 = createEpic<Array<string>, empty, empty>({
			vat: 'e2',
			initialState: [],
			updaters: {
				e1m: createUpdater<Array<string>, *, *, *, *>({
					given: {},
					when: { e1m: e1.c.wsk('m') },
					then: ({ values: { e1m }, R }) => R.mapState(() => Object.keys(e1m)),
				}),
			},
		})
		const e3 = createEpic<string, empty, empty>({
			vat: 'e3',
			initialState: '',
			updaters: {
				e1iORe2Changed: createUpdater<string, *, *, *, *>({
					given: { e1mRO: e1.c.wsk('m') },
					when: { e1i: e1.c.wsk('i'), e2: e2.c },
					then: ({ values: { e1mRO, e1i, e2 }, R }) => R.mapState(state => state + e1i + e1mRO[e1i].kind + e2.length),
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
		const aC = createCondition(a)
		const e1 = createEpic<{| i: string, m: { [string]: {| kind: string |} } |}, empty, empty>({
			vat: 'e1',
			initialState: { m: { x: { kind: 'dummy' } }, i: 'x' },
			updaters: {
				a: createUpdater<{| i: string, m: { [string]: {| kind: string |} } |}, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R.mapState(() => ({ m: { a: { kind: 'text' }, b: { kind: 'button' } }, i: 'a' })),
				}),
			},
		})
		const e2 = createEpic<Array<string>, empty, empty>({
			vat: 'e2',
			initialState: [],
			updaters: {
				e1m: createUpdater<Array<string>, *, *, *, *>({
					given: {},
					when: { e1m: e1.c.wsk('m') },
					then: ({ values: { e1m }, R }) => R.mapState(() => Object.keys(e1m)),
				}),
			},
		})
		const e3 = createEpic<string, empty, empty>({
			vat: 'e3',
			initialState: '',
			updaters: {
				e1iORe2Changed: createUpdater<string, *, *, *, *>({
					given: {},
					when: { e1mRO: e1.c.wsk('m'), e1i: e1.c.wsk('i'), e2: e2.c },
					then: ({ values: { e1mRO, e1i, e2 }, R }) => R.mapState(state => state + e1i + e1mRO[e1i].kind + e2.length),
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
		const aC = createCondition(a)
		const e1C = createEpicCondition<{| i: string, m: number, n: number |}>('e1')
		const e1 = createEpic<{| i: string, m: number, n: number |}, empty, empty>({
			vat: 'e1',
			initialState: { n: 0, m: 0, i: 'x' },
			updaters: {
				a: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R.mapState(state => ({ ...state, n: state.n + 1 })),
				}),
				e1nChanged: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { e1n: e1C.wsk('n').wg(n => n === 1) },
					then: ({ R, values: { e1n } }) => R.mapState(state => ({ ...state, m: state.m + e1n })),
				}),
				e1mChanged: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { e1m: e1C.wsk('m').wg(m => m === 1) },
					then: ({ R, values: { e1m } }) => R.mapState(state => ({ ...state, i: state.i + e1m })),
				}),
			},
		})
		const e2 = createEpic<{| a: string, b: string |}, empty, empty>({
			vat: 'e2',
			initialState: { a: '', b: '' },
			updaters: {
				e1: createUpdater<{| a: string, b: string |}, *, *, *, *>({
					given: {},
					when: { e1: e1.c },
					then: ({ values: { e1 }, R }) => R.mapState(state => ({ ...state, a: state.a + e1.i })),
				}),
				e1n: createUpdater<{| a: string, b: string |}, *, *, *, *>({
					given: {},
					when: { n: e1.c.wsk('n') },
					then: ({ values: { n }, R }) => R.mapState(state => ({ ...state, b: state.b + n })),
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
		const aC = createCondition(a)
		const bC = createCondition(b)
		const xCondition = createCondition(x)
		const e1 = createEpic<{| i: string, m: number, n: number |}, BuiltInEffectType, empty>({
			vat: 'e1',
			initialState: { n: 0, m: 0, i: 'x' },
			updaters: {
				a: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { whatever: aC },
					then: ({ R }) => R
						.sideEffect(dispatchActionEffectCreator({ type: b }))
						.mapState(state => ({ ...state, n: state.n + 1 })),
				}),
				b: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { b: bC },
					then: ({ R }) => R
						.mapState(state => ({ ...state, m: state.m + 1 }))
						.sideEffect(dispatchActionEffectCreator({ type: x })),
				}),
				x: createUpdater<{| i: string, m: number, n: number |}, *, *, *, *>({
					given: {},
					when: { x: xCondition },
					then: ({ R }) => R.mapState(state => ({ ...state, i: state.i + 1 })),
				}),
			},
		})
		const e2 = createEpic<{| a: string, b: string |}, empty, empty>({
			vat: 'e2',
			initialState: { a: '', b: '' },
			updaters: {
				e1: createUpdater<{| a: string, b: string |}, *, *, *, *>({
					given: {},
					when: { e1: e1.c },
					then: ({ values: { e1 }, R }) => R.mapState(state => ({ ...state, a: state.a + e1.i })),
				}),
				e1n: createUpdater<{| a: string, b: string |}, *, *, *, *>({
					given: {},
					when: { n: e1.c.wsk('n') },
					then: ({ values: { n }, R }) => R.mapState(state => ({ ...state, b: state.b + n })),
				}),
			},
		})
		const store = createStore({ epics: { e2, e1 } })

		store.dispatch({ type: a })

		// first call is for initial state initialization
		expect(store.getState().e2).toEqual({ a: 'xx1', b: '01' })
	})
})
