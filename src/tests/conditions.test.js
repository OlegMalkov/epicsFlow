// @flow
import { createStore, makeEpic, RT, makeCondition, makeUpdater } from '../epics'

type A = {| type: 'a', o: {| v: {| n: number |} |} |}

const 
	a = 'a',
	aAC = (n): A => ({ type: a, o: { v: { n } }}),
	aC = makeCondition<A>(a),
	aoC = aC.sk('o'),
	aovnC = aoC.sk('v').sk('n')

describe('conditions', () => {
	it('can chain selectors', () => {
		const
			e1 = makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: makeUpdater({ 
						conditions: { n: aovnC }, 
						reducer: ({ state, values: { n } }) => RT.updateState(state + n) 
					})
				}
			}),
			store = createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(6)
	})

	it('calls once if selector return same value by ref compare', () => {
		const 
			e1 = makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: makeUpdater({ 
						conditions: { n: aovnC }, 
						reducer: ({ state, values: { n } }) => RT.updateState(state + n) 
					})
				}
			}),
			store = createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(6)
	})

	it('calls twice if selector return different values by ref compare', () => {
		const 
			e1 = makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: makeUpdater({ 
						conditions: { o: aoC }, 
						reducer: ({ state, values: { o } }) => RT.updateState(state + o.v.n) 
					})
				}
			}),
			store = createStore({ epics: { e1 }	})
				
		store.dispatch(aAC(5))
		store.dispatch(aAC(5))
	
		expect(store.getState().e1).toBe(11)
	})

	it('calls twice if no selector present, even same action reference dispatched twice', () => {
		const 
			e1 = makeEpic<number, empty>({
				vat: 'e1',
				initialState: 1,
				updaters: {
					nChanged: makeUpdater({ 
						conditions: { _: aC }, 
						reducer: ({ state }) => RT.updateState(state + 1) 
					})
				}
			}),
			store = createStore({ epics: { e1 }	})
				
		const action = aAC(5)
		store.dispatch(action)
		store.dispatch(action)
	
		expect(store.getState().e1).toBe(3)
	})

	it('compute key correctly', () => {
		const 
			aC = makeCondition('A'),
			aP1C = aC.sk('p1'),
			aP1PassiveGOC = aP1C.p().g(() => true).o(),
			aP1P2PassiveC = aP1PassiveGOC.sk('p2')

		// $FlowFixMe
		expect(aP1C.key).toBe('A.p1')
		// $FlowFixMe
		expect(aP1PassiveGOC.key).toBe('A.p1')
		// $FlowFixMe
		expect(aP1P2PassiveC.key).toBe('A.p1.p2')
	})

	it('compute selectorPath correctly', () => {
		const 
			aC = makeCondition('A'),
			aP1C = aC.sk('p1'),
			aP1PassiveGOC = aP1C.p().g(() => true).o(),
			aP1P2PassiveC = aP1PassiveGOC.sk('p2')

		// $FlowFixMe
		expect(aP1C.selectorPath).toEqual(['p1'])
		// $FlowFixMe
		expect(aP1PassiveGOC.selectorPath).toEqual(['p1'])
		// $FlowFixMe
		expect(aP1P2PassiveC.selectorPath).toEqual(['p1', 'p2'])
	})

	it('reuse existiting root conditions', () => {
		const 
			aC = makeCondition('A'),
			aC1 = makeCondition('A')

		expect(aC).toBe(aC1)
	})

	it('reuse existiting child conditions', () => {
		const 
			aC = makeCondition('A'),
			aP1C = aC.sk('p1'),
			aP1C1 = aC.sk('p1')

		expect(aP1C).toBe(aP1C1)
	})

	it('not reuse existiting child conditions', () => {
		const 
			akC = makeCondition('A').sk('k'),
			akPC = makeCondition('A').sk('k').p(),
			akOPC = makeCondition('A').o().sk('k').p(),
			akmC = akC.sk('m'),
			akmPC = akPC.sk('m'),
			akmOPC = akOPC.sk('m')

		expect(akmC).not.toBe(akmPC)
		expect(akmC).not.toBe(akmOPC)
		expect(akmPC).not.toBe(akmOPC)

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

	// TODO guards
	// TODO selectors
	// TODO resetAllConditionsAfterThis
	// TODO matchAnyActionCondition
})