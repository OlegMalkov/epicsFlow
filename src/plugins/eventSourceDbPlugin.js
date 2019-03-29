// @flow
import {
	type PluginType,
	storeCreated,
	makeSimpleActionCreatorAndCondition,
	createUpdater,
	dispatchActionEffectCreator,
	type BuiltInEffectType,
	type AnyValueType,
	getObjectKeys,
	type AnyConditionType,
	type AnyActionType,
	createCondition,
	createEpicWithScope,
	makeActionCreatorAndCondition,
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

const esdbRehydrateRequest = makeSimpleActionCreatorAndCondition('REHYDRADE_REQUEST')
const esdbRehydrateAggregates = makeActionCreatorAndCondition<{| aggregatesStatesByVat: { [vat: string]: AnyValueType } |}>('REHYDRADE_AGGREGATES')
const esdbSave = makeSimpleActionCreatorAndCondition('SAVE')
const esdbCreateActionsLocalStorageKey = (now: number) => `esdb:${now}`
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
				rehydrate: createUpdater({
					given: {},
					when: { aggregatesStatesByVat: esdbRehydrateAggregates.c.wsk('aggregatesStatesByVat') },
					then: ({ values: { aggregatesStatesByVat }, R }) => {
						return aggregatesStatesByVat.hasOwnProperty(epic.vat) ? R.mapState(() => aggregatesStatesByVat[epic.vat]) : R.doNothing
					},
				}),
			}
		}
	})

	injectEpics({
		esdb: createEpicWithScope<null, ScopeType, EffectType, empty>({
			vat: 'ESDB_VAT',
			initialState: null,
			initialScope: {
				notSavedActions: {},
				aggregatesStates: {},
			},
			updaters: {
				init: createUpdater({
					given: {},
					when: { _: storeCreated.c },
					then: ({ R }) => {
						return R.sideEffect(dispatchActionEffectCreator(esdbRehydrateRequest.actionCreator()))
					},
				}),
				rehydrate: createUpdater({
					given: {},
					when: { _: esdbRehydrateRequest.c },
					then: ({ R }) => R.sideEffect(localStorageGetItemEC(esdbAggregatesStateLocalStorageKey)),
				}),
				aggregatesStatesRetrivedFromLocalStorage: createUpdater({
					given: {},
					when: { aggregatesStates: localStorageGetItemResult.c.wsk('value') },
					then: ({ values: { aggregatesStates }, R }) => {
						if (!aggregatesStates) return R.doNothing
						const aggregatesStatesByVat: { [vat: string]: AnyValueType } = JSON.parse(aggregatesStates)

						return R
							.mapScope(setAggregatesStates(aggregatesStatesByVat))
							.sideEffect(dispatchActionEffectCreator(esdbRehydrateAggregates.actionCreator({ aggregatesStatesByVat })))
					},
				}),
				save: createUpdater({
					given: {},
					when: { _: esdbSave.c },
					then: ({ R, scope }) => R.sideEffect(localStorageSetItemsEC({
						[esdbCreateActionsLocalStorageKey(Date.now())]: scope.notSavedActions,
						[esdbAggregatesStateLocalStorageKey]: scope.aggregatesStates,
					})).mapScope(s => ({ ...s, notSavedActions: {} })),
				}),
				...epicAggregates.reduce((updaters, { key, vat, condition }) => {
					updaters[`${key}_aggregate_changed`] = createUpdater({
						given: {},
						when: { aggregateState: condition },
						then: ({ values: { aggregateState }, R }) => R.mapScope(setAggregateState(vat)(aggregateState)),
					})
					return updaters
				}, {}),
				...allActionConditionsTypesInUse.reduce((updaters, actionType) => {
					if (esdbRehydrateAggregates.type !== actionType) {
						updaters[`remember_${actionType}`] = createUpdater({
							given: {},
							when: { action: createCondition<AnyActionType>(actionType, false) },
							then: ({ values: { action }, R }) => R.mapScope(addNotSavedAction(action)),
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
	esdbCreateActionsLocalStorageKey,
	esdbAggregatesStateLocalStorageKey,
}
