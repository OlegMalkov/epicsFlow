// @flow strict

import {
	createEpicFromReduxReducer,
	createStore,
	makeCommand,
	makeSimpleCommand,
	createConditionMatcher,
} from '../epics'

type ReduxReducerStateType = {| counter: number |}

const IncCmd = makeSimpleCommand('INC')
const IncByCmd = makeCommand<{| amount: number |}>('INC_BY')
const IncByCmdConditionMatcher = createConditionMatcher(IncByCmd.condition)

describe('createStore', () => {
	it('can use redux reducer to create epic', async () => {
		const reduxReducer = (state: ReduxReducerStateType | void, action): ReduxReducerStateType => {
			if (state === undefined) return { counter: 0 }

			if (action.type === IncCmd.type) return { ...state, counter: state.counter + 1 }

			const incByCmd = IncByCmdConditionMatcher(action)

			if (incByCmd) {
				return { ...state, counter: state.counter + incByCmd.amount }
			}

			return state
		}

		const myCounter = createEpicFromReduxReducer<ReduxReducerStateType>(reduxReducer)

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
