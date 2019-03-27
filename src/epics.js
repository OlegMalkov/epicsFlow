// @flow

const toTrueV = (): true => true
const extractConditionV =<V>(c: { value: V }): V => c.value

const __DEV__ = process.env !== 'production'

type AnyValueType = number | string | bool | Object | Array<AnyValueType> | null
type CompulsoryConditionFieldsType = {|
	actionType: string,
	isEpicCondition: bool,
	optional: bool,
	passive: bool,
	resetConditionsByKeyAfterReducerCallKeys: Array<string> | null,
	resetConditionsByKeyKeys: Array<string> | null,
	sealed: bool,
|}
type SubscriptionType = {| conditionKey: string, epicVat: string, passive: bool, updaterKey: string |}
opaque type Condition<V: Object>: {
	actionType: string,
	resetConditionsByKey: (Array<string>) => Condition<V>,
	resetConditionsByKeyAfterReducerCall: (Array<string>) => Condition<V>,
	to: () => Condition<V>,
	toOptional: () => Condition<V>,
	value: V,
	wg: <VV: V>(guard: VV => bool) => Condition<VV>,
	withGuard: <VV: V>(guard: VV => bool) => Condition<VV>,
	withSelector: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	ws: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	isEpicCondition: bool,
} = {|
	...CompulsoryConditionFieldsType,
	childrenConditionsWithSelectorOrGuard?: Array<AnyConditionType>,
	childrenConditionsWithoutSelectorAndGuard?: Array<Condition<V>>,
	guard?: (V, V) => bool,
	isEpicCondition: bool,
	parentCondition?: AnyConditionType,
	resetConditionsByKey: (Array<string>) => Condition<V>,
	resetConditionsByKeyAfterReducerCall: (Array<string>) => Condition<V>,
	selector?: (V, V) => AnyValueType,
	selectorKey?: string,
	subscriptions?: Array<SubscriptionType>,
	to: () => Condition<V>,
	toOptional: () => Condition<V>,
	toPassive: () => Condition<V>,
	value: V,
	valueKey: string,
	wg: <VV: V>(guard: VV => bool) => Condition<VV>,
	withGuard: <VV: V>(guard: VV => bool) => Condition<VV>,
	withSelector: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	withSelectorKey: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
	ws: <R>((value: V, prevValue: V) => R) => $Diff<Condition<R>, {| withSelector: *, withSelectorKey: *, ws: *, wsk: * |}>,
	wsk: <SK: $Keys<V>>(selectorKey: SK) => Condition<$ElementType<V, SK>>,
|}
type AnyConditionType = Condition<AnyValueType>
type CreateConditionPropsType = {|
	...CompulsoryConditionFieldsType,
	guard?: AnyValueType => bool,
	parentCondition?: AnyConditionType,
	resetConditionsByKeyAfterReducerCallKeys: Array<string> | null,
	resetConditionsByKeyKeys: Array<string> | null,
	sealed: bool,
	selector?: AnyValueType => AnyValueType,
	selectorKey?: string,
|}
type AnyActionType = { type: $Subtype<string> } // eslint-disable-line flowtype/require-exact-type
type MetaType = {| targetEpicVats?: string[] |}
type DispatchType = (AnyActionType, meta?: MetaType) => void
type ConditionsValuesType = { [string]: AnyValueType }
opaque type DispatchActionEffectType = {|
	action: { type: string },
	type: typeof dispatchActionEffectType,
|}
opaque type DispatchBatchedActionsEffectType = {|
	batches: Array<{| actions: Array<AnyActionType>, targetEpicVat: string |}>,
	type: typeof dispatchBatchedActionsEffectType,
|}
opaque type SendMsgOutsideEpicsEffectType = {|
	msg: any,
	type: typeof sendMsgOutsideEpicsEffectType,
|}
type ReducerType<S: AnyValueType, SC: Object, CV, E> = ({| R: ReducerResult<S, SC, E>, changedActiveConditionsKeysMap: $ObjMap<CV, typeof toTrueV>, scope: SC, sourceAction: AnyActionType, state: S, values: CV |}) => ReducerResult<S, SC, E>
type BuiltInEffectType = DispatchActionEffectType | SendMsgOutsideEpicsEffectType | DispatchBatchedActionsEffectType
type UpdaterType<S, SC, C: { [string]: { actionType: string } & Object }, E> = {|
	compulsoryConditionsKeys: Array<$Keys<C>>,
	conditionKeysToConditionUpdaterKeys: Array<[string, $Keys<C>]>,
	conditions: C,
	conditionsKeys: Array<$Keys<C>>,
	then: ReducerType<S, SC, $Exact<$ObjMap<C, typeof extractConditionV>>, E>,
|}
type EpicValueActionType<State> = {| type: string, value: State |}
opaque type EpicType<S, SC, E, PC>: { c: Condition<S>, condition: Condition<S>, initialState: S, pluginConfig: PC | void, vat: string } = {|
	c: Condition<S>,
	condition: Condition<S>,
	initialScope: SC,
	initialState: S,
	pluginConfig: PC | void,
	updaters: { [string]: UpdaterType<S, SC, *, E> },
	vat: string,
|}
type CreateEpicWithScopePropsType<S, SC, E, PC> = {|
	initialScope: SC,
	initialState: S,
	pluginConfig?: PC,
	updaters: { [string]: UpdaterType<S, SC, *, E> },
	vat: string,
|}
type CreateEpicPropsType<S, E, PC> = {|
	initialState: S,
	pluginConfig?: PC,
	updaters: { [string]: UpdaterType<S, void, *, E> },
	vat: string,
|}

type OnEffectRequestType<S, SC, E> = ({| dispatch: DispatchType, effect: $ReadOnly<E>, requesterEpicVat: string, scope: SC, state: $ReadOnly<S>, R: EffectManagerResultType<S> |}) => EffectManagerResultType<S>
opaque type EffectManager<S, SC, E> = {|
	_effect: E,
	initialScope?: SC,
	initialState?: S,
	key?: string,
	onEffectRequest: OnEffectRequestType<S, SC, E>,
	requestType: string,
|}
type PendingEffectType<E> = {| effect: E, promise: Promise<any> |}
type EffectManagerStateType<S, E> = {|
	pendingEffects: Array<PendingEffectType<E>>,
	scope: Object,
	state: S,
|}
type EffectManagersStateType<S, E> = { [string]: EffectManagerStateType<S, E> }
type EffectManagerStateUpdateType = {| pendingEffects?: Array<PendingEffectType<any>>, state?: AnyValueType |}
type EffectManagersStateUpdateType = { [string]: EffectManagerStateUpdateType }
type CreateEffectManagerPropsType<E, S, SC> = {|
	initialScope?: SC,
	initialState?: S,
	onEffectRequest: OnEffectRequestType<S, SC, E>,
	requestType: string,
|}
type CreateEffectManagerType = <E, S, SC>(CreateEffectManagerPropsType<E, S, SC>) => EffectManager<S, SC, E>
type PluginPropsType = {|
	getEpics: () => { [string]: EpicType<any, any, any, any> },
	getEpicsWithPluginConfig: () => Array<{| key: string, ...EpicType<any, any, any, any>, pluginConfig: Object |}>,
	injectEpics: (epicsMapToInject: { [epicKey: string]: EpicType<any, any, any, any> }) => void,
	injectUpdaters: <S, SC, E, PC>(EpicType<S, SC, E, PC> => void | { [updaterKey: string]: UpdaterType<S, SC, *, E> }) => void,
|}
type PluginType = PluginPropsType => void
type UpdaterStateValuesFullfilledType = { [string]: bool }
type UpdaterStateType = {| valuesFullfilled: UpdaterStateValuesFullfilledType |}
type UpdaterStateUpdateType = {| valuesFullfilled: UpdaterStateValuesFullfilledType |}
type EpicUpdatersStateType = { [string]: UpdaterStateType }
type EpicUpdatersStateUpdateType = { [string]: UpdaterStateUpdateType }
type EpicStateType = {|
	scope: AnyValueType,
	state: AnyValueType,
	updatersState: EpicUpdatersStateType,
|}
type EpicsStateType = { [key: string]: EpicStateType }
type EpicStateUpdateType = {|
	scope?: AnyValueType,
	state?: AnyValueType,
	updatersState: EpicUpdatersStateUpdateType,
|}
type EpicsStateUpdateType = { [key: string]: EpicStateUpdateType }
type EpicStateChangedActionType = {|
type: string,
updateReasons?: Array<string>,
value: AnyValueType,
|}
type ConditonsValuesType = { [string]: AnyValueType }
type ConditonsValuesUpdateType = { [string]: AnyValueType }
type PendingEffectPromiseType = {| effect: {||}, promise: Promise<void>, requestEffectType: string |}
type PendingEffectPromisesType = Array<PendingEffectPromiseType>
type EpicUpdaterExecutionInfoType = {|
	changedActiveConditionsKeys: Array<string>,
	didNothing?: bool,
	epicScope?: Object,
	epicState?: AnyValueType,
	reducerNotExecutedBecause?: string,
	reducerValues?: Object,
	updaterEpicScopeChange?: Object,
	updaterEpicStateChange?: Object,
	updaterKey: string,
	updaterReqestedEffects?: Array<Object>,
|}
type EpicExecutionInfoType = {|
	childrenLayers?: Array<ExecutionLevelInfoType>,
	epicKey: string,
	epicNotExecutedBecause?: string,
	epicVat: string, // eslint-disable-line
	updaters?: Array<EpicUpdaterExecutionInfoType>,
|}
type ExecutionLevelInfoType = {|
	executedEpics: Array<EpicExecutionInfoType>,
	triggerAction: AnyActionType,
|}
type DispatchActionsBatchesType = Array<{| actions: Array<AnyActionType>, targetEpicVat: string |}>
type ExecuteActionPropsType = {|
	actionsChain: Array<AnyActionType>,
	conditionsValues: ConditonsValuesType,
	conditionsValuesUpdate: ConditonsValuesUpdateType,
	effectManagersState: EffectManagersStateType<*, *>,
	effectManagersStateUpdate: EffectManagersStateUpdateType,
	epicsState: EpicsStateType,
	epicsStateUpdate: EpicsStateUpdateType,
	batchedDispatchBatches: DispatchActionsBatchesType,
	executionLevelTrace: ExecutionLevelInfoType | void,
	lastReducerValuesByEpicVatUpdaterKey: { [string]: Object },
	messagesToSendOutside: Array<AnyActionType>,
	prevConditionsValues: ConditonsValuesType,
|}
type CreateExecuteActionPropsType = {|
	dispatch: DispatchType,
	effectManagers: { [string]: EffectManager<any, any, any> },
	epicKeyByVat: { [string]: string },
	epicsMapByVat: { [string]: EpicType<any, any, any, any> },
	rootConditionsByActionType: { [string]: AnyConditionType },
	trace: Function,
	warn: Function,
|}
type EpicSubsType = { [epicVat: string]: { [updaterKey: string]: Array<string> } }

opaque type EpicsStoreType<Epics: Object>: {
	dispatch: DispatchType,
	getAllPendingEffectsPromises: () => PendingEffectPromisesType,
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	subscribeOnMessage: any => any,
	subscribeOnStateChange: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	replaceConfig: (CreateStorePropsType<Epics>) => void,
	warn: Function,
} = {|
	_getNextStateForActionWithoutUpdatingStoreState: (AnyActionType) => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	_getServiceState: () => { conditions: ConditionsValuesType, effectManagers: EffectManagersStateType<*, *>, epics: EpicsStateType },
	_setState: ServiceStateType => void,
	replaceConfig: (CreateStorePropsType<Epics>) => void,
	dispatch: DispatchType,
	getAllPendingEffectsPromises: () => PendingEffectPromisesType,
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	subscribeOnMessage: any => any,
	subscribeOnStateChange: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	warn: Function,
|}
function getFields(condition: AnyConditionType): {| ...CompulsoryConditionFieldsType, parentCondition: AnyConditionType |} {
	const {
		actionType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		sealed,
		isEpicCondition,
	} = condition

	return {		actionType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		parentCondition: condition,
		sealed,
		isEpicCondition,
	}
}
const dispatchActionEffectType: 'dispatch_action' = 'dispatch_action'
const dispatchBatchedActionsEffectType: 'dispatch_batch_actions_into_epics' = 'dispatch_batch_actions_into_epics' // dispatch multiple action into epic, but notify everybody only once

const sendMsgOutsideEpicsEffectType: 'send_msg_outside_of_epics' = 'send_msg_outside_of_epics'
const dispatchActionEffectCreator = (action: AnyActionType): DispatchActionEffectType => ({ type: dispatchActionEffectType,	action })
const dispatchBatchedActionsEffectCreator = (batches: DispatchActionsBatchesType): DispatchBatchedActionsEffectType => ({ type: dispatchBatchedActionsEffectType, batches })
const daEC = dispatchActionEffectCreator
const sendMessageOutsideEpicsEffectCreator = (msg: any): SendMsgOutsideEpicsEffectType => ({ type: sendMsgOutsideEpicsEffectType, msg })

class ReducerResult<S, SC, SE> {
	_state: S;
	_scope: SC;
	_sideEffects: Array<SE>;
	_updateReasons: Array<string>
	constructor(state: S, scope: SC) {
		this._state = state
		this._updateReasons = []
		this._scope = scope
		this._sideEffects = []
		this.doNothing = this
	}
	doNothing: ReducerResult<S, SC, SE>
	sideEffect(effect: SE): ReducerResult<S, SC, SE> {
		this._sideEffects.push(effect)
		return this
	}
	// update reason will be taken only if updater returned updated state
	updateState(updater: S => S, updateReason?: string): ReducerResult<S, SC, SE> {
		const nextState = updater(this._state)

		if (updateReason && (nextState !== this._state)) {
			this._updateReasons.push(updateReason)
		}
		this._state = nextState
		return this
	}
	updateScope(updater: SC => SC): ReducerResult<S, SC, SE> {
		const nextScope = updater(this._scope)

		this._scope = nextScope
		return this
	}
}

type MergeType<T, T1> = {| ...$Exact<T>, ...$Exact<T1> |}
function createUpdater<S: AnyValueType, SC: Object, DO: { [string]: { actionType: string } & Object }, ReactsTo: { [string]: { actionType: string } & Object }, E> ({ dependsOn, when, then }: {|
	dependsOn: DO,
	when: ReactsTo,
	then: ({| R: ReducerResult<S, SC, E>, changedActiveConditionsKeysMap: $ObjMap<MergeType<DO, ReactsTo>, typeof toTrueV>, scope: SC, sourceAction: AnyActionType, state: S, values: $Exact<$ObjMap<MergeType<DO, ReactsTo>, typeof extractConditionV>> |}) => ReducerResult<S, SC, E>,
|}): UpdaterType<S, SC, any, E> {
	let noActiveConditions = true
	const conditionKeysToConditionUpdaterKeys = []
	const compulsoryConditionsKeys = []
	const conditions = dependsOn ? ({ ...Object.keys(dependsOn).reduce((r, k: string) => ({ ...r, [k]: dependsOn[k].toPassive() }), {}), ...when }) : when

	Object.keys(when).forEach(reactsToKey => {
		if (when[reactsToKey].passive) {
			throw new Error(`can not use passive condition "${reactsToKey}" in reacts to.`)
		}
	})

	Object.keys(conditions).forEach(conditionKey => {
		const condition: AnyConditionType = conditions[conditionKey]

		conditionKeysToConditionUpdaterKeys.push([condition.valueKey, conditionKey])
		if (!condition.optional) {
			compulsoryConditionsKeys.push(conditionKey)
		}
		if (!condition.passive) {
			noActiveConditions = false
		}
	})
	if (noActiveConditions) {
		throw new Error('createUpdater requires at least one condition to be active')
	}

	if (dependsOn) {
		Object.keys(dependsOn).forEach(k => {
			if (when[k]) throw new Error(`dependsOn can not contain same key as reacts to: ${k}`)
		})
	}

	return {
		conditions,
		then: (then: any),
		conditionKeysToConditionUpdaterKeys,
		conditionsKeys: Object.keys((conditions: any)),
		compulsoryConditionsKeys,
	}
}

class EffectManagerResultType<S> {
	_state: S
	_actionsToDispatch: Array<{| action: AnyActionType, broadcast?: bool |}>
	_promise: Promise<void>
	constructor(state: S) {
		this._state = state
		this._actionsToDispatch = []
		this.doNothing = this
	}
	doNothing: EffectManagerResultType<S>
	updateState(updater: S => S): EffectManagerResultType<S> {
		this._state = updater(this._state)
		return this
	}
	dispatchAction(action: AnyActionType, broadcast?: true): EffectManagerResultType<S> {
		this._actionsToDispatch.push(({
			action,
			broadcast,
		}))
		return this
	}
	withEffectPromise(promise: Promise<void>): EffectManagerResultType<S> {
		this._promise = promise
		return this
	}
}

function createEffectManager<E, S, SC>({
	initialState,
	initialScope,
	onEffectRequest,
	requestType,
}: CreateEffectManagerPropsType<E, S, SC>): EffectManager<S, SC, E> {
	return {
		requestType,
		initialState,
		initialScope,
		onEffectRequest,
		_effect: (null: any),
	}
}
function getInitialState<S>({ initialState }: EpicType<S, any, any, any>): S { return initialState }

const isArray = Array.isArray
const getObjectKeys = Object.keys
const hasProp = Object.prototype.hasOwnProperty
const isObject = (o: any) => o != null && typeof o === 'object'
const isEmpty = (o: Object | Array<any>) => getObjectKeys((o: any)).length === 0
const unnest = <T>(arr: Array<Array<T> | T>): Array<T> => arr.reduce((acc, el) => acc.concat(el), [])

function deepFreeze <O: Object | Array<any>>(o: O): O {
	Object.freeze(o)
	if (o === undefined || o === null) return o
	Object.getOwnPropertyNames((o: any)).forEach(function (prop) {
		if (
			o.hasOwnProperty(prop)
			&& (o: any)[prop] !== null
			&& (typeof (o: any)[prop] === 'object' || typeof (o: any)[prop] === 'function')
			&& !Object.isFrozen((o: any)[prop])
		) {
			deepFreeze((o: any)[prop])
		}
	})
	return o
}
function findObjDiff(lhs: Object, rhs: Object) {
	if (lhs === rhs) return {}
	if (!isObject(lhs) || !isObject(rhs)) return [lhs, '->', rhs]
	return Object.keys(rhs).reduce((acc, key) => {
		if (lhs.hasOwnProperty(key)) {
			const difference = findObjDiff(lhs[key], rhs[key])

			if (isObject(difference) && isEmpty(difference)) return acc
			return { ...acc, [key]: difference }
		}
		return acc
	}, {})
}
// only serializible data (no Date/RegEx)
function deepEqual(a: any, b: any) {
	if (a === b) return true
	if (a && b && typeof a == 'object' && typeof b == 'object') {
		let i


		let length


		let key
		const
			arrA = isArray(a)


		const arrB = isArray(b)

		if (arrA && arrB) {
			length = a.length
			if (length != b.length) return false; // eslint-disable-line
			for (i = length; i-- !== 0;) {
				if (!deepEqual(a[i], b[i])) return false
			}
			return true
		}
		if (arrA != arrB) return false; // eslint-disable-line
		const keys = getObjectKeys(a)

		length = keys.length
		if (length !== getObjectKeys(b).length) return false
		for (i = length; i-- !== 0;) {
			if (!hasProp.call(b, keys[i])) return false
		}
		for (i = length; i-- !== 0;) {
			key = keys[i]
			if (!deepEqual(a[key], b[key])) return false
		}
		return true
	}
	return a!==a && b!==b; // eslint-disable-line
}
function deepCopy<T: Object | Array<any>>(src: T, _visited?: Array<Object | Array<any>>, _copiesVisited?: Array<Object | Array<any>>): T {
	if (src === null || typeof(src) !== 'object') {
		return src
	}
	if (src instanceof Date) return new Date(src.getTime())
	if (src instanceof RegExp) return (new RegExp(src): any)
	if (_visited === undefined) {
		// eslint-disable-next-line no-param-reassign
		_visited = []
		// eslint-disable-next-line no-param-reassign
		_copiesVisited = []
	}
	let i
	const len = _visited.length

	for (i = 0; i < len; i++) {
		if (src === _visited[i]) {
			return (_copiesVisited: any)[i]
		}
	}
	if (Object.prototype.toString.call(src) == '[object Array]') {
		const ret = (src: any).slice()

		_visited.push(src)
		// $FlowFixMe
		_copiesVisited.push(ret)
		let i = ret.length

		while (i--) {
			ret[i] = deepCopy(ret[i], _visited, _copiesVisited)
		}
		return ret
	}
	const
		proto = (Object.getPrototypeOf ? Object.getPrototypeOf((src: any)): src.__proto__)


	const dest = Object.create(proto)

	_visited.push(src)
	// $FlowFixMe
	_copiesVisited.push(dest)
	for (const key in (src: any)) {
		dest[key] = deepCopy((src: any)[key], _visited, _copiesVisited)
	}
	return (dest: any)
}
const values = o => Object.keys(o).map(k => o[k])
const last = arr => arr.slice(-1)[0]
const MatchAnyActionType: '*' = '*'

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
	const duplicatedVats = Object.keys(vatsCountMap)
		.filter(v => vatsCountMap[v] > 1)

	if (duplicatedVats.length) {
		throw new Error(`duplicate vats:\n${duplicatedVats.map(v => `Epics ${allEpicsKeys.filter(k => epics[k].vat === v).join(', ')} has same vat ${v}`).join('\n')}`)
	}
}
function getEffectManagersInitialState(effectManagers) {
	if (!effectManagers) { return {} }
	return Object.keys(effectManagers).reduce((state, key) => {
		const config = effectManagers[key]

		state[config.requestType] = {
			state: config.initialState,
			scope: deepCopy(config.initialScope),
			pendingEffects: [],
		}
		return state
	}, {})
}
const printUpdater = (u: EpicUpdaterExecutionInfoType) => `${u.updaterKey }(${[
	u.updaterEpicStateChange ? (u.updaterEpicStateChange === nothingChangedButObjectRecreatedWarn ? 'SW' : 'S') : '',
	u.updaterEpicScopeChange ? (u.updaterEpicScopeChange === nothingChangedButObjectRecreatedWarn ? 'SCW' : 'SC') : '',
	u.updaterReqestedEffects ? 'E' : '',
].filter(x => x).join(',')})`
const printEpicExecutionInfo = (epicExecutionInfo: EpicExecutionInfoType) => {
	const { updaters, epicKey } = epicExecutionInfo

	if (!updaters) return ''
	const result = updaters.filter(u => u.updaterEpicStateChange || u.updaterEpicScopeChange || u.updaterReqestedEffects).map(printUpdater).join('')

	if (!result.length) return ''
	return `${epicKey}[${result}]`
}

function traceToString(trace: ExecutionLevelInfoType, executedEpicsFilter?: EpicExecutionInfoType => bool = () => true, whitespaceLength?: number = 0, level?: number = 0): string {
// go till you see > 1 executed epics (after calling filter) or > 1 children layers
// measure length of output at this point, an pass it down, so we print white space in following lines
	const executedEpicsOutputs = trace.executedEpics
		.filter(executedEpicsFilter)
		.map(epicExecutionInfo => ({
			output: printEpicExecutionInfo(epicExecutionInfo),
			epicExecutionInfo,
		}))
		.filter(({ output }) => output)	// if executedEpicsOutputs.length > 1 - branching

	if (executedEpicsOutputs.length === 0 && whitespaceLength === 0) {
		return `${trace.triggerAction.type} does not have any effect`
	}
	const branches = executedEpicsOutputs.map(({ output, epicExecutionInfo }) => {
		const whitespace = new Array(whitespaceLength).join(' ')
		const isEpicVat = trace.triggerAction.type.indexOf('_VAT') !== -1
		const prevPrefix = `${whitespace}${level !== 0 && isEpicVat ? '' : trace.triggerAction.type}${level !== 0 ? '|':' '}=> `
		const prefix = `${prevPrefix}${output}`

		if (!epicExecutionInfo.childrenLayers) return prefix
		return [prefix, ...epicExecutionInfo.childrenLayers.map(childLayer => traceToString(childLayer, executedEpicsFilter, prevPrefix.length + 1, level + 1))]
	})

	return unnest<string>(branches).filter(x => x).join('\n')
}
function mergeUpdaterState(epicUpdaterState: UpdaterStateType, epicUpdaterStateUpdate: UpdaterStateUpdateType) {
	const result: UpdaterStateType = {
		valuesFullfilled: epicUpdaterStateUpdate.valuesFullfilled,
	}

	return result
}
function mergeUpdatersState(epicUpdatersState: EpicUpdatersStateType, epicUpdatersStateUpdate: EpicUpdatersStateUpdateType): EpicUpdatersStateType { // eslint-disable-line max-len
	return Object.keys(epicUpdatersState).reduce((s, updaterKey) => {
		const
			epicUpdterState = epicUpdatersState[updaterKey]


		const epicUpdaterStateUpdate = epicUpdatersStateUpdate[updaterKey]

		if (epicUpdaterStateUpdate === undefined) {
			s[updaterKey] = epicUpdterState
		} else {
			s[updaterKey] = mergeUpdaterState(epicUpdterState, epicUpdaterStateUpdate)
		}
		return s
	}, {})
}
function mergeEpic(epicState: EpicStateType, epicStateUpdate: EpicStateUpdateType): EpicStateType {
	return {
		updatersState: mergeUpdatersState(epicState.updatersState, epicStateUpdate.updatersState),
		state: epicStateUpdate.state === undefined ? epicState.state : epicStateUpdate.state,
		scope: epicStateUpdate.scope === undefined ? epicState.scope : epicStateUpdate.scope,
	}
}
function mergeEpicsStateWithUpdate(epicsState: EpicsStateType, epicsStateUpdate: EpicsStateUpdateType) {
	const resultEpicsState = {}

for (const key in epicsState) { // eslint-disable-line
		const
			state = epicsState[key]


		const update = epicsStateUpdate[key]

		resultEpicsState[key] = update === undefined ? state : mergeEpic(state, update)
	}
	return resultEpicsState
}
function mergeEffectManagerStateWithUpdate(emState: EffectManagerStateType<*, *>, update: EffectManagerStateUpdateType): EffectManagerStateType<*, *> {
	return {
		state: update.state === undefined ? emState.state : update.state,
		pendingEffects: update.pendingEffects === undefined ? emState.pendingEffects : update.pendingEffects,
		scope: emState.scope,
	}
}
function mergeEffectManagersStateWithUpdate(effectManagersState: EffectManagersStateType<*, *>, effectManagersStateUpdate: EffectManagersStateUpdateType) {
	const result = {}

	for (const key in effectManagersState) {
		const
			state = effectManagersState[key]


		const update = effectManagersStateUpdate[key]

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
			const _prevChildValue = prevConditionsValues[valueKey]
			const _prevChildValueIsUndefined = _prevChildValue === undefined
			const prevChildValue = _prevChildValueIsUndefined ? conditionsValues[valueKey] : _prevChildValue
			const _prevValue = prevConditionsValues[valueKey]
			const _prevValueIsUndefined = _prevValue === undefined
			const prevValue = _prevValueIsUndefined ? conditionsValues[condition.valueKey] : _prevValue

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
const nothingChangedButObjectRecreatedWarn = 'WARN: nothing changed, but new objects with same data was created'
const createExecuteAction = ({
	trace,
	epicsMapByVat,epicKeyByVat,
	effectManagers,
	dispatch,
	rootConditionsByActionType,
}: CreateExecuteActionPropsType) => {
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
	const orderOfEpicsVat = Object.keys(epicsMapByVat).reduce((r, vat, index) => ({ ...r, [vat]: index }), {})
	const vatToSortValue = (vat, currentActionType, initiatedByEpic) => {
		if (vat === currentActionType || (initiatedByEpic && initiatedByEpic.type === vat)) return -Infinity
		return orderOfEpicsVat[vat]
	}
	const getTraceUpdaters = ({ executionLevelTrace, subVat }) => {
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
				epicKey: epicKeyByVat[subVat],
				updaters,
			})
		}
		return updaters
	}
	const getNextLevelTrace = ({ executionLevelTrace, subVat, triggerAction }) => {
		const executedEpic = executionLevelTrace.executedEpics.find(e => e.epicVat === subVat)

		if (!executedEpic) { throw new Error ('Unexpected trace error, please investigate how this happend.') } // should never happen, but flow can not check it
		if (!executedEpic.childrenLayers) {
			executedEpic.childrenLayers = []
		}
		const nextLevelTrace = { triggerAction,
			executedEpics: [] }

		executedEpic.childrenLayers.push(nextLevelTrace)
		return nextLevelTrace
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
		batchedDispatchBatches,
		executionLevelTrace,
	}: ExecuteActionPropsType): void {
		function getEpicStateUpdate(epicVat) {
			let epicStateUpdate: EpicStateUpdateType = epicsStateUpdate[epicVat]

			if (!epicStateUpdate) {
				epicStateUpdate = ({ updatersState: {} }: EpicStateUpdateType)
				epicsStateUpdate[epicVat] = epicStateUpdate // eslint-disable-line no-param-reassign
			}
			return epicStateUpdate
		}
		function getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey) {
			let updaterStateUpdate: UpdaterStateUpdateType = epicStateUpdate.updatersState[updaterKey]

			if (!updaterStateUpdate) {
				epicStateUpdate.updatersState[updaterKey] = updaterStateUpdate = ({ valuesFullfilled: {...updaterState.valuesFullfilled} }: UpdaterStateUpdateType)
			}
			return updaterStateUpdate
		}
		const sourceAction = last(actionsChain)
		const action = actionsChain[0]
		const rootCondition: AnyConditionType | void = rootConditionsByActionType[action.type]
		const subscriptions: Array<SubscriptionType> = []

		if (!rootCondition) return

		conditionsValuesUpdate[rootCondition.valueKey] = action
		if (rootCondition.subscriptions) {
			subscriptions.push(...rootCondition.subscriptions)
		}
		if (rootCondition.childrenConditionsWithoutSelectorAndGuard) {
			rootCondition.childrenConditionsWithoutSelectorAndGuard.forEach(c => {
				if (c.subscriptions) {
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
			const { epicVat, updaterKey, conditionKey } = sub
			const epicStateUpdate = getEpicStateUpdate(epicVat)
			const epicState: EpicStateType = epicsState[epicVat]
			const updaterState = epicState.updatersState[updaterKey]
			const updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)

			updaterStateUpdate.valuesFullfilled[conditionKey] = true
		})
		const activeSubs = subscriptions.filter(s => !s.passive)

		if (!activeSubs.length) return
		const epicSubs: EpicSubsType = activeSubs.reduce((r: EpicSubsType, sub) => {
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
		const actionType: string = action.type
		const { initiatedByEpic } = (action: any)
		const epicVatsToBeExecuted = Object.keys(epicSubs).sort((vat1: string, vat2: string) => vatToSortValue(vat1, actionType, initiatedByEpic) - vatToSortValue(vat2, actionType, initiatedByEpic))

		epicVatsToBeExecuted.forEach((subVat: string) => {
			// $FlowFixMe
			if (action.targetEpicVatsMap && !action.targetEpicVatsMap[subVat]) {
				if (trace && executionLevelTrace) {
					executionLevelTrace.executedEpics.push({
						epicVat: subVat,
						epicKey: epicKeyByVat[subVat],
						epicNotExecutedBecause: `action.targetEpicVatsMap ${Object.keys(action.targetEpicVatsMap).join(', ')} does not contain ${subVat}`,
					})
				}
				return
			}
			const updaterSubs = epicSubs[subVat]
			const epic = epicsMapByVat[subVat]
			const epicState: EpicStateType = epicsState[subVat]
			const updateReasons = []
			const allEffects = []
			const updaterKeysThatChangedState = []
			const epicStateUpdate = getEpicStateUpdate(subVat)

			Object.keys(updaterSubs).forEach(updaterKey => {
				const changedActiveConditionsKeys: Array<string> = updaterSubs[updaterKey]
				const updater: UpdaterType<*, *, *, *> = epic.updaters[updaterKey]
				const conditions: { [string]: AnyConditionType } = updater.conditions
				const updaterState = epicState.updatersState[updaterKey]
				const updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)
				const { valuesFullfilled } = updaterStateUpdate				// todo put resetAllConditionsBelowThis logic here

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
						getTraceUpdaters({ executionLevelTrace,
							subVat }).push({
							updaterKey,
							changedActiveConditionsKeys,
							reducerNotExecutedBecause: `compulsory conditions keys ${updater.compulsoryConditionsKeys.filter(k => !valuesFullfilled[k]).join(', ')} are not fullifilled`,
						})
					}
					return
				}
				let atLeastOneValueIsDifferent = false
				const epicUpdaterKey = `${subVat}.${updaterKey}`
				const lastReducerValues = lastReducerValuesByEpicVatUpdaterKey[epicUpdaterKey]
				const reducerValues: Object = updater.conditionKeysToConditionUpdaterKeys.reduce((v, [conditionKey, conditionUpdaterKey]) => {
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
				}, {})				// epic value can be changed multiple times for single user action, this ensures that epic subscribers are called only once if nothing is changed from last call

				if (lastReducerValues && !atLeastOneValueIsDifferent) {
					if (trace && executionLevelTrace) {
						getTraceUpdaters({ executionLevelTrace,
							subVat }).push({
							updaterKey,
							changedActiveConditionsKeys,
							reducerValues,
							reducerNotExecutedBecause: 'It was called before in execution chain and values not changed since then',
						})
					}
					return
				}
				lastReducerValuesByEpicVatUpdaterKey[epicUpdaterKey] = reducerValues
				const prevState = epicStateUpdate.state === undefined ? epicState.state : epicStateUpdate.state
				const prevScope = epicStateUpdate.scope === undefined ? epicState.scope : epicStateUpdate.scope

				if (__DEV__) {
					deepFreeze(reducerValues)
					deepFreeze(prevState)
					deepFreeze(prevScope)
				}
				// TODO flow - mark everything passed inside then as $ReadOnly
				const result = updater.then({
					values: reducerValues,
					state: prevState,
					scope: prevScope,
					sourceAction,
					changedActiveConditionsKeysMap: changedActiveConditionsKeys.reduce((m, k) => { m[k] = true; return m }, {}),
					R: new ReducerResult(prevState, prevScope),
				})

				const stateUpdated = prevState !== result._state
				const scopeUpdated = prevScope !== result._scope

				if (trace && executionLevelTrace) {
					const updaters = getTraceUpdaters({ executionLevelTrace, subVat })
					const updaterTraceInfo: EpicUpdaterExecutionInfoType = {
						updaterKey,
						changedActiveConditionsKeys,
					}

					if (!stateUpdated && !scopeUpdated && !result._sideEffects.length) {
						updaterTraceInfo.didNothing = true
					} else {
						updaterTraceInfo.reducerValues = reducerValues
					}
					if (stateUpdated) {
						updaterTraceInfo.epicState = prevState
						if (typeof prevState === 'object') {
							const updaterEpicStateChange = findObjDiff(prevState, result._state)

							if (!isEmpty(updaterEpicStateChange)) {
								updaterTraceInfo.updaterEpicStateChange = updaterEpicStateChange
							} else {
								updaterTraceInfo.updaterEpicStateChange = nothingChangedButObjectRecreatedWarn
							}
						} else {
							updaterTraceInfo.updaterEpicStateChange = result._state
						}
					}
					if (scopeUpdated) {
						updaterTraceInfo.epicScope = prevScope
						const updaterEpicScopeChange = findObjDiff(prevScope, result._scope)

						if (!isEmpty(updaterEpicScopeChange)) {
							updaterTraceInfo.updaterEpicScopeChange = updaterEpicScopeChange
						} else {
							updaterTraceInfo.updaterEpicScopeChange = nothingChangedButObjectRecreatedWarn
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
				if (scopeUpdated) {
					epicStateUpdate.scope = result._scope // eslint-disable-line no-param-reassign
				}
				if (stateUpdated) {
					updaterKeysThatChangedState.push(updaterKey)
					epicStateUpdate.state = result._state // eslint-disable-line no-param-reassign
					updateReasons.push(...result._updateReasons)
					// TODO is this epic has subs to it self, execute them immideately, skipping after update
				}
				const { _sideEffects } = result

				if (_sideEffects.length) {
					_sideEffects.forEach(e => {
						if (e.type === dispatchActionEffectType) {
							// we dispatching action immediately as it may update state of same epic (e1) that requested action dispatch
							// this way if some other epic(e2) has subscription to e1, e2 will we called only once, with latest updated epic state
							const dispatchActionEffect: DispatchActionEffectType = (e: any)
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
								batchedDispatchBatches,
								executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
									subVat,
									triggerAction: dispatchActionEffect.action }) : undefined,
							})
						} else if (e.type === dispatchBatchedActionsEffectType) {
							batchedDispatchBatches.push(...e.batches)
						} else {
							allEffects.push(e)
						}
					})
				}

				if (__DEV__) {
					deepFreeze(result)
				}
			})
			if (updaterKeysThatChangedState.length) {
				const epicChangedAction: EpicStateChangedActionType = {
					type: subVat,
					value: epicStateUpdate.state,
				}

				if (updateReasons.length) {
					epicChangedAction.updateReasons = updateReasons
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
					batchedDispatchBatches,
					executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
						subVat,
						triggerAction: epicChangedAction,
					}) : undefined,
				})
			}
			if (allEffects.length) {
				allEffects.forEach(e => {
					const effectRequestType = e.type

					switch (effectRequestType) {
					case sendMsgOutsideEpicsEffectType: {
						const sendMessageOusideOfEpicsEffect: SendMsgOutsideEpicsEffectType = (e: any)

						messagesToSendOutside.push(sendMessageOusideOfEpicsEffect.msg)
						break
					}
					default: {
						const effectManager: EffectManager<*, *, *> = effectManagersByRequestType[effectRequestType]
						const effectManagerStateUpdate = effectManagersStateUpdate[effectRequestType]
						const effectManagerState = effectManagersState[effectRequestType]
						const state = (effectManagerStateUpdate && effectManagerStateUpdate.state) ? effectManagerStateUpdate.state : effectManagerState.state
						const result = effectManager.onEffectRequest({
							effect: e,
							requesterEpicVat: subVat,
							state,
							scope: effectManagerState.scope,
							dispatch,
							R: new EffectManagerResultType(state),
						})

						if (result._state !== state) {
							effectManagersStateUpdate[effectRequestType] = { ...effectManagerStateUpdate, state: result._state }
						}

						result._actionsToDispatch.forEach(({ action, broadcast }) => {
							if (!broadcast) {
								(action: any).targetEpicVatsMap = { [subVat]: true }
							}
							executeAction({
								actionsChain: [action, ...actionsChain],
								conditionsValues,
								prevConditionsValues,
								conditionsValuesUpdate,
								epicsState,
								epicsStateUpdate,
								effectManagersState,
								effectManagersStateUpdate,
								lastReducerValuesByEpicVatUpdaterKey,
								messagesToSendOutside,
								batchedDispatchBatches,
								executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
									subVat,
									triggerAction: action,
								}) : undefined,
							})
						})

						if (result._promise) {
							const effect = e

							effectManagersStateUpdate[effectRequestType] = {
								...(effectManagerStateUpdate || {}),
								state,
								pendingEffects: [
									...((effectManagerStateUpdate && effectManagerStateUpdate.pendingEffects) || []),
									{ effect, promise: result._promise },
								],
							}
							result._promise
								.then(() => dispatch({ type: effectPromiseCompleteAT,
									effect,
									effectRequestType }))
								.catch(error => dispatch({ type: effectPromiseCompleteAT,
									effect,
									effectRequestType,
									error }))
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
	const epicsState: EpicsStateType = epicsArr.reduce((state, epic) => {
		return {
			...state,
			[epic.vat]: {
				updatersState: Object.keys(epic.updaters).reduce(
					(s, updaterKey) => ({
						...s,
						[updaterKey]: {
							valuesFullfilled: Object.keys(epic.updaters[updaterKey].conditions).reduce((a, ck) => ({...a,
								[ck]: false }) ,{}),
						},
					}),
					{}
				),
				state: epic.initialState,
				scope: epic.initialScope,
			},
		}
	}, {})
	const epicsStateUpdate = {}
	const conditionsValues = {}
	const conditionsValuesUpdate = {}
	const effectManagersStateUpdate = {}
	const initialEpicsState: EpicsStateType = epicsArr
		.filter(epic => epic.initialState !== undefined)
		.reduce((epicsState: any, epic) => {
			if (epicsStateUpdate[epic.vat] && epicsStateUpdate[epic.vat].state) {
				return epicsState
			}
			const messagesToSendOutside = []
			const action = { type: epic.vat, value: epic.initialState }
			const batchedDispatchBatches = []
			const executionLevelTrace = { triggerAction: action, executedEpics: [] }

			executeAction({
				actionsChain: [(action: EpicStateChangedActionType)],
				conditionsValues,
				prevConditionsValues: {},
				conditionsValuesUpdate,
				epicsState,
				epicsStateUpdate,
				effectManagersState: {},
				effectManagersStateUpdate,
				lastReducerValuesByEpicVatUpdaterKey: {},
				messagesToSendOutside,
				batchedDispatchBatches,
				executionLevelTrace,
			})
			if (trace) {
				trace(executionLevelTrace)
			}
			if (messagesToSendOutside.length) {
				const msg = 'epics should not send messages outside on initializing default state. use storeCreated.condition instead.'

				warn(msg, messagesToSendOutside)
				throw new Error(msg)
			}
			if (batchedDispatchBatches.length) {
				const msg = 'epics should not then batched dispatch on initializing default state. use storeCreated.condition instead.'

				warn(msg, batchedDispatchBatches)
				throw new Error(msg)
			}
			if (Object.keys(effectManagersStateUpdate).length) {
				const msg = 'effect managers should not be toched during intial state initialization. use storeCreated.condition instead.'

				warn(msg, effectManagersStateUpdate)
				throw new Error(msg)
			}
			return mergeEpicsStateWithUpdate(epicsState, epicsStateUpdate)
		}, epicsState)

	return {
		initialEpicsState,
		initialCondtionsValues: { ...conditionsValues,
			...conditionsValuesUpdate },
	}
}
const createComputeOutsideState = ({ epicsVatToStateKeyMap }) => (state) => Object.keys(state).reduce((s, vat) => {
	s[epicsVatToStateKeyMap[vat]] = state[vat].state
	return s
}, {})

function findRootCondition(condition: AnyConditionType): AnyConditionType {
	if (condition.parentCondition) {
		return findRootCondition(condition.parentCondition)
	}
	return condition
}

function processConditionsSubscriptions(epics) {
	const rootConditionsByActionType = {}

	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]

		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]

			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: AnyConditionType = updater.conditions[conditionKey]
				const rootCondition = findRootCondition(condition)

				if (!rootConditionsByActionType[rootCondition.actionType]) {
					rootConditionsByActionType[rootCondition.actionType] = rootCondition
				}

				if (!condition.subscriptions) {
					condition.subscriptions = []
				}
				condition.subscriptions.push({
					epicVat: epic.vat,
					updaterKey,
					conditionKey,
					passive: condition.passive,
				})
			})
		})
	})

	return rootConditionsByActionType
}
function validateResetConditions(epics) {
	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]

		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]

			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: AnyConditionType = updater.conditions[conditionKey]

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
				const condition: AnyConditionType = updater.conditions[conditionKey]

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
type CreateConditionType = <V: Object>(actionType: string) => Condition<V>
const globalRootConditionsByActionType = {}
const globalSelectorsInUse = []
const globalGuardsInUse = []

function _createCondition({
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
	isEpicCondition,
}: CreateConditionPropsType, calledFromRoot) {
// skipping parents without selectors or guards, as they are useless during changed conditions computation
	if (parentCondition && !parentCondition.selectorKey && !parentCondition.selector && !parentCondition.guard && parentCondition.parentCondition) {
		// eslint-disable-next-line no-param-reassign
		parentCondition = parentCondition.parentCondition
	}
	if (selector && globalSelectorsInUse.indexOf(selector) === -1) {
		globalSelectorsInUse.push(selector)
	}
	if (guard && globalGuardsInUse.indexOf(guard) === -1) {
		globalGuardsInUse.push(guard)
	}
	const condition: AnyConditionType = ({
		valueKey: `${parentCondition ? parentCondition.valueKey : actionType}${selectorKey ? `.${selectorKey}` : ''}${selector ? (`.$$selector${ globalSelectorsInUse.indexOf(selector)}`) : ''}${guard ? `.$$guard${ globalGuardsInUse.indexOf(guard)}` : ''}`,
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
			return _createCondition({ ...getFields(condition), passive: true })
		},
		toOptional() {
			return _createCondition({ ...getFields(condition), optional: true })
		},
		resetConditionsByKey(keys) {
			return _createCondition({ ...getFields(condition), resetConditionsByKeyKeys: keys })
		},
		resetConditionsByKeyAfterReducerCall(keys) {
			return _createCondition({ ...getFields(condition), resetConditionsByKeyAfterReducerCallKeys: keys })
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
			const newCondition = _createCondition({ ...getFields(condition), guard })

			return newCondition
		},
	}: any)

	condition.to = condition.toOptional
	condition.wg = condition.withGuard
	if (!sealed) {
		const withSelectorKey = (selectorKey: string): AnyConditionType => {
			const { childrenConditionsWithSelectorOrGuard } = condition

			if (childrenConditionsWithSelectorOrGuard) {
				const existingCondition = childrenConditionsWithSelectorOrGuard.find(c => c.selectorKey === selectorKey)

				if (existingCondition) return existingCondition
			}
			return _createCondition({ ...getFields(condition), selectorKey })
		}

		condition.withSelectorKey = (withSelectorKey: any)
		condition.wsk = condition.withSelectorKey
		const withSelector = selector => {
			const { childrenConditionsWithSelectorOrGuard } = condition

			if (childrenConditionsWithSelectorOrGuard) {
				const existingCondition = childrenConditionsWithSelectorOrGuard.find(c => c.selector === selector)

				if (existingCondition) return (existingCondition: any)
			}
			return (_createCondition({ ...getFields(condition),
				selector,
				sealed: true }): any)
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
		globalRootConditionsByActionType[actionType] = condition
	}
	return condition
}
function createCondition<V: Object> (actionType: string, isEpicCondition?: bool = false): Condition<V> {
	if (globalRootConditionsByActionType[actionType]) {
		return globalRootConditionsByActionType[actionType]
	}
	return (_createCondition({
		actionType,
		passive: false,
		optional: false,
		resetConditionsByKeyKeys: null,
		resetConditionsByKeyAfterReducerCallKeys: null,
		sealed: false,
		isEpicCondition,
	}, true): any)
}
function createEpicConditionReceiveFullAction<State>(vat: string): Condition<EpicValueActionType<State>> {
	return createCondition<EpicValueActionType<State>>(vat, true)
}
function createEpicCondition<State>(vat: string): Condition<State> {
	return createEpicConditionReceiveFullAction(vat).withSelectorKey('value')
}
function createEpicWithScope<S, SC, E, PC>({ vat, updaters, initialState, initialScope, pluginConfig }: CreateEpicWithScopePropsType<S, SC, E, PC>): EpicType<S, SC, E, PC> {
	const c = createEpicCondition<S>(vat)

	return ({
		vat,
		updaters,
		initialState,
		initialScope,
		c,
		condition: c,
		pluginConfig,
	})
}
function createEpic<S, E, PC>({ vat, updaters, initialState, pluginConfig }: CreateEpicPropsType<S, E, PC>): EpicType<S, void, E, PC> {
	return createEpicWithScope({
		vat,
		updaters,
		initialState,
		initialScope: undefined,
		pluginConfig,
	})
}
const matchAnyActionCondition: Condition<typeof MatchAnyActionType> = createCondition(MatchAnyActionType)// TODO put correct annotation

const createPluginStateKey = (key: string) => `plugin/${key}`

function createEpicsSubStoresByVat(epics: { [string]: EpicType<*, *, *, *> }): { [epicKey: string]: EpicsStoreType<any> } {
	return getObjectKeys(epics).reduce((result, epicKey) => {
		const epic = epics[epicKey]

		result[epic.vat] = createStore({ epics: { [epicKey]: epic }, isSubStore: true })
		return result
	}, {})
}

type ServiceStateType = {|
	conditions: ConditionsValuesType,
	effectManagers: EffectManagersStateType<AnyValueType, any>,
	epics: EpicsStateType,
|}

type DevToolsConfigType = Object

type CreateStorePropsType<Epics> = {|
	debug?: true | {| devTools?: { config: DevToolsConfigType }, trace?: Function, warn?: Function |},
	effectManagers?: { [string]: EffectManager<*, *, *> },
	epics: Epics,
	plugins?: { [string]: PluginType },
	isSubStore?: true,
|}

function createStore<Epics: { [string]: EpicType<*, *, *, *> }> ({
	epics,
	effectManagers = {},
	plugins = {},
	debug,
	isSubStore,
}: CreateStorePropsType<Epics>): EpicsStoreType<Epics> {
	// eslint-disable-next-line no-console
	const { warn = (() => null: Function), trace, devTools: devToolsConfig } = debug === true ? { devTools: { config: { } }, warn: undefined, trace: e => console.log(traceToString(e))} : (debug || {})

	let devTools

	function onEpicsStateChange(epicsState: EpicsStateType) {
		outsideState = computeOutsideState(epicsState)
		stateChangedSubscribers.forEach(sub => sub((outsideState: any)))
	}

	let batchDispatchIsInProgress: bool = false
	let messagesAccumulatedDuringBatchDispatch: Array<any> = []
	let epicsStateChangedCallbackAfterBatchDispatchComplete: () => void = () => undefined

	function dispatch(action: { type: any }, meta?: MetaType = ({}: any)) {
		const messagesToSendOutside = []
		const epicsStateUpdate = {}
		const effectManagersStateUpdate = {}

		if (meta.targetEpicVats) {
			(action: any).targetEpicVatsMap = meta.targetEpicVats.reduce(
				(m,v) => {
					m[v] = true
					return m
				},
				{}
			)
		}
		let	updatedConditionsValues
		let updatedEpicsState
		let updatedEffectManagersState
		const batchedDispatchBatches = []

		if (action.type === effectPromiseCompleteAT) {
			const { effect, error, effectRequestType } = ((action: any): {| effect: {||}, effectRequestType: string, error: Error |})
			const effectManagerState = serviceState.effectManagers[effectRequestType]

			effectManagersStateUpdate[effectRequestType] = {
				...effectManagersStateUpdate[effectRequestType],
				pendingEffects: effectManagerState.pendingEffects.filter(pe => pe.effect !== effect),
			}
			if (error) {
				warn(`Effect ${effectRequestType} error ${error.message}.`, effect, error)
			}
		} else {
			const conditionsValuesUpdate = {}
			const executionLevelTrace = { triggerAction: action, executedEpics: [] }

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
				batchedDispatchBatches,
				executionLevelTrace,
			})
			if (trace) trace(executionLevelTrace)
			if (Object.keys(conditionsValuesUpdate).length !== 0) {
				updatedConditionsValues = { ...serviceState.conditions,	...conditionsValuesUpdate }
			}
			const updatedEpicsTypes = Object.keys(epicsStateUpdate)
			const noBatchDispatchBatches = batchedDispatchBatches.length === 0

			if (updatedEpicsTypes.length !== 0) {
				updatedEpicsState = mergeEpicsStateWithUpdate(serviceState.epics, epicsStateUpdate)

				if (!batchDispatchIsInProgress && noBatchDispatchBatches) {
					onEpicsStateChange(updatedEpicsState)
				}
			}
			if (batchDispatchIsInProgress || !noBatchDispatchBatches) {
				messagesAccumulatedDuringBatchDispatch.push(...messagesToSendOutside)
			} else {
				messagesToSendOutside.forEach(m => msgSubscribers.forEach(sub => sub(m)))
			}
		}
		if (Object.keys(effectManagersStateUpdate).length) {
			updatedEffectManagersState = mergeEffectManagersStateWithUpdate(serviceState.effectManagers, effectManagersStateUpdate)
		}
		if (updatedConditionsValues || updatedEpicsState ||	updatedEffectManagersState) {
			const nextServiceState = {
				epics: updatedEpicsState || serviceState.epics,
				conditions: updatedConditionsValues || serviceState.conditions,
				effectManagers: updatedEffectManagersState || serviceState.effectManagers,
			}

			if (devTools && Object.keys(epicsStateUpdate).length) {
				let atLeastOneChange = false

				Object.keys(epicsStateUpdate).forEach(vat => {
					if (atLeastOneChange) return
					const epicState = serviceState.epics[vat]
					const epicStateUpdate = epicsStateUpdate[vat]

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

			if (batchedDispatchBatches.length) {
				batchDispatchIsInProgress = true

				let atLeastOneChange = false

				batchedDispatchBatches.forEach(({ actions, targetEpicVat }) => {
					const epicSubStore = epicsSubStoresByVat[targetEpicVat]

					epicSubStore._setState({
						epics: { [targetEpicVat]: serviceState.epics[targetEpicVat] },
						conditions: {},
						effectManagers: {},
					})
					actions.forEach(a => epicSubStore.dispatch(a))

					const currentEpicState = serviceState.epics[targetEpicVat]
					const newEpicStateState = epicSubStore.getState()[targetEpicVat]

					dispatch({ type: targetEpicVat, value: newEpicStateState })

					if (currentEpicState.state !== newEpicStateState) {
						serviceState.epics = { ...serviceState.epics, [targetEpicVat]: { ...currentEpicState, state: newEpicStateState } }
						atLeastOneChange = true
					}
				})
				if (atLeastOneChange || updatedEpicsState) {
					onEpicsStateChange(serviceState.epics)
				}

				messagesAccumulatedDuringBatchDispatch.forEach(m => msgSubscribers.forEach(sub => sub(m)))
				epicsStateChangedCallbackAfterBatchDispatchComplete()

				batchDispatchIsInProgress = false
				messagesAccumulatedDuringBatchDispatch = []
				epicsStateChangedCallbackAfterBatchDispatchComplete = () => undefined
			}
		}
	}

	const pluginInitializationComplete = false

	getObjectKeys(plugins).forEach(pluginKey => {
		const plugin: PluginType = plugins[pluginKey]

		plugin({
			injectUpdaters: injector => getObjectKeys(epics).forEach(epicKey => {
				const epic = epics[epicKey]
				const updatersMapToInject = injector(epic)

				if (!updatersMapToInject) return
				const updatersKeysToInject = getObjectKeys(updatersMapToInject)

				if (updatersKeysToInject.length) {
					updatersKeysToInject.forEach(k => {
						epic.updaters = { ...epic.updaters,	[`${pluginKey}/${k}`]: updatersMapToInject[k] }
					})
				}
			}),
			injectEpics: epicsToInject => {
				// eslint-disable-next-line no-param-reassign
				epics = { ...epics, ...getObjectKeys(epicsToInject).reduce((r,k) => ({ ...r, [createPluginStateKey(k)]: epicsToInject[k] }), {})}
			},
			getEpics: () => {
				if (!pluginInitializationComplete) {throw new Error('getEpics can not be used during plugin initialization because they are not in the final state yet.')}
				return epics
			},
			getEpicsWithPluginConfig: () => {
				return getObjectKeys(epics).filter(key => epics[key].pluginConfig).map(key => ({ key, ...epics[key] }))
			},
		})
	})
	epics = deepCopy(epics) // eslint-disable-line no-param-reassign
	const epicsSubStoresByVat = isSubStore ? {} : createEpicsSubStoresByVat(epics)

	if (!isSubStore) {
		validateUniqVats(epics)
		validateResetConditions(epics)
		validateEpicConditions(epics)
	}

	const rootConditionsByActionType = processConditionsSubscriptions(epics)

	if (__DEV__) {
		deepFreeze(epics)
		deepFreeze(effectManagers)
		deepFreeze(plugins)
	}
	const epicKeyByVat = getObjectKeys(epics).reduce((m, epicKey) => ({ ...m, [epics[epicKey].vat]: epicKey }), {})
	const epicsArr = values(epics)
	const epicsMapByVat = values(epics).reduce((a, e) => ({ ...a, [e.vat]: e }), {})
	const executeAction = createExecuteAction({
		trace,
		epicsMapByVat,
		epicKeyByVat,
		warn,
		effectManagers,
		dispatch,
		rootConditionsByActionType,
	})
	const epicsVatToStateKeyMap = Object.keys(epics).reduce((r, epicStateKey) => {
		r[epics[epicStateKey].vat] = epicStateKey
		return r
	}, {})
	const computeOutsideState = createComputeOutsideState({ epicsVatToStateKeyMap })
	const { initialEpicsState, initialCondtionsValues } = computeInitialStates({
		epicsArr,
		warn,
		executeAction,
		trace,
	})

	let	serviceState: ServiceStateType = {
		conditions: initialCondtionsValues,
		epics: initialEpicsState,
		effectManagers: getEffectManagersInitialState(effectManagers),
	}
	let outsideState = computeOutsideState(serviceState.epics)

	function getAllPendingEffectsPromises() {
		return Object.keys(serviceState.effectManagers).reduce((pendingEffectsPromises, requestEffectType) => {
			pendingEffectsPromises.push(...serviceState.effectManagers[requestEffectType]
				.pendingEffects.map(({ promise, effect }) => ({ promise,
					requestEffectType,
					effect })))
			return pendingEffectsPromises
		}, [])
	}
	const stateChangedSubscribers = []
	const msgSubscribers = []

	if (debug && devToolsConfig && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
		devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ ...devToolsConfig, name: 'service' })
		devTools.subscribe((message) => {
			if (message.type === 'DISPATCH' && message.state) {
				serviceState = JSON.parse(message.state)
				onEpicsStateChange(serviceState.epics)
			}
		})
		devTools.init(serviceState)
	}
	if (!isSubStore) {
		dispatch(storeCreated.ac())
	}

	let storeReplacement

	return {
		_getServiceState: () => {
			if (storeReplacement) return storeReplacement._getServiceState()
			return serviceState
		},
		_getNextStateForActionWithoutUpdatingStoreState: (action) => {
			if (storeReplacement) {
				return storeReplacement._getNextStateForActionWithoutUpdatingStoreState(action)
			}
			const epicsStateUpdate = {}
			const conditionsValuesUpdate = {}
			const effectManagersStateUpdate = {}

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
				messagesToSendOutside: [],
				batchedDispatchBatches: [],
				executionLevelTrace: undefined,
			})
			const updatedEpicsTypes = Object.keys(epicsStateUpdate)

			if (updatedEpicsTypes.length !== 0) {
				const updatedEpicsState = mergeEpicsStateWithUpdate(serviceState.epics, epicsStateUpdate)

				computeOutsideState(updatedEpicsState)
			}

			return (computeOutsideState(serviceState.epics): any)
		},
		_setState(_serviceState: ServiceStateType): void {
			if (storeReplacement) {
				storeReplacement._setState(_serviceState)
			}
			serviceState = _serviceState
		},

		replaceConfig: (creaceEpicsStoreConfig) => {
			const currentState: any = storeReplacement ? storeReplacement._getServiceState() : serviceState

			storeReplacement = createStore(creaceEpicsStoreConfig)
			storeReplacement._setState(currentState)
			stateChangedSubscribers.forEach(sub => storeReplacement.subscribeOnStateChange(sub))
			msgSubscribers.forEach(sub => storeReplacement.subscribeOnMessage(sub))
			// TODO dispose side effects
		},
		dispatch: (a: AnyActionType, meta?: MetaType) => {
			if (storeReplacement) {
				return storeReplacement.dispatch(a, meta)
			}
			return dispatch(a)
		},
		getState() {
			if (storeReplacement) {
				return storeReplacement.getState()
			}
			return (outsideState: any)
		},
		getAllPendingEffectsPromises: () => {
			if (storeReplacement) {
				return storeReplacement.getAllPendingEffectsPromises()
			}
			return getAllPendingEffectsPromises()
		},
		subscribeOnStateChange: subscriber => {
			if (storeReplacement) {
				storeReplacement.subscribeOnStateChange(subscriber)
			}
			stateChangedSubscribers.push(subscriber)
		},
		subscribeOnMessage: sub => {
			if (storeReplacement) {
				storeReplacement.subscribeOnStateChange(sub)
			}
			msgSubscribers.push(sub)
		},
		warn,
	}
}
function createACAC<ActionExtraFields>(actionType: string): {|
	ac: ActionExtraFields => {| ...ActionExtraFields, type: string |},
	actionCreator: ActionExtraFields => {| ...ActionExtraFields, type: string |},
	c: Condition<{| ...ActionExtraFields, type: string |}>,
	condition: Condition<{| ...ActionExtraFields, type: string |}>,
	type: string,
|} {
	const actionCreator = extraFields => ({ type: actionType, ...extraFields })
	const condition = createCondition(actionType)

	return ({
		actionCreator,
		condition,
		ac: actionCreator,
		c: condition,
		type: actionType,
	})
}
function createSACAC(actionType: string): {|
	ac: () => {| type: string |},
	actionCreator: () => {| type: string |},
	c: Condition<{| type: string |}>,
	condition: Condition<{| type: string |}>,
	type: string,
|} {
	const actionCreator = () => ({ type: actionType })
	const condition = createCondition(actionType)

	return ({
		actionCreator,
		condition,
		ac: actionCreator,
		c: condition,
		type: actionType,
	})
}

const storeCreated = createSACAC('@STORE_CREATED')

export type { // eslint-disable-line import/group-exports
	Condition,
	BuiltInEffectType,
	CreateEffectManagerType,
	CreateConditionType,
	UpdaterType,
	EpicsStoreType,
	EpicType,
	DispatchType,
	PluginPropsType,
	PluginType,
	AnyValueType,
	AnyConditionType,
	AnyActionType,
}

export { // eslint-disable-line import/group-exports
	createSACAC,
	createACAC,
	createEpic,
	createEpicWithScope,
	matchAnyActionCondition,
	createStore,
	dispatchActionEffectCreator,
	daEC,
	dispatchBatchedActionsEffectCreator,
	sendMessageOutsideEpicsEffectCreator,
	createCondition,
	createEpicCondition,
	createUpdater,
	createEffectManager,
	deepCopy,
	deepEqual,
	traceToString,
	storeCreated,
	createPluginStateKey,
	getObjectKeys,
}
