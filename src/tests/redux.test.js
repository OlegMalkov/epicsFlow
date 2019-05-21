// @flow strict

import {
	createEpic,
	createEpicFromReduxReducer,
	createUpdaterWithReducer,
	createStore,
	makeCommand,
	makeSimpleCommand,
} from '../epics'

type StateType = {| counter: number |}

const IncCmd = makeSimpleCommand('INC')
const IncByCmd = makeCommand<{| amount: number |}>('INC_BY')

describe('redux', () => {
	it('can use redux reducer to create epic', async () => {
		const reduxReducer = (state: StateType | void, action): StateType => {
			if (state === undefined) return { counter: 0 }

			if (action.type === IncCmd.type) return { ...state, counter: state.counter + 1 }

			const incByCmd = IncByCmd.match(action)

			if (incByCmd) {
				return { ...state, counter: state.counter + incByCmd.amount }
			}

			return state
		}

		const myCounter = createEpicFromReduxReducer<StateType>(reduxReducer)

		const store = createStore({
			epics: {
				myCounter,
			},
		})

		store.dispatch({ type: 'DUMMY' })
		store.dispatch(IncCmd.create())
		store.dispatch(IncByCmd.create({ amount: 5 }))

		expect(store.getState().myCounter.counter).toBe(6)
	})

	it('can use create updater with redux reducer', async () => {
		const myCounter = createEpic<StateType, *, *>({
			initialState: { counter: 0 },
			updaters: {
				inc: createUpdaterWithReducer(
					IncCmd,
					state => ({ ...state, counter: state.counter + 1 })
				),
				incBy: createUpdaterWithReducer(
					IncByCmd,
					(state, action) => ({ ...state, counter: state.counter + action.amount })
				),
			},
		})

		const store = createStore({
			epics: {
				myCounter,
			},
		})

		store.dispatch({ type: 'DUMMY' })
		store.dispatch(IncCmd.create())
		store.dispatch(IncByCmd.create({ amount: 5 }))

		expect(store.getState().myCounter.counter).toBe(6)
	})
})
