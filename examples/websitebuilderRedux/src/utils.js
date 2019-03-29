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

const matchCondition = <V>(condition: Condition<V>): (AnyActionType => V | void) => {
	const valueSelector = buildValueSelector(condition)

	return (action: AnyActionType): V | void => {
		if (condition.actionType === action.type) {
			return valueSelector((action: any))
		}
	}
}

export {
	matchCondition,
}
