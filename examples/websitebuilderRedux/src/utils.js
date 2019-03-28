// @flow

import { type Condition, type AnyActionType } from '../../../src/epics'

function buildValueSelector<V>(condition: Condition<V>, selectorPath = [], selector) {
	if (!(condition: any).parentCondition) {
		if (selectorPath.length === 0 && !selector) return x => x
		return x => {
			const value = selectorPath.reduce((x, key) => x[key], x)

			if (selector) return selector(value)
			return value
		}
	}
	return buildValueSelector((condition: any).parentCondition, (condition: any).selectorKey ? [(condition: any).selectorKey, ...selectorPath] : selectorPath, (condition: any).selector ? (condition: any).selector : selector)
}

const matchCondition = <S, V>(condition: Condition<V>): ((V => S => S) => (AnyActionType => S => S)) => {
	const valueSelector = buildValueSelector(condition)

	return (updater: (value: V) => (state: S) => S) => {
		return (action: AnyActionType) => (state: S): S => {
			if (condition.actionType === action.type) {
				const value: V = valueSelector((action: any))

				if (value !== undefined) {
					return updater(value)(state)
				}
			}

			return state
		}
	}
}

export {
	matchCondition,
}
