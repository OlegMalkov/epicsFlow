// @flow

const __DEV__ = process.env !== 'production'
type AnyValue = number | string | boolean | Object | Array<AnyValue> | null

type CompulsoryConditionFields = {|
	sealed: boolean,
	actionType: string,
	passive: boolean,
	optional: boolean,
	resetConditionsByKeyKeys: Array<string> | null,
	resetConditionsByKeyAfterReducerCallKeys: Array<string> | null,
	isEpicCondition: boolean
|}

type Subscription = {| epicVat: string, updaterKey: string, conditionKey: string, passive: boolean |}

export opaque type Condition<V: Object>: {
	value: V,
    toOptional: () => Condition<V>,
	to: () => Condition<V>,
	toPassive: () => Condition<V>,
	tp: () => Condition<V>,
    withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	withSelector: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	ws: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
    resetConditionsByKey: (Array<string>) => Condition<V>,
    resetConditionsByKeyAfterReducerCall: (Array<string>) => Condition<V>,
    withGuard: <VV: V>(guard: VV => boolean) => Condition<VV>,
    wg: <VV: V>(guard: VV => boolean) => Condition<VV>,
	actionType: string
} = {|
	isEpicCondition: boolean,
	valueKey: string,
	subscriptions?: Array<Subscription>,
	guard?: (V, V) => boolean,
	value: V,
	...CompulsoryConditionFields,

	toPassive: () => Condition<V>,	
	tp: () => Condition<V>,
    toOptional: () => Condition<V>,
	to: () => Condition<V>,
    resetConditionsByKey: (Array<string>) => Condition<V>,
    resetConditionsByKeyAfterReducerCall: (Array<string>) => Condition<V>,
    withGuard: <VV: V>(guard: VV => boolean) => Condition<VV>,
	wg: <VV: V>(guard: VV => boolean) => Condition<VV>,

	parentCondition?: Condition<AnyValue>,

	childrenConditionsWithoutSelectorAndGuard?: Array<Condition<V>>,
	childrenConditionsWithSelectorOrGuard?: Array<Condition<AnyValue>>,

	withSelector: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	ws: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
    wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	selectorKey?: string,
	selector?: (V, V) => AnyValue
|}

function getFields(condition: Condition<AnyValue>): {| ...CompulsoryConditionFields, parentCondition: Condition<AnyValue> |} {
	const {
		actionType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		sealed,
		isEpicCondition
	} = condition
	return {
		actionType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		parentCondition: condition,
		sealed,
		isEpicCondition
	}
}

type makeConditionProps = {|
	...CompulsoryConditionFields,
	selectorKey?: string,
	guard?: AnyValue => boolean,
	parentCondition?: Condition<AnyValue>,
	resetConditionsByKeyKeys: Array<string> | null,
	resetConditionsByKeyAfterReducerCallKeys: Array<string> | null,
	selector?: AnyValue => AnyValue,
	sealed: boolean
|}

type AnyAction = { type: $Subtype<string> }
type Meta = {| targetEpicVats?: string[] |}
export type Dispatch = (AnyAction, meta?: Meta) => void

type ConditionsValues = { [string]: AnyValue }

const dispatchActionEffectType: 'dispatch_action' = 'dispatch_action'
const sendMsgOutsideEpicsEffectType: 'send_msg_outside_of_epics' = 'send_msg_outside_of_epics'
export const
	dispatchActionEffectCreator = (action: AnyAction): DispatchActionEffect => ({ type: dispatchActionEffectType, action }),
	daEC = dispatchActionEffectCreator,
	sendMessageOutsideEpicsEffectCreator = (msg: any): SendMsgOutsideEpicsEffect => ({ type: sendMsgOutsideEpicsEffectType, msg }),
	smoeEC = sendMessageOutsideEpicsEffectCreator

opaque type DispatchActionEffect = {| 
	type: typeof dispatchActionEffectType,
	action: { type: string }
|}

opaque type SendMsgOutsideEpicsEffect = {| 
	type: typeof sendMsgOutsideEpicsEffectType,
	msg: any
|}

class ReducerResult<S, SC, SE> {
	_stateUpdated: boolean;
	_scopeUpdated: boolean;
	_state: S;
	_scope: SC;
	_sideEffects: Array<SE>;
	_updateReasons: Array<string>

	constructor(state: S, updateReasons: Array<string>, scope: SC, sideEffects: Array<SE>, stateUpdated, scopeUpdated) {
		this._state = state
		this._updateReasons = updateReasons
		this._scope = scope
		this._sideEffects = sideEffects
		this._stateUpdated = stateUpdated
		this._scopeUpdated = scopeUpdated
		this.doNothing = this
	}

	doNothing: ReducerResult<S, SC, SE>

	sideEffect(effect: SE): ReducerResult<S, SC, SE> {
		return new ReducerResult<S, SC, SE>(this._state, this._updateReasons, this._scope, [...this._sideEffects, effect], this._stateUpdated, this._scopeUpdated)
	}

	// update reason will be taken only if updater returned updated state
	updateState(updater: S => S, updateReason?: string): ReducerResult<S, SC, SE> {
		const nextState = updater(this._state)
		
		if (__DEV__) {
			if (nextState !== this._state && deepEqual(nextState, this._state)) {
				throw new Error('Do not recreate state object if nothing changed. It will unnecessary tell observers that it is changed, when actually there was not any change.')
			}
		}
		return new ReducerResult<S, SC, SE>(nextState, updateReason && (nextState !== this._state) ? [...this._updateReasons, updateReason] : this._updateReasons, this._scope, this._sideEffects, true, this._scopeUpdated)
	}

	updateScope(updater: SC => SC): ReducerResult<S, SC, SE> {
		const nextScope = updater(this._scope)
		if (__DEV__) {
			if (nextScope !== this._scope && deepEqual(nextScope, this._scope)) {
				throw new Error('Do not recreate scope object if nothing changed. It will unnecessary tell observers that it is changed, when actually there was not any change.')
			}
		}
		return new ReducerResult<S, SC, SE>(this._state, this._updateReasons, nextScope, this._sideEffects, this._stateUpdated, true)
	}
}

const toTrueV = (): true => true

export type Reducer<S: AnyValue, SC: Object, CV, E> = ({| values: CV, state: S, scope: SC, changedActiveConditionsKeysMap: $ObjMap<CV, typeof toTrueV>, sourceAction: AnyAction, R: ReducerResult<S, SC, E> |}) => ReducerResult<S, SC, E>

const extractConditionV =<V>(c: { value: V }): V => c.value

export type BuiltInEffect = DispatchActionEffect | SendMsgOutsideEpicsEffect

export type Updater<S, SC, C, E> = {| 
	conditions: C, 
	conditionsKeys: Array<$Keys<C>>,
	conditionKeysToConditionUpdaterKeys: Array<[string, $Keys<C>]>, 
	compulsoryConditionsKeys: Array<$Keys<C>>,
	reducer: Reducer<S, SC, $Exact<$ObjMap<C, typeof extractConditionV>>, E>
|};

type EpicValueAction<State> = {| type: string, value: State |}


function makeUpdater<S: AnyValue, SC: Object, C: { [string]: Object }, E> ({ conditions, reducer }: {|
	conditions: C,
	reducer: ({| values: $Exact<$ObjMap<C, typeof extractConditionV>>, state: S, scope: SC, changedActiveConditionsKeysMap: $ObjMap<C, typeof toTrueV>, sourceAction: AnyAction, R: ReducerResult<S, SC, E> |}) => ReducerResult<S, SC, E>
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
		conditionsKeys: Object.keys((conditions: any)),
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

export const 
	isArray = Array.isArray,
	keyList = Object.keys,
	hasProp = Object.prototype.hasOwnProperty,
	isObject = (o: any) => o != null && typeof o === 'object',
	isEmpty = (o: Object | Array<any>) => keyList((o: any)).length === 0

export function findObjDiff(lhs: Object, rhs: Object) {
	if (lhs === rhs) return {};

	if (!isObject(lhs) || !isObject(rhs)) return [lhs, '->', rhs];

	return Object.keys(rhs).reduce((acc, key) => {
		if (lhs.hasOwnProperty(key)) {
			const difference = findObjDiff(lhs[key], rhs[key]);

			if (isObject(difference) && isEmpty(difference)) return acc;

			return { ...acc, [key]: difference };
		}

		return acc;
	}, {});
}

// only serializible data (no Date/RegEx)
export function deepEqual(a: any, b: any) {
	if (a === b) return true

	if (a && b && typeof a == 'object' && typeof b == 'object') {
		var arrA = isArray(a)
			, arrB = isArray(b)
			, i
			, length
			, key

		if (arrA && arrB) {
			// $FlowFixMe
			length = a.length
			// $FlowFixMe
		if (length != b.length) return false; // eslint-disable-line
			// $FlowFixMe
			for (i = length; i-- !== 0;)
			// $FlowFixMe
				if (!deepEqual(a[i], b[i])) return false
			return true
		}

	if (arrA != arrB) return false; // eslint-disable-line
		var keys = keyList(a)
		length = keys.length

		if (length !== keyList(b).length)
			return false

		for (i = length; i-- !== 0;)
			if (!hasProp.call(b, keys[i])) return false

		for (i = length; i-- !== 0;) {
			key = keys[i]
			// $FlowFixMe
			if (!deepEqual(a[key], b[key])) return false
		}

		return true
	}

	return a!==a && b!==b; // eslint-disable-line
}

const
	reverse = (arr: Array<any>) => arr.slice().reverse(),
	values = o => Object.keys(o).map(k => o[k]),
	last = arr => arr.slice(-1)[0]

const MatchAnyActionType: '*' = '*'

type UpdaterStateValuesFullfilled = { [string]: boolean }

type UpdaterState = {|
	valuesFullfilled: UpdaterStateValuesFullfilled
|}

type UpdaterStateUpdate = {|
	valuesFullfilled: UpdaterStateValuesFullfilled
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
	getServiceState: () => { epics: EpicsState, effectManagers: EffectManagersState<*, *>, conditions: ConditionsValues },
	dispatch: Dispatch,
	getAllPendingEffectsPromises: () => PendingEffectPromises,
	warn: Function,
	subscribeOnStateChange: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	subscribeOnMessage: any => any
|} = {| 
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>, 
	getServiceState: () => { epics: EpicsState, effectManagers: EffectManagersState<*, *>, conditions: ConditionsValues },
	dispatch: Dispatch,
	getAllPendingEffectsPromises: () => PendingEffectPromises,
	warn: Function,
	subscribeOnStateChange: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	subscribeOnMessage: any => any
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
	const result: UpdaterState = {
		valuesFullfilled: epicUpdaterStateUpdate.valuesFullfilled
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
	// $FlowFixMe condition.childrenConditionsWithSelectorOrGuard checked outside
	condition.childrenConditionsWithSelectorOrGuard.forEach(childCondition => {
		const { valueKey, guard } = childCondition
		let newChildValue
		if (guard) {
			newChildValue = value

			if (guard && !guard(value)) return

			conditionsValuesUpdate[valueKey] = value // used for next action, will come in conditionsValues

			changedConditions.push(childCondition)
		} else {
			const
				_prevChildValue = prevConditionsValues[valueKey],
				_prevChildValueIsUndefined = _prevChildValue === undefined,
				prevChildValue = _prevChildValueIsUndefined ? conditionsValues[valueKey] : _prevChildValue,
				_prevValue = prevConditionsValues[valueKey],
				_prevValueIsUndefined = _prevValue === undefined,
				prevValue = _prevValueIsUndefined ? conditionsValues[condition.valueKey] : _prevValue
			
			newChildValue = childCondition.selector ? childCondition.selector(value, prevValue) : value[childCondition.selectorKey]

			if (prevChildValue === newChildValue) return

			prevConditionsValues[valueKey] = conditionsValuesUpdate[valueKey]

			if (_prevChildValueIsUndefined) {
				prevConditionsValues[valueKey] = newChildValue
			}
			conditionsValuesUpdate[valueKey] = newChildValue
			changedConditions.push(childCondition)
		}
		if (childCondition.childrenConditionsWithoutSelectorAndGuard) {
			changedConditions.push(...childCondition.childrenConditionsWithoutSelectorAndGuard)
		}
		if (!childCondition.childrenConditionsWithSelectorOrGuard) return

		findChangedConditions(childCondition, newChildValue, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate)
	})
}

type EpicUpdaterExecutionInfo = {|
	updaterKey: string,
	changedActiveConditionsKeys: Array<string>,
	reducerValues?: Object,
	epicState?: AnyValue,
	epicScope?: Object,
	updaterEpicStateChange?: Object,
	updaterEpicScopeChange?: Object,
	reducerNotExecutedBecause?: string,
	updaterReqestedEffects?: Array<Object>,
	didNothing?: boolean
|}

type EpicExecutionInfo = {|
	epicVat: string,
	updaters?: Array<EpicUpdaterExecutionInfo>,
	childrenLayers?: Array<ExecutionLevelInfo>, // eslint-disable-line
	epicNotExecutedBecause?: string
|}

type ExecutionLevelInfo = {|
	triggerAction: AnyAction,
	executedEpics: Array<EpicExecutionInfo>
|}

type ExecuteActionProps = {|
	actionsChain: Array<AnyAction>,
	conditionsValues: ConditonsValues,
	prevConditionsValues: ConditonsValues,
	conditionsValuesUpdate: ConditonsValuesUpdate,
	epicsState: EpicsState,
	epicsStateUpdate: EpicsStateUpdate,
	effectManagersState: EffectManagersState<*, *>,
	effectManagersStateUpdate: EffectManagersStateUpdate,
	lastReducerValuesByEpicVatUpdaterKey: { [string]: Object },
	messagesToSendOutside: Array<AnyAction>,
	executionLevelTrace: ExecutionLevelInfo | void
|}

type makeExecuteActionProps = {| 
	trace: Function,
	skipTraceActions: void | (Array<AnyAction>) => boolean,
	epicsMapByVat: { [string]: Epic<any, any, any> },
	effectManagers: { [string]: EffectManager<any, any, any> },
	dispatch: Dispatch,
	rootConditionsByActionType: { [string]: Condition<AnyValue> },
	warn: Function
|}

const makeExecuteAction = ({ trace, skipTraceActions, epicsMapByVat, effectManagers, dispatch, rootConditionsByActionType }: makeExecuteActionProps) => { 
	const 
		effectManagersByRequestType: { [string]: EffectManager<*, *, *> } = Object.keys(effectManagers).reduce((m, emk) => {
			const effectManager = { ...effectManagers[emk] }
			effectManager.key = emk
			if (!m[effectManager.requestType]) {
				m[effectManager.requestType] = effectManager
			} else {
				throw new Error(`duplicate effect manager request type ${effectManagers[emk].requestType} for [${emk} and ${m[effectManager.requestType].key}]`)
			}
			return m
		}, {}),
		orderOfEpicsVat = Object.keys(epicsMapByVat).reduce((r, vat, index) => ({ ...r, [vat]: index }), {}),
		vatToSortValue = (vat, currentActionType, initiatedByEpic) => {
			if (vat === currentActionType || (initiatedByEpic && initiatedByEpic.type === vat)) return -Infinity
			return orderOfEpicsVat[vat]
		},
		getTraceUpdaters = ({ executionLevelTrace, subVat }) => {
			let updaters
			const exsistingEpicTraceInfo = executionLevelTrace.executedEpics.find(t => t.epicVat === subVat)
			if (exsistingEpicTraceInfo) {
				if (exsistingEpicTraceInfo.updaters) {
					updaters = exsistingEpicTraceInfo.updaters
				} else {
					updaters = []
					exsistingEpicTraceInfo.updaters = updaters
				}
			} else {
				updaters = []
				executionLevelTrace.executedEpics.push({ 
					epicVat: subVat,
					updaters,
				})
			}

			return updaters
		}

	function executeAction({
		actionsChain,
		conditionsValues,
		prevConditionsValues,
		conditionsValuesUpdate,
		epicsState,
		epicsStateUpdate,
		effectManagersState,
		effectManagersStateUpdate,
		lastReducerValuesByEpicVatUpdaterKey,
		messagesToSendOutside,
		executionLevelTrace
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

		if (rootCondition.childrenConditionsWithoutSelectorAndGuard) {
			rootCondition.childrenConditionsWithoutSelectorAndGuard.forEach(c => {
				if (c.subscriptions){
					subscriptions.push(...c.subscriptions)
				}
			})
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

		type EpicSubs = { [epicVat: string]: { [updaterKey: string]: Array<string> } }
		const epicSubs: EpicSubs = activeSubs.reduce((r: EpicSubs, sub) => {
			const { updaterKey, epicVat } = sub
			let updatersByVat: { [updaterKey: string]: Array<string> } | void = r[epicVat]
			if (!updatersByVat) {
				r[epicVat] = updatersByVat = {}
			}

			let conditionKeysByUpdaterKey: Array<string> | void = updatersByVat[updaterKey]
			if (!conditionKeysByUpdaterKey) {
				updatersByVat[updaterKey] = conditionKeysByUpdaterKey = []
			}
			conditionKeysByUpdaterKey.push(sub.conditionKey)

			return r
		}, {})

		const
			actionType: string = action.type,
			{ initiatedByEpic } = (action: any),
			epicVatsToBeExecuted = Object.keys(epicSubs).sort((vat1: string, vat2: string) => vatToSortValue(vat1, actionType, initiatedByEpic) - vatToSortValue(vat2, actionType, initiatedByEpic))

		epicVatsToBeExecuted.forEach((subVat: string) => {
			// $FlowFixMe
			if (action.targetEpicVatsMap && !action.targetEpicVatsMap[subVat]) {
				if (trace && executionLevelTrace) {
					executionLevelTrace.executedEpics.push({ 
						epicVat: subVat,
						epicNotExecutedBecause: `action.targetEpicVatsMap ${Object.keys(action.targetEpicVatsMap).join(', ')} does not contain ${subVat}`
					})
				}

				return
			}
			const 
				updaterSubs = epicSubs[subVat],
				epic: Epic<any, any, any> = epicsMapByVat[subVat],
				epicState: EpicState = epicsState[subVat],
				updateReasons = [],
				allEffects = [],
				updaterKeysThatChangedState = []

			const epicStateUpdate = getEpicStateUpdate(subVat)

			Object.keys(updaterSubs).forEach(updaterKey => {
				const 
					changedActiveConditionsKeys: Array<string> = updaterSubs[updaterKey],
					updater: Updater<*, *, *, *> = epic.updaters[updaterKey],
					conditions: { [string]: Condition<AnyValue> } = updater.conditions,
					updaterState = epicState.updatersState[updaterKey]

				let updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)
				
				const { valuesFullfilled } = updaterStateUpdate

				// todo put resetAllConditionsBelowThis logic here

				changedActiveConditionsKeys.forEach(cck => {
					const { resetConditionsByKeyKeys } = conditions[cck]
					if (resetConditionsByKeyKeys) {
						resetConditionsByKeyKeys.forEach(ck => {
							valuesFullfilled[ck] = false
						})
					}
				})
				
				if (updater.compulsoryConditionsKeys.some(k => !valuesFullfilled[k])) {
					if (trace && executionLevelTrace) {
						getTraceUpdaters({ executionLevelTrace, subVat }).push({
							updaterKey,
							changedActiveConditionsKeys,
							reducerNotExecutedBecause: `compulsory conditions keys ${updater.compulsoryConditionsKeys.filter(k => !valuesFullfilled[k]).join(', ')} are not fullifilled`
						})
					}
					return
				}
				
				let atLeastOneValueIsDifferent = false

				const 
					epicUpdaterKey = `${subVat}.${updaterKey}`,
					lastReducerValues = lastReducerValuesByEpicVatUpdaterKey[epicUpdaterKey],
					reducerValues: Object = updater.conditionKeysToConditionUpdaterKeys.reduce((v, [conditionKey, conditionUpdaterKey]) => {
						const shouldLookForDifferentValuesFromLastExecution = lastReducerValues && !atLeastOneValueIsDifferent
						if (!valuesFullfilled[conditionUpdaterKey]) { 
							if (shouldLookForDifferentValuesFromLastExecution) {
								const condition = updater.conditions[conditionUpdaterKey]
								if (condition.isEpicCondition && lastReducerValues[conditionUpdaterKey] !== undefined) {
									atLeastOneValueIsDifferent = true
								}
							}
							return v
						}

						const valueUpdate = conditionsValuesUpdate[conditionKey]
						const nextValue = v[conditionUpdaterKey] = valueUpdate === undefined ? conditionsValues[conditionKey] : valueUpdate

						if (shouldLookForDifferentValuesFromLastExecution) {
							const condition = updater.conditions[conditionUpdaterKey]
							if (condition.isEpicCondition && lastReducerValues[conditionUpdaterKey] !== nextValue) {
								atLeastOneValueIsDifferent = true
							}
						}
						return v
					}, {})

				// epic value can be changed multiple times for single user action, this ensures that epic subscribers are called only once if nothing is changed from last call
				if (lastReducerValues && !atLeastOneValueIsDifferent) {
					if (trace && executionLevelTrace) {
						getTraceUpdaters({ executionLevelTrace, subVat }).push({ 
							updaterKey, 
							changedActiveConditionsKeys,
							reducerValues,
							reducerNotExecutedBecause: 'It was called before in execution chain and values not changed since then'
						})
					}
					
					return
				}

				

				lastReducerValuesByEpicVatUpdaterKey[epicUpdaterKey] = reducerValues

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
						changedActiveConditionsKeysMap: changedActiveConditionsKeys.reduce((m, k) => { m[k] = true; return m }, {}),
						R: new ReducerResult(prevState, [], prevScope, [], false, false)
					})

				if (trace && executionLevelTrace) {
					const updaters = getTraceUpdaters({ executionLevelTrace, subVat })
					const updaterTraceInfo: EpicUpdaterExecutionInfo = { 
						updaterKey,
						changedActiveConditionsKeys
					}

					if (!result._stateUpdated && !result._scopeUpdated && !result._sideEffects.length) {
						updaterTraceInfo.didNothing = true
					} else {
						updaterTraceInfo.reducerValues = reducerValues
					}

					if (result._stateUpdated) {
						updaterTraceInfo.epicState = prevState
						if (typeof prevState === 'object') {
							const updaterEpicStateChange = findObjDiff(prevState, result._state)
							if (!isEmpty(updaterEpicStateChange)) {
								updaterTraceInfo.updaterEpicStateChange = updaterEpicStateChange
							} else {
								updaterTraceInfo.updaterEpicStateChange = 'WARN: nothing changed, but new objects with same data was created'
							}
						} else {
							updaterTraceInfo.updaterEpicStateChange = result._state
						}
					}

					if (result._scopeUpdated) {
						updaterTraceInfo.epicScope = prevScope
						const updaterEpicScopeChange = findObjDiff(prevScope, result._scope)
						if (!isEmpty(updaterEpicScopeChange)) {
							updaterTraceInfo.updaterEpicScopeChange = updaterEpicScopeChange
						} else {
							updaterTraceInfo.updaterEpicScopeChange = 'WARN: nothing changed, but new objects with same data was created'
						}
					}

					if (result._sideEffects.length > 0) {
						updaterTraceInfo.updaterReqestedEffects = result._sideEffects
					}

					updaters.push(updaterTraceInfo)
				}
				
				changedActiveConditionsKeys.forEach(cck => {
					const { resetConditionsByKeyAfterReducerCallKeys } = updater.conditions[cck]
					if (resetConditionsByKeyAfterReducerCallKeys) {
						resetConditionsByKeyAfterReducerCallKeys.forEach(ck => {
							valuesFullfilled[ck] = false
						})
					}
				})

				if (process.env.NODE_ENV !== 'production') { // to eliminate this from production build
					// TODO devDeepFreeze(result);
				}

				if (result._scopeUpdated) {
					epicStateUpdate.scope = result._scope // eslint-disable-line no-param-reassign
				}
				if (result._stateUpdated) {
					updaterKeysThatChangedState.push(updaterKey)
					epicStateUpdate.state = result._state // eslint-disable-line no-param-reassign
					updateReasons.push(...result._updateReasons)
					// TODO is this epic has subs to it self, execute them immideately, skipping after update
				}

				const { _sideEffects } = result
				if (_sideEffects.length) {
					_sideEffects.forEach(e => {
						(e: any).updaterKey = updaterKey
						if (e.type === dispatchActionEffectType) {
							// we dispatching action immediately as it may update state of same epic (e1) that requested action dispatch
							// this way if some other epic(e2) has subscription to e1, e2 will we called only once, with latest updated epic state
							const dispatchActionEffect: DispatchActionEffect = (e: any)
	
							const actionToDispatch: Object = dispatchActionEffect.action
							actionToDispatch.initiatedByEpic = { updaterKey: e.updaterKey, type: subVat }
	
							executeAction({
								actionsChain: [dispatchActionEffect.action, ...actionsChain],
								conditionsValues,
								prevConditionsValues,
								conditionsValuesUpdate,
								epicsState,
								epicsStateUpdate,
								effectManagersState,
								effectManagersStateUpdate,
								lastReducerValuesByEpicVatUpdaterKey,
								messagesToSendOutside,
								executionLevelTrace
							})
						} else {
							allEffects.push(e)
						}
					})
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

				let nextLevelTrace

				if (trace && executionLevelTrace) {
					const executedEpic = executionLevelTrace.executedEpics.find(e => e.epicVat === subVat)
					if (!executedEpic) { throw new Error ('Unexpected trace error, please investigate how this happend.') } // should never happen, but flow can not check it
					if (!executedEpic.childrenLayers) {
						executedEpic.childrenLayers = []
					}

					nextLevelTrace = { triggerAction: epicChangedAction, executedEpics: [] }
					executedEpic.childrenLayers.push(nextLevelTrace)
				}

				executeAction({
					actionsChain: [epicChangedAction, ...actionsChain],
					conditionsValues,
					prevConditionsValues,
					conditionsValuesUpdate,
					epicsState,
					epicsStateUpdate,
					effectManagersState,
					effectManagersStateUpdate,
					lastReducerValuesByEpicVatUpdaterKey,
					messagesToSendOutside,
					executionLevelTrace: nextLevelTrace
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

function computeInitialStates({ epicsArr, warn, executeAction, trace }) {
	const epicsState: EpicsState = epicsArr.reduce((state, epic) => {
		return {
			...state,
			[epic.vat]: {
				updatersState: Object.keys(epic.updaters).reduce(
					(s, updaterKey) => ({ 
						...s,
						[updaterKey]: {
							valuesFullfilled: Object.keys(epic.updaters[updaterKey].conditions).reduce((a, ck) => ({...a, [ck]: false }) ,{})
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
		conditionsValues = {},
		conditionsValuesUpdate = {},
		effectManagersStateUpdate = {}

	const initialEpicsState: EpicsState = epicsArr
		.filter(epic => epic.initialState !== undefined)
		.reduce((epicsState: any, epic) => {
			if(epicsStateUpdate[epic.vat] && epicsStateUpdate[epic.vat].state) {
				return epicsState
			}
			const 
				messagesToSendOutside = [],
				action = { type: epic.vat, value: epic.initialState },
				executionLevelTrace = { triggerAction: action, executedEpics: [] }

			executeAction({ 
				actionsChain: [(action: EpicStateChangedAction)], 
				conditionsValues, 
				prevConditionsValues: {},
				conditionsValuesUpdate,
				epicsState,
				epicsStateUpdate, 
				effectManagersState: {},
				effectManagersStateUpdate, 
				lastReducerValuesByEpicVatUpdaterKey: {},
				messagesToSendOutside,
				executionLevelTrace
			})

			if (trace) {
				trace(`epic ${epic.vat} init graph`, executionLevelTrace)
			}

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

function validateResetConditions(epics) {
	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]
		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]
			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: Condition<AnyValue> = updater.conditions[conditionKey]
				if (condition.resetConditionsByKeyKeys) {
					condition.resetConditionsByKeyKeys.forEach(conditionKeyToReset => {
						if (!updater.conditions[conditionKeyToReset]) {
							throw new Error(`${epicKey}.${updaterKey}.${conditionKey} resetConditionsByKeyKeys defined ${conditionKeyToReset} which is not exist in updater.conditons`)
						}
					})
				}
				if (condition.resetConditionsByKeyAfterReducerCallKeys) {
					condition.resetConditionsByKeyAfterReducerCallKeys.forEach(conditionKeyToReset => {
						if (!updater.conditions[conditionKeyToReset]) {
							throw new Error(`${epicKey}.${updaterKey}.${conditionKey} resetConditionsByKeyAfterReducerCallKeys defined ${conditionKeyToReset} which is not exist in updater.conditons`)
						}
					})
				}
			})
		})
	})
}

function validateEpicConditions(epics) {
	const epicsArray = values(epics)
	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]
		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]
			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: Condition<AnyValue> = updater.conditions[conditionKey]
				
				if (epicsArray.some(e => e.vat === condition.actionType) && !condition.isEpicCondition) {
					throw new Error(`${epicKey}.${updaterKey}.${conditionKey} has epic valueActionType: ${condition.actionType}, but was created as non epic condition`)
				}
				if (!epicsArray.some(e => e.vat === condition.actionType) && condition.isEpicCondition) {
					throw new Error(`${epicKey}.${updaterKey}.${conditionKey} was created as epic condition, but there is no epic registered with valueActionType: ${condition.actionType}`)
				}
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
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		parentCondition,
		selector,
		sealed,
		isEpicCondition
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
			passive,
			optional,
			guard,
			resetConditionsByKeyKeys,
			resetConditionsByKeyAfterReducerCallKeys,
			selector,
			isEpicCondition,
			toPassive() {
				return _makeCondition({ ...getFields(condition), passive: true })
			},
			toOptional() {
				return _makeCondition({ ...getFields(condition), optional: true })
			},
			resetConditionsByKey(keys) {
				return _makeCondition({ ...getFields(condition), resetConditionsByKeyKeys: keys })
			},
			resetConditionsByKeyAfterReducerCall(keys) {
				return _makeCondition({ ...getFields(condition), resetConditionsByKeyAfterReducerCallKeys: keys })
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
			}
		}: any)

		condition.tp = condition.toPassive
		condition.to = condition.toOptional
		condition.wg = condition.withGuard
	
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
	
	function makeCondition<V: Object> (actionType: string, isEpicCondition?: boolean = false): Condition<V> {
		if(rootConditionsByActionType[actionType]) {
			return rootConditionsByActionType[actionType]
		}
		return (_makeCondition({ 
			actionType,
			passive: false,
			optional: false, 
			resetConditionsByKeyKeys: null,
			resetConditionsByKeyAfterReducerCallKeys: null,
			sealed: false,
			isEpicCondition
		}, true): any)
	}
	
	function makeEpicConditionReceiveFullAction<State>(vat: string): Condition<EpicValueAction<State>> {
		return makeCondition<EpicValueAction<State>>(vat, true)
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

	const matchAnyActionCondition: Condition<typeof MatchAnyActionType> = makeCondition(MatchAnyActionType)
	
	// TODO put correct annotation
	type DevToolsConfig = Object

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
		debug?: {| devTools?: { config: DevToolsConfig }, skipTraceActions?: (Array<AnyAction>) => boolean, trace?: Function, getState?: () => EpicsState, warn?: Function |},
		|}): EpicsStore<Epics> {
	
		const { warn = (() => null: Function), skipTraceActions, trace } = debug || {}
		
		validateUniqVats(epics)
		validateResetConditions(epics)
		validateEpicConditions(epics)
		setConditionsSubscriptions(epics)

		let devTools

		function initDevTools(config) {
			devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ ...config, name: 'service' })
			devTools.subscribe((message) => {
				if (message.type === 'DISPATCH' && message.state) {
					serviceState = JSON.parse(message.state)
					onEpicsStateChange(serviceState.epics)
				}
			})
			devTools.init(serviceState)
		}
	
		function onEpicsStateChange(epicsState) {
			outsideState = computeOutsideState(epicsState)
			onStateChanged((outsideState: any))
			stateChangedSubscribers.forEach(sub => sub((outsideState: any)))
		}
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
	
			let 
				updatedConditionsValues,
				updatedEpicsState,
				updatedEffectManagersState

			if (action.type === effectPromiseCompleteAT) {
				const 
					{ effect, error, effectRequestType } = ((action: any): {| effect: {||}, effectRequestType: string, error: Error |}),
					effectManagerState = serviceState.effectManagers[effectRequestType]
	
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
					executionLevelTrace = { triggerAction: action, executedEpics: [] }
	
				executeAction({
					actionsChain: [action],
					conditionsValues: serviceState.conditions,
					prevConditionsValues: {},
					conditionsValuesUpdate,
					epicsState: serviceState.epics,
					epicsStateUpdate,
					effectManagersState: serviceState.effectManagers,
					effectManagersStateUpdate,
					lastReducerValuesByEpicVatUpdaterKey: {},
					messagesToSendOutside,
					executionLevelTrace
				})

				if (trace) {
					trace(`${action.type} executionLevelTrace`, executionLevelTrace)
				}
	
				if (Object.keys(conditionsValuesUpdate).length !== 0) {
					updatedConditionsValues = { ...serviceState.conditions, ...conditionsValuesUpdate }
				}
	
				const updatedEpicsTypes = Object.keys(epicsStateUpdate)

				if (updatedEpicsTypes.length !== 0) {
					updatedEpicsState = mergeEpicsStateWithUpdate(serviceState.epics, epicsStateUpdate)
					// todo deepFreeze state
					onEpicsStateChange(updatedEpicsState)
				}

				messagesToSendOutside.forEach(m => {
					onMsg(m)
					msgSubscribers.forEach(sub => sub(m))
				})
			}
	
			if (Object.keys(effectManagersStateUpdate).length) {
				updatedEffectManagersState = mergeEffectManagersStateWithUpdate(serviceState.effectManagers, effectManagersStateUpdate)
			}

			if (updatedConditionsValues || updatedEpicsState ||	updatedEffectManagersState) {
				const nextServiceState = {
					epics: updatedEpicsState || serviceState.epics,
					conditions: updatedConditionsValues || serviceState.conditions,
					effectManagers: updatedEffectManagersState || serviceState.effectManagers
				}
				if (devTools && Object.keys(epicsStateUpdate).length) {
					let atLeastOneChange = false
					Object.keys(epicsStateUpdate).forEach(vat => {
						if (atLeastOneChange) return
						const 
							epicState = serviceState.epics[vat],
							epicStateUpdate = epicsStateUpdate[vat]

						if (
							(epicStateUpdate.state !== undefined && !deepEqual(epicState.state, epicStateUpdate.state)) 
							|| (epicStateUpdate.scope !== undefined && !deepEqual(epicState.scope, epicStateUpdate.scope))
							|| (epicStateUpdate.updatersState !== undefined && !deepEqual(epicState.updatersState, epicStateUpdate.updatersState))
						) {
							atLeastOneChange = true
						}
					})
					if (atLeastOneChange) {
						devTools.send(action, nextServiceState)	
					}					
				}
				serviceState = nextServiceState
			}
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
	
		const { initialEpicsState, initialCondtionsValues } = computeInitialStates({ epicsArr, warn, executeAction, trace })
	
		let 
			serviceState = {
				conditions: initialCondtionsValues,
				epics: initialEpicsState,
				effectManagers: getEffectManagersInitialState(effectManagers)
			},
			outsideState = computeOutsideState(serviceState.epics)
	
		function getAllPendingEffectsPromises() {
			return Object.keys(serviceState.effectManagers).reduce((pendingEffectsPromises, requestEffectType) => {
				pendingEffectsPromises.push(...serviceState.effectManagers[requestEffectType]
					.pendingEffects.map(({ promise, effect }) => ({ promise, requestEffectType, effect })))
				return pendingEffectsPromises
			}, [])
		}

		const 
			stateChangedSubscribers = [],
			msgSubscribers = []
	

		if (debug && debug.devTools) {
			initDevTools(debug.devTools.config)
		}

		return {
			dispatch,
			getState() {
				return (outsideState: any)
			},
			getServiceState: () => serviceState,
			getAllPendingEffectsPromises,
			warn,
			subscribeOnStateChange: subscriber => stateChangedSubscribers.push(subscriber),
			subscribeOnMessage: sub => msgSubscribers.push(sub)
		}
	}

	function makeACAC<ActionExtraFields>(actionType: string): {|
		actionCreator: ActionExtraFields => {| ...ActionExtraFields, type: string |},
		condition: Condition<{| ...ActionExtraFields, type: string |}>,
		ac: ActionExtraFields => {| ...ActionExtraFields, type: string |},
		c: Condition<{| ...ActionExtraFields, type: string |}>
	|} { 
		const 
			actionCreator = extraFields => ({ type: actionType, ...extraFields }),
			condition = makeCondition(actionType)

		return ({ 
			actionCreator,
			condition,
			ac: actionCreator,
			c: condition,
		})
	}

	function makeSACAC(actionType: string): {|
		actionCreator: () => {| type: string |},
		condition: Condition<{| type: string |}>,
		ac: () => {| type: string |},
		c: Condition<{| type: string |}>
	|} { 
		const 
			actionCreator = () => ({ type: actionType }),
			condition = makeCondition(actionType)

		return ({ 
			actionCreator,
			condition,
			ac: actionCreator,
			c: condition,
		})
	}

	return {
		makeCondition,
		makeEpicConditionReceiveFullAction,
		makeEpicCondition,
		makeUpdater,
		makeEpicWithScope,
		makeEpic,
		EMRT,
		makeEffectManager,
		matchAnyActionCondition,
		createStore,
		makeActionCreatorAndCondition: makeACAC,
		makeSimpleActionCreatorAndCondition: makeSACAC, // simple means that action is consist only of type field
		makeACAC,
		makeSACAC
	}
}