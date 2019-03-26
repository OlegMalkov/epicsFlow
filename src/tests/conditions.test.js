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

describe('dependsOn', () => {
	it('can chain selectors', () => {
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 1,
			updaters: {
				nChanged: makeUpdater({
					dependsOn: {},
					when: { n: aovnC },
					then: ({ values: { n }, R }) => R.updateState(state => state + n),
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
					dependsOn: {},
					when: {
						n: aovnC.withSelector(n => { return { a: n } }),
						n1: aovnC.ws(() => { return { a11: 11 } }),
					},
					then: ({ R, values: { n, n1 } }) => {
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
					dependsOn: {},
					when: {
						n: aovnC.withSelector(n => { return { a: n } }).wg((value) => value.a > 5),
					},
					then: ({ R, values: { n } }) => {
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
					dependsOn: {},
					when: {
						n: aovnC.wg(value => value > 5).toOptional(),
					},
					then: ({ R, values: { n } }) => {
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
					dependsOn: {},
					when: {
						n: aovnC.wg((n) => n > 5).withSelector(n => { return { a: n } }),
					},
					then: ({ R, values: { n } }) => {
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
					dependsOn: {},
					when: { n: aovnC },
					then: ({ R, values: { n } }) => R.updateState(state => state + n),
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
					dependsOn: {},
					when: { o: aoC },
					then: ({ R, values: { o } }) => R.updateState(state => state + o.v.n),
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
					dependsOn: {},
					when: { _: aC },
					then: ({ R }) => R.updateState(state => state + 1),
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

		// $FlowFixMe
		expect(aP1C.valueKey).toBe('AType.p1')
	})

	it('reuse existiting root dependsOn', () => {
		const aC = makeCondition('AType')
		const aC1 = makeCondition('AType')

		expect(aC).toBe(aC1)
	})

	it('reuse existiting child dependsOn', () => {
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

	it('not reuse existiting child dependsOn', () => {
		const akC = makeCondition('AType').wsk('k')
		const akGC = makeCondition('AType').wsk('k').wg(() => true)
		const akmC = akC.wsk('m')
		const akGmC = akGC.wsk('m')
		const akGmSC = akGC.wsk('m').ws(() => 1)

		expect(akmC).not.toBe(akGmC)
		expect(akGmC).not.toBe(akGmSC)

		// $FlowFixMe
		expect(akmC.passive).toBe(false)
		// $FlowFixMe
		expect(akmC.optional).toBe(false)
	})

	it('can not have guards for same level', () => {
		expect(
			() => aC.wg(() => true).wg(() => false)
		).toThrow('Guards can be applied only once per level. Condition "a.$$guard5" already has guard.')
	})

	it('can have nested guards', () => {
		const aGC = aC.wg(({ o }) => o.flag)
		const aoGC = aGC.wsk('o').wg(({ v }) => v.flag)
		const e1 = makeEpic<number, empty, empty>({
			vat: 'e1',
			initialState: 0,
			updaters: {
				nChanged: makeUpdater({
					dependsOn: {},
					when: { a: aGC, o: aoGC },
					then: ({ R, values: { a, o } }) => R.updateState(state => state + a.o.v.n + o.v.n),
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

		store.dispatch(aAC(5, false, true)) // if oFlag is false, child dependsOn are not evaluated
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
					dependsOn: {},
					when: {
						a: aC.wg((value) => value.o.v.n > 5),
					},
					then: ({ R, values: { a } }) => {
						return R.updateState(state => state + a.o.v.n)
					},
				}),
				aChangedWhenNLessThan5: makeUpdater({
					dependsOn: {},
					when: {
						a: aC.wg((value) => value.o.v.n < 5),
					},
					then: ({ R, values: { a } }) => {
						return R.updateState(state => state - a.o.v.n)
					},
				}),
				aChangedWhenNEquals5: makeUpdater({
					dependsOn: {},
					when: {
						a: aC.wg((value) => value.o.v.n === 5),
					},
					then: ({ R }) => {
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
					dependsOn: {},
					when: {
						n: aovnC.wg((value) => value > 5),
					},
					then: ({ R, values: { n } }) => {
						return R.updateState(state => state + n)
					},
				}),
				nLessThan5: makeUpdater({
					dependsOn: {},
					when: {
						n: aovnC.wg((value) => value < 5),
					},
					then: ({ R, values: { n } }) => {
						return R.updateState(state => state - n)
					},
				}),
				nEquals5: makeUpdater({
					dependsOn: {},
					when: {
						n: aovnC.wg((value) => value === 5),
					},
					then: ({ R }) => {
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
					dependsOn: {},
					when: { diff: nDiffC },
					then: ({ R, values: { diff } }) => R.updateState(state => state + diff),
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
					dependsOn: {},
					when: { a: aC },
					then: ({ R }) => R.updateState(state => ({ ...state, flag: true })),
				}),
				e2Changed: makeUpdater({
					dependsOn: {},
					when: { e2: makeEpicCondition<number>('e2') },
					then: ({ R }) => R.updateState(state => ({ ...state, value: state.value + 1 })),
				}),
			},
		})
		const e2 = makeEpic<number, empty, empty>({
			vat: 'e2',
			initialState: 0,
			updaters: {
				e1Changed: makeUpdater({
					dependsOn: {},
					when: { e1: e1.c.wsk('flag') },
					then: ({ R }) => R.updateState(state => state + 1),
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
