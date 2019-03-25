// @flow
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
	makeACAC,
} from '../epics'
import {
	type LocalStorageEffectType,
	localStorageSetItemsEC,
	localStorageGetItemEC,
	localStorageGetItemResult,
} from '../effectManagers/localStorageEM'
import { setPath2, setProp } from '../utils'

type EffectType = BuiltInEffectType | LocalStorageEffectType
type EsdbPluginConfigType = {| esdbAggregate: true |}

const esdbRehydrateRequest = makeSACAC('REHYDRADE_REQUEST')
const esdbRehydrateAggregates = makeACAC<{| aggregatesStatesByVat: { [vat: string]: AnyValueType } |}>('REHYDRADE_AGGREGATES')
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
const esdbPlugin: PluginType = ({ injectEpics, injectUpdaters, getEpicsWithPluginConfig }) => {
	const epicAggregates = getEpicsWithPluginConfig().filter(({ pluginConfig }) => pluginConfig.esdbAggregate)
	const allActionConditionsTypesInUse = epicAggregates.reduce((result: Array<string>, { key, updaters }) => {
		getObjectKeys(updaters).forEach(updaterKey => {
			const updater = updaters[updaterKey]
			const condtitions: { [string]: AnyConditionType } = updater.conditions

			getObjectKeys(condtitions).forEach(conditionKey => {
				const { actionType, isEpicCondition } = condtitions[conditionKey]

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

	injectUpdaters(epic => {
		if (epicAggregates.find(({ vat }) => epic.vat === vat)) {
			return {
				rehydrate: makeUpdater({
					dependsOn: {},
					reactsTo: { aggregatesStatesByVat: esdbRehydrateAggregates.c.wsk('aggregatesStatesByVat') },
					exec: ({ values: { aggregatesStatesByVat }, R }) => {
						return aggregatesStatesByVat.hasOwnProperty(epic.vat) ? R.updateState(() => aggregatesStatesByVat[epic.vat]) : R.doNothing
					},
				}),
			}
		}
	})

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
					dependsOn: {},
					reactsTo: { _: storeCreated.c },
					exec: ({ R }) => {
						return R.sideEffect(dispatchActionEffectCreator(esdbRehydrateRequest.ac()))
					},
				}),
				rehydrate: makeUpdater({
					dependsOn: {},
					reactsTo: { _: esdbRehydrateRequest.c },
					exec: ({ R }) => R.sideEffect(localStorageGetItemEC(esdbAggregatesStateLocalStorageKey)),
				}),
				aggregatesStatesRetrivedFromLocalStorage: makeUpdater({
					dependsOn: {},
					reactsTo: { aggregatesStates: localStorageGetItemResult.c.wsk('value') },
					exec: ({ values: { aggregatesStates }, R }) => {
						if (!aggregatesStates) return R.doNothing
						const aggregatesStatesByVat: { [vat: string]: AnyValueType } = JSON.parse(aggregatesStates)

						return R
							.updateScope(setAggregatesStates(aggregatesStatesByVat))
							.sideEffect(dispatchActionEffectCreator(esdbRehydrateAggregates.ac({ aggregatesStatesByVat })))
					},
				}),
				save: makeUpdater({
					dependsOn: {},
					reactsTo: { _: esdbSave.c },
					exec: ({ R, scope }) => R.sideEffect(localStorageSetItemsEC({
						[esdbMakeActionsLocalStorageKey(Date.now())]: scope.notSavedActions,
						[esdbAggregatesStateLocalStorageKey]: scope.aggregatesStates,
					})).updateScope(s => ({ ...s, notSavedActions: {} })),
				}),
				...epicAggregates.reduce((updaters, { key, vat, condition }) => {
					updaters[`${key}_aggregate_changed`] = makeUpdater({
						dependsOn: {},
						reactsTo: { aggregateState: condition },
						exec: ({ values: { aggregateState }, R }) => R.updateScope(setAggregateState(vat)(aggregateState)),
					})
					return updaters
				}, {}),
				...allActionConditionsTypesInUse.reduce((updaters, actionType) => {
					if (esdbRehydrateAggregates.type !== actionType) {
						updaters[`remember_${actionType}`] = makeUpdater({
							dependsOn: {},
							reactsTo: { action: makeCondition<AnyActionType>(actionType, false) },
							exec: ({ values: { action }, R }) => R.updateScope(addNotSavedAction(action)),
						})
					}
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
	esdbSave,
	esdbMakeActionsLocalStorageKey,
	esdbAggregatesStateLocalStorageKey,
}
