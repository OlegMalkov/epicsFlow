// @flow strict
import {
	type PluginType,
	storeCreated,
	makeSACAC,
	makeUpdater,
	dispatchActionEffectCreator,
	type BuiltInEffectType,
	type AnyValueType,
	getObjectKeys,
	type AnyConditionType,
	type AnyActionType,
	makeCondition,
	makeEpicWithScope,
} from '../epics'
import {
    type LocalStorageEffectType,
    localStorageSetItemsEC,
    localStorageGetItemEC,
    localStorageGetItemResult
} from '../effectManagers/localStorageEM';
import { setPath2, setProp } from '../utils';

type EffectType = BuiltInEffectType | LocalStorageEffectType
type EsdbPluginConfigType = {| esdbAggregate: true |}

const esdbRehydrate = makeSACAC('REHYDRADE')
const esdbSave = makeSACAC('SAVE')
const esdbMakeActionsLocalStorageKey = (now: number) => `esdb:${now}`
const esdbAggregatesStateLocalStorageKey = 'esdb_aggregates_states'

type ScopeType = {|
	aggregatesStates: { [string]: AnyValueType },
	notSavedActions: { [dateNow: number]: AnyActionType },
|}

const setAggregatesStates = setProp<ScopeType, *, *>('aggregatesStates')
const setAggregateState = (aggregateKey: string) => setPath2<ScopeType, *, *>('aggregatesStates', aggregateKey)
const addNotSavedAction = (action: AnyActionType) => (scope: ScopeType) => ({ ...scope, notSavedActions: { ...scope.notSavedActions, [`${Date.now()}`]: action } })
const esdbPlugin: PluginType = ({ injectEpics, getEpicsWithPluginConfig }) => {
	const epicAggregates = getEpicsWithPluginConfig().filter(({ pluginConfig }) => pluginConfig.esdbAggregate)
	const allActionConditionsTypesInUse = epicAggregates.reduce((result: Array<string>, { key, updaters }) => {
		getObjectKeys(updaters).forEach(updaterKey => {
			const conditions: { [string]: AnyConditionType } = updaters[updaterKey].conditions

			getObjectKeys(conditions).forEach(conditionKey => {
				const { actionType, isEpicCondition } = conditions[conditionKey]

				if (isEpicCondition) {
					throw new Error(`${key}.${updaterKey}.${conditionKey} is epic condition. Event source action can not be epics VATs, they should be actions, that describe user intentions.`)
				}

				if (result.indexOf(actionType) === -1) {
					result.push(actionType)
				}
			})
		})
		return result
	}, [])

	injectEpics({
		esdb: makeEpicWithScope<null, ScopeType, EffectType, empty>({
			vat: 'ESDB_VAT',
			initialState: null,
			initialScope: {
				notSavedActions: {},
				aggregatesStates: {},
			},
			updaters: {
				init: makeUpdater({
					conditions: { _: storeCreated.c },
					reducer: ({ R }) => {
						return R.sideEffect(dispatchActionEffectCreator(esdbRehydrate.ac()))
					},
				}),
				rehydrate: makeUpdater({
					conditions: { _: esdbRehydrate.c },
					reducer: ({ R }) => R.sideEffect(localStorageGetItemEC(esdbAggregatesStateLocalStorageKey)),
				}),
				aggregatesStatesRetrivedFromLocalStorage: makeUpdater({
					conditions: { aggregatesStates: localStorageGetItemResult.c.wsk('value') },
					reducer: ({ values: { aggregatesStates }, R }) => {
						if (!aggregatesStates) return R.doNothing

						return R.updateScope(setAggregatesStates(JSON.parse(aggregatesStates)))
					},
				}),
				save: makeUpdater({
					conditions: { _: esdbSave.c },
					reducer: ({ R, scope }) => R.sideEffect(localStorageSetItemsEC({
						[esdbMakeActionsLocalStorageKey(Date.now())]: scope.notSavedActions,
						[esdbAggregatesStateLocalStorageKey]: scope.aggregatesStates,
					})).updateScope(s => ({ ...s, notSavedActions: {} })),
				}),
				...epicAggregates.reduce((updaters, { key, condition }) => {
					updaters[`${key}_aggregate_changed`] = makeUpdater({
						conditions: { aggregateState: condition },
						reducer: ({ values: { aggregateState }, R }) => R.updateScope(setAggregateState(key)(aggregateState)),
					})
					return updaters
				}, {}),
				...allActionConditionsTypesInUse.reduce((updaters, actionType) => {
					updaters[`remember_${actionType}`] = makeUpdater({
						conditions: { action: makeCondition<AnyActionType>(actionType, false) },
						reducer: ({ values: { action }, R }) => R.updateScope(addNotSavedAction(action)),
					})

					return updaters
				}, {}),
			},
		}),
	})
}

// eslint-disable-next-line import/group-exports
export type {
	EsdbPluginConfigType,
}

// eslint-disable-next-line import/group-exports
export {
	esdbPlugin,
	esdbRehydrate,
	esdbSave,
	esdbMakeActionsLocalStorageKey,
	esdbAggregatesStateLocalStorageKey,
}
