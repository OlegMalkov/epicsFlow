// @flow
import {
	type PluginType,
	storeCreatedEvent,
	createSimpleEvent,
	createUpdater,
	dispatchMsgEffectCreator,
	type BuiltInEffectType,
	type AnyValueType,
	getObjectKeys,
	type AnyConditionType,
	type AnyMsgType,
	createCondition,
	createEpicWithScope,
	createEvent,
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

const esdbRehydrateRequest = createSimpleEvent('REHYDRADE_REQUEST')
const esdbRehydrateAggregates = createEvent<{| aggregatesStatesByVcet: { [vcet: string]: AnyValueType } |}>('REHYDRADE_AGGREGATES')
const esdbSave = createSimpleEvent('SAVE')
const esdbCreateEventsLocalStorageKey = (now: number) => `esdb:${now}`
const esdbAggregatesStateLocalStorageKey = 'esdb_aggregates_states'

type ScopeType = {|
	aggregatesStates: { [string]: AnyValueType },
	notSavedMsgs: { [dateNow: number]: AnyMsgType },
|}

const setAggregatesStates = setProp<ScopeType, *, *>('aggregatesStates')
const setAggregateState = (aggregateKey: string) => setPath2<ScopeType, *, *>('aggregatesStates', aggregateKey)
const addNotSavedAction = (event: AnyMsgType) => (scope: ScopeType) => ({ ...scope, notSavedMsgs: { ...scope.notSavedMsgs, [`${Date.now()}`]: event } })
const esdbPlugin: PluginType = ({ injectEpics, injectUpdaters, getEpicsWithPluginConfig }) => {
	const epicAggregates = getEpicsWithPluginConfig().filter(({ pluginConfig }) => pluginConfig.esdbAggregate)
	const allConditionsMsgsTypesInUse = epicAggregates.reduce((result: Array<string>, { key, updaters }) => {
		getObjectKeys(updaters).forEach(updaterKey => {
			const updater = updaters[updaterKey]
			const condtitions: { [string]: AnyConditionType } = updater.conditions

			getObjectKeys(condtitions).forEach(conditionKey => {
				const { msgType, isEpicCondition } = condtitions[conditionKey]

				if (isEpicCondition) {
					throw new Error(`${key}.${updaterKey}.${conditionKey} is epic condition. Event source event can not be epics VCETs, they should be msgs, that describe user intentions.`)
				}

				if (result.indexOf(msgType) === -1) {
					result.push(msgType)
				}
			})
		})
		return result
	}, [])

	injectUpdaters(epic => {
		if (epicAggregates.find(({ vcet }) => epic.vcet === vcet)) {
			return {
				rehydrate: createUpdater({
					given: {},
					when: { aggregatesStatesByVcet: esdbRehydrateAggregates.condition.wsk('aggregatesStatesByVcet') },
					then: ({ values: { aggregatesStatesByVcet }, R }) => {
						return aggregatesStatesByVcet.hasOwnProperty(epic.vcet) ? R.mapState(() => aggregatesStatesByVcet[epic.vcet]) : R.doNothing
					},
				}),
			}
		}
	})

	injectEpics({
		esdb: createEpicWithScope<null, ScopeType, EffectType, empty>({
			vcet: 'ESDB_VCET',
			initialState: null,
			initialScope: {
				notSavedMsgs: {},
				aggregatesStates: {},
			},
			updaters: {
				init: createUpdater({
					given: {},
					when: { _: storeCreatedEvent.condition },
					then: ({ R }) => {
						return R.sideEffect(dispatchMsgEffectCreator(esdbRehydrateRequest.create()))
					},
				}),
				rehydrate: createUpdater({
					given: {},
					when: { _: esdbRehydrateRequest.condition },
					then: ({ R }) => R.sideEffect(localStorageGetItemEC(esdbAggregatesStateLocalStorageKey)),
				}),
				aggregatesStatesRetrivedFromLocalStorage: createUpdater({
					given: {},
					when: { aggregatesStates: localStorageGetItemResult.condition.wsk('value') },
					then: ({ values: { aggregatesStates }, R }) => {
						if (!aggregatesStates) return R.doNothing
						const aggregatesStatesByVcet: { [vcet: string]: AnyValueType } = JSON.parse(aggregatesStates)

						return R
							.mapScope(setAggregatesStates(aggregatesStatesByVcet))
							.sideEffect(dispatchMsgEffectCreator(esdbRehydrateAggregates.create({ aggregatesStatesByVcet })))
					},
				}),
				save: createUpdater({
					given: {},
					when: { _: esdbSave.condition },
					then: ({ R, scope }) => R.sideEffect(localStorageSetItemsEC({
						[esdbCreateEventsLocalStorageKey(Date.now())]: scope.notSavedMsgs,
						[esdbAggregatesStateLocalStorageKey]: scope.aggregatesStates,
					})).mapScope(s => ({ ...s, notSavedMsgs: {} })),
				}),
				...epicAggregates.reduce((updaters, { key, vcet, condition }) => {
					updaters[`${key}_aggregate_changed`] = createUpdater({
						given: {},
						when: { aggregateState: condition },
						then: ({ values: { aggregateState }, R }) => R.mapScope(setAggregateState(vcet)(aggregateState)),
					})
					return updaters
				}, {}),
				...allConditionsMsgsTypesInUse.reduce((updaters, msgType) => {
					if (esdbRehydrateAggregates.type !== msgType) {
						updaters[`remember_${msgType}`] = createUpdater({
							given: {},
							when: { event: createCondition<AnyMsgType>(msgType, false) },
							then: ({ values: { event }, R }) => R.mapScope(addNotSavedAction(event)),
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
	esdbCreateEventsLocalStorageKey,
	esdbAggregatesStateLocalStorageKey,
}
