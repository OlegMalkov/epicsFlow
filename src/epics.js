// @flow

type CompulsoryConditionFields = {|
	sealed: boolean,
	actionType: string,
	passive: boolean,
	optional: boolean,
	resetAllConditionsBelowThisValue: boolean,
|}

type Subscription = {| epicVat: string, updaterKey: string, conditionKey: string, passive: boolean |}

opaque type Condition<V: Object>: {
	value: V,
    toOptional: () => Condition<V>,
	to: () => Condition<V>,
	toPassive: () => Condition<V>,
	tp: () => Condition<V>,
    withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	withSelector: <R>(V => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	ws: <R>(V => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
    resetAllConditionsBelowThis: () => Condition<V>,
    withGuard: (guard: (value: V, prevValue: V) => boolean) => Condition<V>,
    wg: (guard: (value: V, prevValue: V) => boolean) => Condition<V>,
	actionType: string
} = {|
	valueKey: string,
	subscriptions?: Array<Subscription>,
	guard?: (V, V) => boolean,
	value: V,
	selectorPath?: Array<string>,
	...CompulsoryConditionFields,

	toPassive: () => Condition<V>,	
	tp: () => Condition<V>,
    toOptional: () => Condition<V>,
	to: () => Condition<V>,
    resetAllConditionsBelowThis: () => Condition<V>,
    withGuard: (guard: (value: V, prevValue: V) => boolean) => Condition<V>,
	wg: (guard: (value: V, prevValue: V) => boolean) => Condition<V>,

	parentCondition?: Condition<AnyValue>,

	childrenConditionsWithoutSelectorAndGuard?: Array<Condition<V>>,
	childrenConditionsWithSelectorOrGuard?: Array<Condition<AnyValue>>,

	withSelector: <R>(V => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	ws: <R>(V => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
    wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	selectorKey?: string,
	selector?: AnyValue => AnyValue
|}

function getFields(condition: Condition<AnyValue>): {| ...CompulsoryConditionFields, parentCondition: Condition<AnyValue> |} {
	const {
		actionType,
		passive,
		optional,
		resetAllConditionsBelowThisValue,
		sealed
	} = condition
	return {
		actionType,
		passive,
		optional,
		resetAllConditionsBelowThisValue,
		parentCondition: condition,
		sealed
	}
}

type makeConditionProps = {|
	...CompulsoryConditionFields,
	selectorKey?: string,
	guard?: AnyValue => boolean,
	parentCondition?: Condition<AnyValue>,
	selector?: AnyValue => AnyValue,
	sealed: boolean
|}

type AA = { type: $Subtype<string> }
type Meta = {| targetEpicVats?: string[] |}
type Dispatch = (AA, meta?: Meta) => void
type AnyValue = number | string | boolean | Object | Array<AnyValue> | null

type ConditionsValues = { [string]: AnyValue }

const dispatchActionEffectType: 'dispatch_action' = 'dispatch_action'
const sendMsgOutsideEpicsEffectType: 'send_msg_outside_of_epics' = 'send_msg_outside_of_epics'

opaque type DispatchActionEffect = {| 
	type: typeof dispatchActionEffectType,
	action: { type: string },
	updaterKey: string
|}

opaque type SendMsgOutsideEpicsEffect = {| 
	type: typeof sendMsgOutsideEpicsEffectType,
	msg: any
|}

type SideEffect<E> = 
| DispatchActionEffect
| E

type SideEffects<E> = Array<SideEffect<E>>

const doNothingResultType: 'do_nothing_rt' = 'do_nothing_rt'
opaque type DoNothingRT = {| type: typeof doNothingResultType |}
const sideEffectsResultType: 'side_effects_rt' = 'side_effects_rt'
opaque type SideEffectsRT<E> = {| type: typeof sideEffectsResultType, effects: Array<SideEffect<E>> |}
const updateStateResultType: 'update_state_rt' = 'update_state_rt'
opaque type UpdateStateRT<S> = {| type: typeof updateStateResultType, state: S, updateReason?: string |}
const updateScopeResultType: 'update_scope_rt' = 'update_scope_rt'
opaque type UpdateScopeRT<SC> = {| type: typeof updateScopeResultType, scope: SC |}
const updateStateAndScopeResultType: 'update_state_and_scope_rt' = 'update_state_and_scope_rt'
opaque type UpdateStateAndScopeRT<S, SC> = {| type: typeof updateStateAndScopeResultType, state: S, scope: SC, updateReason?: string |}
const updateStateWithSideEffectsResultType: 'update_state_with_side_effects_rt' = 'update_state_with_side_effects_rt'
opaque type UpdateStateWithSideEffectsRT<S, E> = {| type: typeof updateStateWithSideEffectsResultType, state: S, effects: Array<SideEffect<E>>, updateReason?: string |}
const updateScopeWithSideEffectsResultType: 'update_scope_with_side_effects_rt' = 'update_scope_with_side_effects_rt'
opaque type UpdateScopeWithSideEffectsRT<SC, E> = {| type: typeof updateScopeWithSideEffectsResultType, scope: SC, effects: Array<SideEffect<E>> |}
const updateStateAndScopeWithSideEffectsResultType: 'update_state_and_scope_with_side_effects_rt' = 'update_state_and_scope_with_side_effects_rt'
opaque type UpdateStateAndScopeWithSideEffectsRT<S, SC, E> = {| type: typeof updateStateAndScopeWithSideEffectsResultType, state: S, scope: SC, effects: Array<SideEffect<E>>, updateReason?: string |}
type EpicUpdaterResult<S, SC, E> = DoNothingRT 
	| SideEffectsRT<E>
	| UpdateStateRT<S>
	| UpdateStateWithSideEffectsRT<S, E> 
	| UpdateScopeRT<SC>
	| UpdateScopeWithSideEffectsRT<SC, E>
	| UpdateStateAndScopeWithSideEffectsRT<S, SC, E>

export const ResultType = { 
	doNothing: ({ type: doNothingResultType }: DoNothingRT),
	sideEffects: <E>(effects: SideEffects<E>): SideEffectsRT<E> => ({ type: sideEffectsResultType, effects }),
	updateState: <S>(state: S, updateReason?: string): UpdateStateRT<S> => ({ type: updateStateResultType, state, updateReason }),
	updateStateWithSideEffects: <S, E>(state: S, effects: SideEffects<E>, updateReason?: string): UpdateStateWithSideEffectsRT<S, E> => ({ type: updateStateWithSideEffectsResultType, state, effects, updateReason }),
	updateScope: <SC>(scope: SC): UpdateScopeRT<SC> => ({ type: updateScopeResultType, scope }),
	updateScipeWithSideEffects: <SC, E>(scope: SC, effects: SideEffects<E>): UpdateScopeWithSideEffectsRT<SC, E> => ({ type: updateScopeWithSideEffectsResultType, scope, effects }),
	updateStateAndScope: <S, SC>(state: S, scope: SC, updateReason?: string): UpdateStateAndScopeRT<S, SC> => ({ type: updateStateAndScopeResultType, state, scope, updateReason }),
	updateStateAndScopeWithSideEffectsResultType: <S, SC, E>(state: S, scope: SC, effects: SideEffects<E>, updateReason?: string): UpdateStateAndScopeWithSideEffectsRT<S, SC, E> => ({ type: updateStateAndScopeWithSideEffectsResultType, state, scope, effects, updateReason })
}

export const RT = ResultType

type C<V> = Condition<V>

export type Reducer<S: AnyValue, SC: Object, CV, E> = ({| values: CV, state: S, scope: SC, changedActiveConditionsKeys: Array<$Keys<CV>>, sourceAction: AA |}) => EpicUpdaterResult<S, SC, E>
export type Updater<S, SC, C, E> = {| 
	conditions: C, 
	conditionKeysToConditionUpdaterKeys: Array<[string, $Keys<C>]>, 
	compulsoryConditionsKeys: Array<$Keys<C>>,
	reducer: Reducer<S, SC, $Exact<$ObjMap<C, typeof extractConditionV>>, E> 
|};

type EpicValueAction<State> = {| type: string, value: State |}

const extractConditionV =<V>(c: { value: V }): V => c.value

function makeUpdater<S: AnyValue, SC: Object, C: { [string]: Object }, E> ({ conditions, reducer }: {|
	conditions: C,
	reducer: ({| values: $Exact<$ObjMap<C, typeof extractConditionV>>, state: S, scope: SC, triggerCondition: Condition<any>, sourceAction: AA |}) => EpicUpdaterResult<S, SC, E>
|}): Updater<S, SC, any, E> {
	let noActiveConditions = true
	const 
		conditionKeysToConditionUpdaterKeys = [],
		compulsoryConditionsKeys = []

	Object.keys(conditions).forEach(conditionKey => {
		const condition: Condition<AnyValue> = conditions[conditionKey]

		conditionKeysToConditionUpdaterKeys.push([condition.valueKey, conditionKey])

		if (!condition.optional) {
			compulsoryConditionsKeys.push(conditionKey)
		}

		if (!condition.passive) {
			noActiveConditions = false
		}
	})

	if (noActiveConditions) {
		throw new Error('makeUpdater requires at least one condition to be active')
	}

	return {
		conditions: (conditions: any), 
		reducer: (reducer: any),
		conditionKeysToConditionUpdaterKeys,
		compulsoryConditionsKeys,
	}
}

opaque type Epic<S, SC, E>: { c: Condition<S>, condition: Condition<S>, initialState: S } = {|
	vat: string,
	updaters: { [string]: Updater<S, SC, *, E> },
	initialState: S,
	initialScope: SC,
	c: Condition<S>,
	condition: Condition<S>
|}

type MakeEpicWithScopeProps<S, SC, E> = {|
	vat: string,
	updaters: { [string]: Updater<S, SC, *, E> },
	initialState: S,
	initialScope: SC,
|}

type MakeEpicProps<S, E> = {|
	vat: string,
	updaters: { [string]: Updater<S, void, *, E> },
	initialState: S
|}

const 
	do_nothing_emrt: 'do_nothing_emrt' = 'do_nothing_emrt',
	update_state_emrt: 'update_state_emrt' = 'update_state_emrt',
	update_state_with_effect_promise_emrt: 'update_state_with_effect_promise_emrt' = 'update_state_with_effect_promise_emrt'

opaque type DoNothingEMRT = {| type: typeof do_nothing_emrt |}
opaque type UpdateStateEMRT<S> = {| type: typeof update_state_emrt, state: S |}
opaque type UpdateStateWithEffectPromiseRT<S> = {| type: typeof update_state_with_effect_promise_emrt, state: S, promise: Promise<void> |}
type EffectManagerResultTypeT<State> =
| DoNothingEMRT
| UpdateStateEMRT<State>
| UpdateStateWithEffectPromiseRT<State>

const EffectManagerResultType = { 
	doNothing: ({ type: do_nothing_emrt }: DoNothingEMRT),
	updateState: <S>({ state }: {| state: S |}): UpdateStateEMRT<S> =>
		({ type: update_state_emrt, state }),
	updateStateWithEffectPromise: <S>({ state, promise }: {| state: S, promise: Promise<void> |}): UpdateStateWithEffectPromiseRT<S> =>
		({ type: update_state_with_effect_promise_emrt, state, promise })
}

const EMRT = EffectManagerResultType

export type EMRTType = typeof EMRT

opaque type EffectManager<S, SC, E> = {|
	key?: string,
	requestType: string,
	_effect: E,
	initialState?: S,
	initialScope?: SC,
	onEffectRequest: ({ effect: $ReadOnly<E>, requesterEpicVat: string, state: $ReadOnly<S>, scope: SC, dispatch: Dispatch }) => EffectManagerResultTypeT<S>
|}

type PendingEffect<E> = {| effect: E, promise: Promise<any> |}
type EffectManagerState<S, E> = {|
	state: S,
	scope: Object,
	pendingEffects: Array<PendingEffect<E>>
|}
type EffectManagersState<S, E> = { [string]: EffectManagerState<S, E> }
type EffectManagerStateUpdate = {| state?: AnyValue, pendingEffects?: Array<PendingEffect<any>> |}
type EffectManagersStateUpdate = { [string]: EffectManagerStateUpdate }

type MakeEffectManagerProps<E, S, SC> = {|
	requestType: string,
	initialState?: S,
	initialScope?: SC,
	onEffectRequest: ({ 
		effect: $ReadOnly<E>, 
		requesterEpicVat: string, 
		state: $ReadOnly<S>,
		scope: SC, 
		dispatch: Dispatch
	}) => EffectManagerResultTypeT<S>
|}

export type MakeEffectManager = <E, S, SC>(MakeEffectManagerProps<E, S, SC>) => EffectManager<S, SC, E>

function makeEffectManager<E, S, SC>({ 
	initialState,
	initialScope,
	onEffectRequest,
	requestType
}: MakeEffectManagerProps<E, S, SC>): EffectManager<S, SC, E> {
	return {
		requestType,
		initialState,
		initialScope,
		onEffectRequest,
		_effect: (null: any)
	}
}

function getInitialState<S>({ initialState }: Epic<S, any, any>): S { return initialState }
const
	reverse = (arr: Array<any>) => arr.slice().reverse(),
	values = o => Object.keys(o).map(k => o[k]),
	last = arr => arr.slice(-1)[0]

const MatchAnyActionType: '*' = '*'

type UpdaterStateValuesFullfilled = { [string]: boolean }

type UpdaterState = {|
	valuesFullfilled: UpdaterStateValuesFullfilled,
	isFullfilled: boolean,
|}

type UpdaterStateUpdate = {|
	valuesFullfilled: UpdaterStateValuesFullfilled,
	isFullfilled?: boolean,
|}

type EpicUpdatersState = { [string]: UpdaterState }
type EpicUpdatersStateUpdate = { [string]: UpdaterStateUpdate }

type EpicState = {|
	updatersState: EpicUpdatersState,
	state: AnyValue,
	scope: AnyValue
|}

type EpicsState = {
	[key: string]: EpicState
}

type EpicStateUpdate = {|
	updatersState: EpicUpdatersStateUpdate,
	state ?: AnyValue,
	scope ?: AnyValue
|}

type EpicsStateUpdate = {
	[key: string]: EpicStateUpdate
}

type EpicStateChangedAction = {|
	type: string,
	value: AnyValue,
	updateReasons?: Array<string>
|}

type ConditonsValues = { [string]: AnyValue }
type ConditonsValuesUpdate = { [string]: AnyValue }

const I = x => x

type PendingEffectPromise = {| requestEffectType: string, effect: {||}, promise: Promise<void> |}
type PendingEffectPromises = Array<PendingEffectPromise>
export opaque type EpicsStore<Epics: Object>: {| 
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>, 
	dispatch: Dispatch,
	getAllPendingEffectsPromises: () => PendingEffectPromises,
	warn: Function
|} = {| 
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>, 
	dispatch: Dispatch,
	getAllPendingEffectsPromises: () => PendingEffectPromises,
	warn: Function
|} 

function validateUniqVats(epics) {
	const allEpicsKeys = Object.keys(epics)
	const allVats = allEpicsKeys.map(k => epics[k].vat)
	const vatsCountMap = allVats.reduce((r, v) => {
		if (r[v]) {
			r[v]++
		} else {
			r[v] = 1
		}
		return r
	}, {})
	var duplicatedVats = Object.keys(vatsCountMap)
		.filter(v => vatsCountMap[v] > 1)
		
	if (duplicatedVats.length) {
		throw new Error(`duplicate vats:\n${duplicatedVats.map(v => `Epics ${allEpicsKeys.filter(k => epics[k].vat === v).join(', ')} has same vat ${v}`).join('\n')}`)
	}
}

function getEffectManagersInitialState(effectManagers) {
	if(!effectManagers){ return {} }
	return Object.keys(effectManagers).reduce((state, key) => {
		const config = effectManagers[key]
		state[config.requestType] = {
			state: config.initialState,
			scope: config.initialScope,
			pendingEffects: []
		}
		return state
	}, {})
}


const
	printOrigin = a =>
		(a.initiatedByEpic ? `${a.initiatedByEpic.type}[${a.initiatedByEpic.updaterKey}] => ` : ''),
	actionsChainToStringReverse = actions => 
		reverse(actions)
			.map(a => printOrigin(a) + a.type +	(a.updaterKeysThatChangedState !== undefined ? `[${a.updaterKeysThatChangedState.join(',')}]` : '') +
			(a.updateReasons !== undefined ? `[${a.updateReasons}]` : ''))
			.join( ' -> ')
		
function mergeUpdaterState(epicUpdaterState: UpdaterState, epicUpdaterStateUpdate: UpdaterStateUpdate) {
	const
		isFullfilled = epicUpdaterStateUpdate.isFullfilled === undefined ?
			epicUpdaterState.isFullfilled : epicUpdaterStateUpdate.isFullfilled,
		result: UpdaterState = {
			valuesFullfilled: epicUpdaterStateUpdate.valuesFullfilled,
			isFullfilled
		}
		
	return result
}
		
function mergeUpdatersState(epicUpdatersState: EpicUpdatersState, epicUpdatersStateUpdate: EpicUpdatersStateUpdate): EpicUpdatersState { // eslint-disable-line max-len
	return Object.keys(epicUpdatersState).reduce((s, updaterKey) => {
		const
			epicUpdterState = epicUpdatersState[updaterKey],
			epicUpdaterStateUpdate = epicUpdatersStateUpdate[updaterKey]
		
		if (epicUpdaterStateUpdate === undefined) {
			s[updaterKey] = epicUpdterState
		} else {
			s[updaterKey] = mergeUpdaterState(epicUpdterState, epicUpdaterStateUpdate)
		}
		return s
	}, {})
}
		
function mergeEpic(epicState: EpicState, epicStateUpdate: EpicStateUpdate): EpicState {
	return {
		updatersState: mergeUpdatersState(epicState.updatersState, epicStateUpdate.updatersState),
		state: epicStateUpdate.state === undefined ? epicState.state : epicStateUpdate.state,
		scope: epicStateUpdate.scope === undefined ? epicState.scope : epicStateUpdate.scope
	}
}
		
function mergeEpicsStateWithUpdate(epicsState: EpicsState, epicsStateUpdate: EpicsStateUpdate) {
	const resultEpicsState = {}
	for (const key in epicsState) { // eslint-disable-line
		const 
			state = epicsState[key],
			update = epicsStateUpdate[key]
	
		resultEpicsState[key] = update === undefined ? state : mergeEpic(state, update)
	}
		
	return resultEpicsState
}

function mergeEffectManagerStateWithUpdate(emState: EffectManagerState<*, *>, update: EffectManagerStateUpdate): EffectManagerState<*, *> {
	return {
		state: update.state === undefined ? emState.state : update.state,
		pendingEffects: update.pendingEffects === undefined ? emState.pendingEffects : update.pendingEffects,
		scope: emState.scope
	}
}

function mergeEffectManagersStateWithUpdate(effectManagersState: EffectManagersState<*, *>, effectManagersStateUpdate: EffectManagersStateUpdate) {
	const result = {}
	for (const key in effectManagersState) { // eslint-disable-line
		const 
			state = effectManagersState[key],
			update = effectManagersStateUpdate[key]
		
		if (update === undefined) {
			result[key] = state
		} else {
			result[key] = mergeEffectManagerStateWithUpdate(state, update)
		}
	}
		
	return result
}

const effectPromiseCompleteAT = 'effect_promise_complete'

// TODO consider having deepCompare option on condition, so condition will be cosidered changed only if it's value changed using deep compare
const findChangedConditions = (condition, value: Object, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate) => {
	const changedConditionsKeysMap = {}	
	let atLeastOneChange = false

	// $FlowFixMe condition.childrenConditionsWithSelectorOrGuard checked outside
	condition.childrenConditionsWithSelectorOrGuard.forEach(childCondition => {
		const { valueKey, guard } = childCondition
		let newChildValue
		if (guard) {
			newChildValue = value

			const
				_prevChildValue = prevConditionsValues[valueKey],
				_prevChildValueIsUndefined = _prevChildValue === undefined,
				prevChildValue = _prevChildValueIsUndefined ? conditionsValues[valueKey] : _prevChildValue

			prevConditionsValues[valueKey] = value
			conditionsValuesUpdate[valueKey] = value // used for next action, will come in conditionsValues

			if (guard && !guard(value, prevChildValue)) return

			changedConditions.push(childCondition)
		} else {
			const
				_prevChildValue = prevConditionsValues[valueKey],
				_prevChildValueIsUndefined = _prevChildValue === undefined,
				prevChildValue = _prevChildValueIsUndefined ? conditionsValues[valueKey] : _prevChildValue
			
			newChildValue = childCondition.selector ? childCondition.selector(value) : value[childCondition.selectorKey]

			if (prevChildValue === newChildValue) return

			atLeastOneChange = true
			changedConditionsKeysMap[valueKey] = true

			prevConditionsValues[valueKey] = conditionsValuesUpdate[valueKey]

			if (_prevChildValueIsUndefined) {
				prevConditionsValues[valueKey] = newChildValue
			}
			conditionsValuesUpdate[valueKey] = newChildValue
			changedConditions.push(childCondition)

			if (atLeastOneChange && childCondition.childrenConditionsWithoutSelectorAndGuard) {
				changedConditions.push(...childCondition.childrenConditionsWithoutSelectorAndGuard)
			}
		}
		if (!childCondition.childrenConditionsWithSelectorOrGuard) return

		findChangedConditions(childCondition, newChildValue, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate)
	})
}

type ExecuteActionProps = {|
	actionsChain: Array<AA>,
	latestActionsByType: { [string]: AA },
	latestActionsByTypeUpdate: { [string]: AA },
	conditionsValues: ConditonsValues,
	prevConditionsValues: ConditonsValues,
	conditionsValuesUpdate: ConditonsValuesUpdate,
	epicsState: EpicsState,
	epicsStateUpdate: EpicsStateUpdate,
	effectManagersState: EffectManagersState<*, *>,
	effectManagersStateUpdate: EffectManagersStateUpdate,
	messagesToSendOutside: Array<AA>
|}

const makeExecuteAction = ({ trace, skipTraceActions, epicsMapByVat, warn, effectManagers, dispatch, rootConditionsByActionType }) => { 
	const effectManagersByRequestType: { [string]: EffectManager<*, *, *> } = Object.keys(effectManagers).reduce((m, emk) => {
		const effectManager = { ...effectManagers[emk] }
		effectManager.key = emk
		if (!m[effectManager.requestType]) {
			m[effectManager.requestType] = effectManager
		} else {
			throw new Error(`duplicate effect manager request type ${effectManagers[emk].requestType} for [${emk} and ${m[effectManager.requestType].key}]`)
		}
		return m
	}, {})

	function executeAction({
		actionsChain,
		latestActionsByType,
		latestActionsByTypeUpdate,
		conditionsValues,
		prevConditionsValues,
		conditionsValuesUpdate,
		epicsState,
		epicsStateUpdate,
		effectManagersState,
		effectManagersStateUpdate,
		messagesToSendOutside
	}: ExecuteActionProps): void {
		function getEpicStateUpdate(epicVat) {
			let epicStateUpdate: EpicStateUpdate = epicsStateUpdate[epicVat]

			if (!epicStateUpdate) {
				epicStateUpdate = ({ updatersState: {} }: EpicStateUpdate)
				epicsStateUpdate[epicVat] = epicStateUpdate // eslint-disable-line no-param-reassign
			}

			return epicStateUpdate
		}

		function getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey) {
			let updaterStateUpdate: UpdaterStateUpdate = epicStateUpdate.updatersState[updaterKey]

			if (!updaterStateUpdate) {
				epicStateUpdate.updatersState[updaterKey] = updaterStateUpdate = ({ valuesFullfilled: {...updaterState.valuesFullfilled} }: UpdaterStateUpdate)
			}

			return updaterStateUpdate
		}

		const
			sourceAction = last(actionsChain),
			action = actionsChain[0],
			rootCondition: Condition<AnyValue> = rootConditionsByActionType[action.type],
			subscriptions: Array<Subscription> = []

		conditionsValuesUpdate[rootCondition.valueKey] = action

		if (rootCondition.subscriptions) {
			subscriptions.push(...rootCondition.subscriptions)
		}

		if (rootCondition.childrenConditionsWithSelectorOrGuard) {
			const changedConditions = []

			findChangedConditions(rootCondition, action, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate)
			changedConditions.forEach(cac => {
				const { subscriptions: cacSub } = cac
				
				if (cacSub) {
					subscriptions.push(...cacSub)
				}
			})
		}

		subscriptions.forEach(sub => {
			const
				{ epicVat, updaterKey, conditionKey } = sub, 
				epicStateUpdate = getEpicStateUpdate(epicVat),
				epicState: EpicState = epicsState[epicVat],
				updaterState = epicState.updatersState[updaterKey],
				updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)

			updaterStateUpdate.valuesFullfilled[conditionKey] = true
		})

		const activeSubs = subscriptions.filter(s => !s.passive)

		if (!activeSubs.length) {
			if (trace && (!skipTraceActions || !skipTraceActions(actionsChain))) {
				trace(actionsChainToStringReverse(actionsChain))
			}
			return
		}

		const epicSubs = activeSubs.reduce((r, sub) => {
			const { updaterKey, epicVat } = sub
			let updatersByVat = r[epicVat]
			if (!r[epicVat]) {
				r[epicVat] = updatersByVat = {}
			}

			let conditionKeysByUpdaterKey = updatersByVat[updaterKey]
			if (!conditionKeysByUpdaterKey) {
				updatersByVat[updaterKey] = conditionKeysByUpdaterKey = []
			}
			conditionKeysByUpdaterKey.push(sub.conditionKey)

			return r
		}, {})

		Object.keys(epicSubs).forEach(subVat => {
			// $FlowFixMe
			if (action.targetEpicVatsMap && !action.targetEpicVatsMap[subVat]) return
			const 
				updaterSubs = epicSubs[subVat],
				epic = epicsMapByVat[subVat],
				epicState: EpicState = epicsState[subVat],
				updateReasons = [],
				allEffects = [],
				updaterKeysThatChangedState = []

			const epicStateUpdate = getEpicStateUpdate(subVat)

			Object.keys(updaterSubs).forEach(updaterKey => {
				const 
					changedActiveConditionsKeys = updaterSubs[updaterKey],
					updater: Updater<*, *, *, *> = epic.updaters[updaterKey],
					updaterState = epicState.updatersState[updaterKey]

				let updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)
				
				const { valuesFullfilled } = updaterStateUpdate

				// todo put resetAllConditionsBelowThis logic here
				
				if (updater.compulsoryConditionsKeys.some(k => !valuesFullfilled[k])) return

				const reducerValues: Object = updater.conditionKeysToConditionUpdaterKeys.reduce((v, [conditionKey, conditionUpdaterKey]) => {
					const valueUpdate = conditionsValuesUpdate[conditionKey]
					v[conditionUpdaterKey] = valueUpdate === undefined ? conditionsValues[conditionKey] : valueUpdate
					return v
				}, {})

				const
					prevState = epicStateUpdate.state === undefined ? epicState.state : epicStateUpdate.state,
					prevScope = epicStateUpdate.scope === undefined ? epicState.scope : epicStateUpdate.scope

				if (process.env.NODE_ENV !== 'production') { // to eliminate this from production build
					// TODO devDeepFreeze(reducerValues);
					// TODO devDeepFreeze(prevState);
					// TODO devDeepFreeze(prevScope);
				}

				const
					result = updater.reducer({
						values: reducerValues,
						state: prevState,
						scope: prevScope,
						sourceAction,
						changedActiveConditionsKeys
					})

				let nextState, nextScope, updateReason, effects

				switch (result.type) {
				case doNothingResultType:
					return
				case sideEffectsResultType:
					effects = result.effects
					break
				case updateStateResultType:
					nextState = result.state
					updateReason = result.updateReason
					break
				case updateStateWithSideEffectsResultType:
					nextState = result.state
					updateReason = result.updateReason
					effects = result.effects
					break
				case updateScopeResultType:
					nextScope = result.scope
					break
				case updateScopeWithSideEffectsResultType:
					nextScope = result.scope
					effects = result.effects
					break
				case updateStateAndScopeResultType:
					nextState = result.state
					updateReason = result.updateReason
					nextScope = result.scope
					break
				case updateStateAndScopeWithSideEffectsResultType:
					nextState = result.state
					updateReason = result.updateReason
					nextScope = result.scope
					effects = result.effects
					break
				default:
					warn('unsupported result', result)
					throw new Error('unsupported result type ' + result.type)
				}

				if (process.env.NODE_ENV !== 'production') { // to eliminate this from production build
					// TODO devDeepFreeze(result);
				}

				if (prevScope !== nextScope) {
					epicStateUpdate.scope = nextScope // eslint-disable-line no-param-reassign
				}
				if (prevState !== nextState) {
					updaterKeysThatChangedState.push(updaterKey)
					epicStateUpdate.state = nextState // eslint-disable-line no-param-reassign
					if (updateReason) {
						updateReasons.push(updateReason)
					}
					// TODO is this epic has subs to it self, execute them immideately, skipping after update
				}

				if (effects) {
					effects.forEach(e => {
						e.updaterKey = updaterKey
					})
					// TODO if effect is action dispatch that has sub within same epic, execute it immediately, skipping after update
					allEffects.push(...effects)
				}
			})

			if (updaterKeysThatChangedState.length) {
				const
					epicChangedAction: EpicStateChangedAction = {
						type: subVat,
						value: epicStateUpdate.state
					}

				if (updateReasons.length) {
					epicChangedAction.updateReasons = updateReasons
				}

				if (trace) {
					(epicChangedAction: any).updaterKeysThatChangedState = updaterKeysThatChangedState
				}

				executeAction({
					actionsChain: [epicChangedAction, ...actionsChain],
					latestActionsByType,
					latestActionsByTypeUpdate,
					conditionsValues,
					prevConditionsValues,
					conditionsValuesUpdate,
					epicsState,
					epicsStateUpdate,
					effectManagersState,
					effectManagersStateUpdate,
					messagesToSendOutside
				}) 
			} else {
				if (trace && (!skipTraceActions || !skipTraceActions(actionsChain))) {
					trace(actionsChainToStringReverse(actionsChain))
				}
			}

			if (allEffects.length) {
				allEffects.forEach(e => {
					const effectRequestType = e.type
					switch (effectRequestType) {
					case dispatchActionEffectType: {
						const dispatchActionEffect: DispatchActionEffect = (e: any)
						if (trace) {
							(dispatchActionEffect.action: any).initiatedByEpic = { updaterKey: e.updaterKey, type: subVat }
						}
						executeAction({
							actionsChain: [dispatchActionEffect.action, ...actionsChain],
							latestActionsByType,
							latestActionsByTypeUpdate,
							conditionsValues,
							prevConditionsValues,
							conditionsValuesUpdate,
							epicsState,
							epicsStateUpdate,
							effectManagersState,
							effectManagersStateUpdate,
							messagesToSendOutside
						})
						break
					}
					case sendMsgOutsideEpicsEffectType: {
						const sendMessageOusideOfEpicsEffect: SendMsgOutsideEpicsEffect = (e: any)
						messagesToSendOutside.push(sendMessageOusideOfEpicsEffect.msg)
						break
					}
					default: {
						const 
							effectManager: EffectManager<*, *, *> = effectManagersByRequestType[effectRequestType],
							effectManagerStateUpdate = effectManagersStateUpdate[effectRequestType],
							effectManagerState = effectManagersState[effectRequestType]

						const result = effectManager.onEffectRequest({ 
							effect: e, 
							requesterEpicVat: subVat,
							state: (effectManagerStateUpdate && effectManagerStateUpdate.state) ? effectManagerStateUpdate.state : effectManagerState.state, 
							scope: effectManagerState.scope,
							dispatch 
						})

						switch(result.type) {
						case do_nothing_emrt:
							break
						case update_state_emrt: {
							const { state } = result
							effectManagersStateUpdate[effectRequestType] = { ...effectManagerStateUpdate, state }
							break
						}
						case update_state_with_effect_promise_emrt: {
							const 
								{ state, promise } = result,
								effect = e

							effectManagersStateUpdate[effectRequestType] = { 
								...(effectManagerStateUpdate || {}), 
								state,
								pendingEffects: [
									...((effectManagerStateUpdate && effectManagerStateUpdate.pendingEffects) || []),
									{ effect, promise } 
								]
							}
							promise
								.then(() => dispatch({ type: effectPromiseCompleteAT, effect, effectRequestType }))
								.catch(error => dispatch({ type: effectPromiseCompleteAT, effect, effectRequestType, error }))
							break
						}
						default:
							throw new Error(`unsupported effect manager result type: ${result.type}`)
						}
					}
					}
				})
			}
		})
	}

	return executeAction
}

function computeInitialStates({ epicsArr, warn, executeAction }) {
	const epicsState: EpicsState = epicsArr.reduce((state, epic) => {
		return {
			...state,
			[epic.vat]: {
				updatersState: Object.keys(epic.updaters).reduce(
					(s, updaterKey) => ({ 
						...s,
						[updaterKey]: {
							valuesFullfilled: {},
							isFullfilled: false
						}
					}), 
					{}
				),
				state: epic.initialState,
				scope: epic.initialScope
			}
		}
	}, {})
	
	const 
		epicsStateUpdate = {},
		latestActionsByType = {},
		latestActionsByTypeUpdate = {},
		conditionsValues = {},
		conditionsValuesUpdate = {},
		effectManagersStateUpdate = {}

	const initialEpicsState: EpicsState = epicsArr
		.filter(epic => epic.initialState !== undefined)
		.reduce((epicsState: any, epic) => {
			if(epicsStateUpdate[epic.vat] && epicsStateUpdate[epic.vat].state) {
				return epicsState
			}
			const messagesToSendOutside = []

			executeAction({ 
				actionsChain: [({ type: epic.vat, value: epic.initialState }: EpicStateChangedAction)], 
				latestActionsByType, 
				latestActionsByTypeUpdate, 
				conditionsValues, 
				prevConditionsValues: {},
				conditionsValuesUpdate,
				epicsState,
				epicsStateUpdate, 
				effectManagersState: {},
				effectManagersStateUpdate, 
				messagesToSendOutside
			})

			if (messagesToSendOutside.length) {
				warn('epics should not send messages outside on initializing default state', messagesToSendOutside)
				throw new Error('epics should not send messages outside on initializing default state')
			}

			if (Object.keys(effectManagersStateUpdate).length) {
				warn('effect managers should not be toched during intial state initialization', effectManagersStateUpdate)
				throw new Error('effect managers should not be toched during intial state initialization')
			}

			return mergeEpicsStateWithUpdate(epicsState, epicsStateUpdate)
		}, epicsState)
		
	

	return {
		initialEpicsState,
		initialLatestActionsByType: { ...latestActionsByType, ...latestActionsByTypeUpdate },
		initialCondtionsValues: { ...conditionsValues, ...conditionsValuesUpdate }
	}
}

const makeComputeOutsideState = ({ epicsVatToStateKeyMap }) => (state) => Object.keys(state).reduce((s, vat) =>{ 
	s[epicsVatToStateKeyMap[vat]] = state[vat].state
	return s
}, {})

function setConditionsSubscriptions(epics) {
	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]
		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]
			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: Condition<AnyValue> = updater.conditions[conditionKey]
				if (!condition.subscriptions) {
					condition.subscriptions = []
				}
				condition.subscriptions.push({ 
					epicVat: epic.vat,
					updaterKey, 
					conditionKey,
					passive: condition.passive
				})
			})
		})
	})
}

export type MakeCondition = <V: Object>(actionType: string) => Condition<V>
export function initEpics() {
	const rootConditionsByActionType = {}
	const selectorsInUse = []
	const guardsInUse = []

	function _makeCondition({
		actionType,
		passive,
		optional,
		selectorKey,
		guard,
		resetAllConditionsBelowThisValue,
		parentCondition,
		selector,
		sealed
	}: makeConditionProps, calledFromRoot) {
		// skipping parents without selectors or guards, as they are useless during changed conditions computation
		if (parentCondition && !parentCondition.selectorKey && !parentCondition.selector && !parentCondition.guard && parentCondition.parentCondition) {
			parentCondition = parentCondition.parentCondition
		}

		if (selector && selectorsInUse.indexOf(selector) === -1) {
			selectorsInUse.push(selector)
		}

		if (guard && guardsInUse.indexOf(guard) === -1) {
			guardsInUse.push(guard)
		}
	
		const condition: Condition<AnyValue> = ({
			valueKey: `${parentCondition ? parentCondition.valueKey : actionType}${selectorKey ? `.${selectorKey}` : ''}${selector ? ('.$$selector' + selectorsInUse.indexOf(selector)) : ''}${guard ? '.$$guard' + guardsInUse.indexOf(guard) : ''}`,
			parentCondition,
			actionType,
			passive: passive,
			optional: optional,
			guard,
			resetAllConditionsBelowThisValue,
			selector,
			toPassive() {
				return _makeCondition({ ...getFields(condition), passive: true })
			},
			tp() {
				return condition.toPassive()
			},
			toOptional() {
				return _makeCondition({ ...getFields(condition), optional: true })
			},
			to() {
				return condition.toOptional()
			},
			resetAllConditionsBelowThis(){
				return _makeCondition({ ...getFields(condition), resetAllConditionsBelowThisValue: true })
			},
			// You can have multiple guards for different levels of selectors like this: c.ws().tp().ws().tp()
			withGuard(guard) {
				if (condition.guard) {
					throw new Error(`Guards can be applied only once per level. Condition "${condition.valueKey}" already has guard.`)
				}
				const { childrenConditionsWithSelectorOrGuard } = condition
				if (childrenConditionsWithSelectorOrGuard) {
					const existingCondition = childrenConditionsWithSelectorOrGuard.find(c => c.guard === guard)
					if (existingCondition) return existingCondition
				}
				const newCondition = _makeCondition({ ...getFields(condition), guard })
				return newCondition
			},
			wg(guard) {
				return condition.withGuard(guard)
			}
		}: any)
	
		if (!sealed) {
			const withSelectorKey = (selectorKey: string): Condition<AnyValue> => {
				const { childrenConditionsWithSelectorOrGuard } = condition
				if (childrenConditionsWithSelectorOrGuard) {
					const existingCondition = childrenConditionsWithSelectorOrGuard.find(c => c.selectorKey === selectorKey)
					if (existingCondition) return existingCondition
				}
				return _makeCondition({ ...getFields(condition), selectorKey })
			}
			condition.withSelectorKey = (withSelectorKey: any)
			condition.wsk = condition.withSelectorKey
		
			const withSelector = selector => {
				const { childrenConditionsWithSelectorOrGuard } = condition
				if (childrenConditionsWithSelectorOrGuard) {
					const existingCondition = childrenConditionsWithSelectorOrGuard.find(c => c.selector === selector)
					if (existingCondition) return (existingCondition: any) 
				}
				return (_makeCondition({ ...getFields(condition), selector, sealed: true }): any)
			}
			condition.withSelector = withSelector
		
			condition.ws = condition.withSelector
		
			if (selectorKey) {
				condition.selectorKey = selectorKey
			}
		}
	
		if (parentCondition && parentCondition.selectorPath) {
			if (condition.selectorKey) {
				condition.selectorPath = [...parentCondition.selectorPath, condition.selectorKey]
			} else {
				condition.selectorPath = parentCondition.selectorPath
			}
		} else if (condition.selectorKey) {
			condition.selectorPath = [condition.selectorKey]
		}
	
		if (parentCondition) {
			if (condition.selectorKey || condition.selector || condition.guard) {
				if (!parentCondition.childrenConditionsWithSelectorOrGuard) {
					parentCondition.childrenConditionsWithSelectorOrGuard = []
				}
				parentCondition.childrenConditionsWithSelectorOrGuard.push(condition)
			} else {
				if (!parentCondition.childrenConditionsWithoutSelectorAndGuard) {
					parentCondition.childrenConditionsWithoutSelectorAndGuard = []
				}
				parentCondition.childrenConditionsWithoutSelectorAndGuard.push(condition)
			}
		}
	
		if (calledFromRoot) {
			rootConditionsByActionType[actionType] = condition
		}
	
		return condition
	}
	
	function makeCondition<V: Object> (actionType: string): Condition<V> {
		if(rootConditionsByActionType[actionType]) {
			return rootConditionsByActionType[actionType]
		}
		return (_makeCondition({ 
			actionType,
			passive: false,
			optional: false, 
			resetAllConditionsBelowThisValue: false,
			sealed: false
		}, true): any)
	}
	
	function makeEpicConditionReceiveFullAction<State>(vat: string): Condition<EpicValueAction<State>> {
		return makeCondition<EpicValueAction<State>>(vat)
	}
	
	function makeEpicCondition<State>(vat: string): Condition<State> {
		return makeEpicConditionReceiveFullAction(vat).withSelectorKey('value')
	}

	function makeEpicWithScope<S, SC, E>({ vat, updaters, initialState, initialScope }: MakeEpicWithScopeProps<S, SC, E>): Epic<S, SC, E> {
		const c = makeEpicCondition<S>(vat)

		return ({
			vat,
			updaters,
			initialState,
			initialScope,
			c,
			condition: c
		})
	}


	function makeEpic<S, E>({ vat, updaters, initialState }: MakeEpicProps<S, E>): Epic<S, void, E> {
		return makeEpicWithScope({ vat, updaters, initialState, initialScope: undefined })
	}

	const matchAnyActionCondition: C<typeof MatchAnyActionType> = makeCondition(MatchAnyActionType)
	
	function createStore<Epics: { [string]: Epic<*, *, *> }> ({
		epics,
		effectManagers = {},
		onMsg = I,
		onStateChanged = I,
		debug
	}: {|
		epics: Epics,
		effectManagers?: { [string]: EffectManager<*, *, *> },
		onMsg?: Object => any,
		onStateChanged?: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any,
		debug?: {| skipTraceActions ?: (Array<AA>) => boolean, trace?: Function, getState?: () => EpicsState, warn?: Function |},
		|}): EpicsStore<Epics> {
	
		const { warn = (() => null: Function), skipTraceActions, trace } = debug || {}
		
		validateUniqVats(epics)
		
		setConditionsSubscriptions(epics)
	
		function dispatch(action: { type: any }, meta?: Meta = ({}: any)) {
			const 
				messagesToSendOutside = [],
				epicsStateUpdate = {},
				effectManagersStateUpdate = {}
	
			if (meta.targetEpicVats) {
				(action: any).targetEpicVatsMap = meta.targetEpicVats.reduce(
					(m,v) => { 
						m[v] = true 
						return m 
					},
					{}
				)
			}
	
			if (action.type === effectPromiseCompleteAT) {
				const 
					{ effect, error, effectRequestType } = ((action: any): {| effect: {||}, effectRequestType: string, error: Error |}),
					effectManagerState = effectManagersState[effectRequestType]
	
				effectManagersStateUpdate[effectRequestType] = { 
					...effectManagersStateUpdate[effectRequestType],
					pendingEffects: effectManagerState.pendingEffects.filter(pe => pe.effect !== effect)
				}
	
				if (error) {
					warn(`Effect ${effectRequestType} error ${error.message}.`, effect, error)
				}
			} else {
				const 
					conditionsValuesUpdate = {},
					latestActionsByTypeUpdate = {}
	
				executeAction({
					actionsChain: [action],
					latestActionsByType,
					latestActionsByTypeUpdate,
					conditionsValues,
					prevConditionsValues: {},
					conditionsValuesUpdate,
					epicsState,
					epicsStateUpdate,
					effectManagersState,
					effectManagersStateUpdate,
					messagesToSendOutside,
				})
	
				if (Object.keys(conditionsValuesUpdate).length !== 0){
					conditionsValues = { ...conditionsValues, ...conditionsValuesUpdate }
				}
	
				latestActionsByType = { ...latestActionsByType, ...latestActionsByTypeUpdate }
	
				const updatedEpicsTypes = Object.keys(epicsStateUpdate)
				if (updatedEpicsTypes.length !== 0) {
					epicsState = mergeEpicsStateWithUpdate(epicsState, epicsStateUpdate)
					// todo deepFreeze state
					outsideState = computeOutsideState(epicsState)
					onStateChanged((outsideState: any))
				}
				messagesToSendOutside.forEach(m => onMsg(m))
			}
	
			effectManagersState = mergeEffectManagersStateWithUpdate(effectManagersState, effectManagersStateUpdate)
		}
	
		const 
			epicsArr = values(epics),
			epicsMapByVat = values(epics).reduce((a, e) => ({ ...a, [e.vat]: e }), {}),
			executeAction = makeExecuteAction({
				skipTraceActions,
				trace,
				epicsMapByVat,
				warn,
				effectManagers,
				dispatch,
				rootConditionsByActionType
			}),
			epicsVatToStateKeyMap = Object.keys(epics).reduce((r, epicStateKey) => {
				r[epics[epicStateKey].vat] = epicStateKey
				return r
			}, {}),
			computeOutsideState = makeComputeOutsideState({ epicsVatToStateKeyMap })
	
		const { initialEpicsState, initialLatestActionsByType, initialCondtionsValues } = computeInitialStates({ epicsArr, warn, executeAction })
	
		let 
			conditionsValues: ConditionsValues = initialCondtionsValues,
			epicsState: EpicsState = initialEpicsState,
			latestActionsByType = initialLatestActionsByType,
			effectManagersState: EffectManagersState<*, *> = getEffectManagersInitialState(effectManagers),
			outsideState = computeOutsideState(epicsState)
	
		function getAllPendingEffectsPromises() {
			return Object.keys(effectManagersState).reduce((pendingEffectsPromises, requestEffectType) => {
				pendingEffectsPromises.push(...effectManagersState[requestEffectType]
					.pendingEffects.map(({ promise, effect }) => ({ promise, requestEffectType, effect })))
				return pendingEffectsPromises
			}, [])
		}
	
		return {
			dispatch,
			getState() {
				return (outsideState: any)
			},
			getAllPendingEffectsPromises,
			warn
		}
	}

	return {
		makeCondition,
		ResultType,
		RT,
		makeEpicConditionReceiveFullAction,
		makeEpicCondition,
		makeUpdater,
		makeEpicWithScope,
		makeEpic,
		EMRT,
		makeEffectManager,
		matchAnyActionCondition,
		createStore
	}
}