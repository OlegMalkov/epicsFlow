// @flow strict
import { makeCondition, makeEpic, makeUpdater, createStore, makeEpicCondition } from '../epics'

type AType = {| o: {| flag: bool, v: {| flag: bool, n: number |} |}, type: 'a' |}

const a = 'a'
const aAC = (n, oFlag = true, vFlag = true): AType => ({
	type: a,
	o: {
		flag: oFlag,
		v: {
			flag: vFlag,
			n,
		},
	},
})
const aC = makeCondition<AType>(a)
const aoC = aC.wsk('o')
const aovnC = aoC.wsk('v').wsk('n')

describe('conditions', () => {
	it('can chain selectors', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				nChanged: makeUpdater({
					conditions: { n: aovnC },
					reducer: ({ values: { n }, R }) => R.updateState(state => state + n),
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

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
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: {
						n: aovnC.withSelector(n => { return { a: n } }),
						n1: aovnC.ws(() => { return { a11: 11 } }),
					},
					reducer: ({ R, values: { n, n1 } }) => {
						return R.updateState(state => state + n.a + n1.a11)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

		store.dispatch(aAC(5))

		expect(store.getState().e1).toBe(16)
	})

	it('condition .withSelector + .withGuard works', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: {
						n: aovnC.withSelector(n => { return { a: n } }).wg((value) => value.a > 5),
					},
					reducer: ({ R, values: { n } }) => {
						return R.updateState(state => state + n.a)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

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
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: {
						n: aovnC.wg(value => value > 5).toOptional(),
					},
					reducer: ({ R, values: { n } }) => {
						return R.updateState(state => state + n)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

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
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: {
						n: aovnC.wg((n) => n > 5).withSelector(n => { return { a: n } }),
					},
					reducer: ({ R, values: { n } }) => {
						return R.updateState(state => state + n.a)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 } })

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
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				nChanged: makeUpdater({
					conditions: { n: aovnC },
					reducer: ({ R, values: { n } }) => R.updateState(state => state + n),
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

		store.dispatch(aAC(5))
		store.dispatch(aAC(5))

		expect(store.getState().e1).toBe(6)
	})

	it('calls twice if selector return different values by ref compare', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				nChanged: makeUpdater({
					conditions: { o: aoC },
					reducer: ({ R, values: { o } }) => R.updateState(state => state + o.v.n),
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

		store.dispatch(aAC(5))
		store.dispatch(aAC(5))

		expect(store.getState().e1).toBe(11)
	})

	it('calls twice if no selector present, even same action reference dispatched twice', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				nChanged: makeUpdater({
					conditions: { _: aC },
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})
		const action = aAC(5)

		store.dispatch(action)
		store.dispatch(action)

		expect(store.getState().e1).toBe(3)
	})

	it('compute key correctly', () => {
		const aC = makeCondition('AType')
		const aP1C = aC.wsk('p1')
		const aP1GPassiveOC = aP1C.tp().wg(() => true).to()
		const aP1GP2PassiveC = aP1GPassiveOC.wsk('p2')

		// $FlowFixMe
		expect(aP1C.valueKey).toBe('AType.p1')
		// $FlowFixMe
		expect(aP1GPassiveOC.valueKey).toBe('AType.p1.$$guard3')
		// $FlowFixMe
		expect(aP1GP2PassiveC.valueKey).toBe('AType.p1.$$guard3.p2')
	})

	it('reuse existiting root conditions', () => {
		const aC = makeCondition('AType')
		const aC1 = makeCondition('AType')

		expect(aC).toBe(aC1)
	})

	it('reuse existiting child conditions', () => {
		const aC = makeCondition('AType')
		const aP1C = aC.wsk('p1')
		const aP1C1 = aC.wsk('p1')
		const selector = () => 1
		const guard = () => true
		const aSC = aC.ws(selector)
		const aSC1 = aC.ws(selector)
		const aGC = aC.wg(guard)
		const aGC1 = aC.wg(guard)

		expect(aP1C).toBe(aP1C1)
		expect(aSC).toBe(aSC1)
		expect(aGC).toBe(aGC1)
	})

	it('not reuse existiting child conditions', () => {
		const akC = makeCondition('AType').wsk('k')
		const akPC = makeCondition('AType').wsk('k').tp()
		const akGC = makeCondition('AType').wsk('k').wg(() => true)
		const akOPC = makeCondition('AType').to().wsk('k').tp()
		const akmC = akC.wsk('m')
		const akmPC = akPC.wsk('m')
		const akmOPC = akOPC.wsk('m')
		const akGmC = akGC.wsk('m')
		const akGmSC = akGC.wsk('m').ws(() => 1)
		const akGmSPC = akGmSC.tp()

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
		).toThrow('Guards can be applied only once per level. Condition "a.$$guard6" already has guard.')
	})

	it('can have nested guards', () => {
		const aGC = aC.wg(({ o }) => o.flag)
		const aoGC = aGC.wsk('o').wg(({ v }) => v.flag)
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: { a: aGC, o: aoGC },
					reducer: ({ R, values: { a, o } }) => R.updateState(state => state + a.o.v.n + o.v.n),
				}),
			},
		})
		const store = createStore({ epics: { e1 } })

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
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				aChangedWhenNMoreThan5: makeUpdater({
					conditions: {
						a: aC.wg((value) => value.o.v.n > 5),
					},
					reducer: ({ R, values: { a } }) => {
						return R.updateState(state => state + a.o.v.n)
					},
				}),
				aChangedWhenNLessThan5: makeUpdater({
					conditions: {
						a: aC.wg((value) => value.o.v.n < 5),
					},
					reducer: ({ R, values: { a } }) => {
						return R.updateState(state => state - a.o.v.n)
					},
				}),
				aChangedWhenNEquals5: makeUpdater({
					conditions: {
						a: aC.wg((value) => value.o.v.n === 5),
					},
					reducer: ({ R }) => {
						return R.updateState(state => state === 0 ? 1 : state * 2)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 }	})

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(1)

		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(7)

		store.dispatch(aAC(4))
		expect(store.getState().e1).toBe(3)
	})

	it('it is possible to have different guards for not root level', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nMoreThan5: makeUpdater({
					conditions: {
						n: aovnC.wg((value) => value > 5),
					},
					reducer: ({ R, values: { n } }) => {
						return R.updateState(state => state + n)
					},
				}),
				nLessThan5: makeUpdater({
					conditions: {
						n: aovnC.wg((value) => value < 5),
					},
					reducer: ({ R, values: { n } }) => {
						return R.updateState(state => state - n)
					},
				}),
				nEquals5: makeUpdater({
					conditions: {
						n: aovnC.wg((value) => value === 5),
					},
					reducer: ({ R }) => {
						return R.updateState(state => state === 0 ? 1 : state * 2)
					},
				}),
			},
		})
		const store = createStore({ epics: { e1 } })

		store.dispatch(aAC(5))
		expect(store.getState().e1).toBe(1)

		store.dispatch(aAC(6))
		expect(store.getState().e1).toBe(7)

		store.dispatch(aAC(4))
		expect(store.getState().e1).toBe(3)
	})

	it('can use prevValue inside selector of condition', () => {
		const nDiffC = aC.ws((value, prevValue) => prevValue ? value.o.v.n - prevValue.o.v.n : 0)
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					conditions: { diff: nDiffC },
					reducer: ({ R, values: { diff } }) => R.updateState(state => state + diff),
				}),
			},
		})
		const store = createStore({ epics: { e1 } })

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
		const aC = makeCondition<AType>(a)
		const e1 = makeEpic<{| flag: bool, value: number |}, empty, empty>({
			vat: 'e1',
			initialState: { value: 0, flag: false },
			updaters: {
				nChanged: makeUpdater({
					conditions: { a: aC },
					reducer: ({ R }) => R.updateState(state => ({ ...state, flag: true })),
				}),
				e2Changed: makeUpdater({
					conditions: { e2: makeEpicCondition<number>('e2') },
					reducer: ({ R }) => R.updateState(state => ({ ...state, value: state.value + 1 })),
				}),
			},
		})
		const e2 = makeEpic<number, empty, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				e1Changed: makeUpdater({
					conditions: { e1: e1.c.wsk('flag') },
					reducer: ({ R }) => R.updateState(state => state + 1),
				}),
			},
		})
		const store = createStore({ epics: { e1, e2 } })

		store.dispatch(aAC(3))
		expect(store.getState()).toEqual({ e1: { flag: true, value: 2 }, e2: 2 })
	})

	// TODO resetAllConditionsAfterThis
	// TODO matchAnyActionCondition
})
