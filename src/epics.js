// @flow

const toTrueV = (): true => true
const extractConditionV =<V>(c: { value: V }): V => c.value

const __DEV__ = process.env !== 'production'

type AnyValueType = number | string | bool | Object | Array<AnyValueType> | null
type CompulsoryConditionFieldsType = {|
	msgType: string,
	isEpicCondition: bool,
	optional: bool,
	passive: bool,
	resetConditionsByKeyAfterReducerCallKeys: Array<string> | null,
	resetConditionsByKeyKeys: Array<string> | null,
	sealed: bool,
|}
type SubscriptionType = {| conditionKey: string, epicVcet: string, passive: bool, updaterKey: string |}
opaque type Condition<V: Object>: {
	msgType: string,
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
	match: AnyMsgType => V | void,
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
	match: AnyMsgType => V | void,
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
type AnyMsgType = { type: $Subtype<string> } // eslint-disable-line flowtype/require-exact-type
type MetaType = {| targetEpicVcet?: string[] |}
type DispatchType = (AnyMsgType, meta?: MetaType) => void
type ConditionsValuesType = { [string]: AnyValueType }
opaque type DispatchMsgEffectType = {|
	msg: { type: string },
	type: typeof dispatchMsgEffectType,
|}
opaque type DispatchBatchedMsgsEffectType = {|
	batches: Array<{| msgs: Array<AnyMsgType>, targetEpicVcet: string |}>,
	type: typeof dispatchBatchedMsgsEffectType,
|}
opaque type SendMsgOutsideEpicsEffectType = {|
	msg: any,
	type: typeof sendMsgOutsideEpicsEffectType,
|}
type ReducerType<S: AnyValueType, SC: Object, CV, E> = ({| R: ReducerResult<S, SC, E>, changedActiveConditionsKeysMap: $ObjMap<CV, typeof toTrueV>, scope: SC, sourceMsg: AnyMsgType, state: S, values: CV |}) => ReducerResult<S, SC, E>
type BuiltInEffectType = DispatchMsgEffectType | SendMsgOutsideEpicsEffectType | DispatchBatchedMsgsEffectType
type UpdaterType<S, SC, C: { [string]: { msgType: string } & Object }, E> = {|
	compulsoryConditionsKeys: Array<$Keys<C>>,
	conditionKeysToConditionUpdaterKeys: Array<[string, $Keys<C>]>,
	conditions: C,
	conditionsKeys: Array<$Keys<C>>,
	then: ReducerType<S, SC, $Exact<$ObjMap<C, typeof extractConditionV>>, E>,
|}
type EpicValueChangedEventType<State> = {| type: string, payload: State |}
opaque type EpicType<S, SC, E, PC>: { c: Condition<S>, condition: Condition<S>, initialState: S, pluginConfig: PC | void, vcet: string } = {|
	c: Condition<S>,
	condition: Condition<S>,
	initialScope: SC,
	initialState: S,
	pluginConfig: PC | void,
	updaters: { [string]: UpdaterType<S, SC, *, E> },
	vcet: string,
|}
type CreateEpicWithScopePropsType<S, SC, E, PC> = {|
	initialScope: SC,
	initialState: S,
	pluginConfig?: PC,
	updaters: { [string]: UpdaterType<S, SC, *, E> },
	vcet: string,
|}
type CreateEpicPropsType<S, E, PC> = {|
	initialState: S,
	pluginConfig?: PC,
	updaters: { [string]: UpdaterType<S, void, *, E> },
	vcet: string,
|}

type OnEffectRequestType<S, SC, E> = ({| dispatch: DispatchType, effect: $ReadOnly<E>, requesterEpicVcet: string, scope: SC, state: $ReadOnly<S>, R: EffectManagerResultType<S> |}) => EffectManagerResultType<S>

type EMDRFnType<S, SC> = ({ state: S, scope: SC }) => void
opaque type EffectManager<S, SC, E> = {|
	_effect: E,
	initialScope?: SC,
	initialState?: S,
	key?: string,
	onEffectRequest: OnEffectRequestType<S, SC, E>,
	requestType: string,
	destroyEffects: EMDRFnType<S, SC>,
	recreateEffects: EMDRFnType<S, SC>,
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
	destroyEffects: EMDRFnType<S, SC>,
	recreateEffects: EMDRFnType<S, SC>,
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
type EpicStateChangedEventType = {|
type: string,
updateReasons?: Array<string>,
payload: AnyValueType,
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
	thenValues?: Object,
	updaterEpicScopeChange?: Object,
	updaterEpicStateChange?: Object,
	updaterKey: string,
	updaterReqestedEffects?: Array<Object>,
	error?: Error,
|}
type EpicExecutionInfoType = {|
	childrenLayers?: Array<ExecutionLevelInfoType>,
	epicKey: string,
	epicNotExecutedBecause?: string,
	epicVcet: string, // eslint-disable-line
	updaters?: Array<EpicUpdaterExecutionInfoType>,
|}
type ExecutionLevelInfoType = {|
	executedEpics: Array<EpicExecutionInfoType>,
	triggerMsg: AnyMsgType,
|}
type DispatchMsgsBatchesType = Array<{| msgs: Array<AnyMsgType>, targetEpicVcet: string |}>
type ExecuteMsgPropsType = {|
	msgsChain: Array<AnyMsgType>,
	conditionsValues: ConditonsValuesType,
	conditionsValuesUpdate: ConditonsValuesUpdateType,
	effectManagersState: EffectManagersStateType<*, *>,
	effectManagersStateUpdate: EffectManagersStateUpdateType,
	epicsState: EpicsStateType,
	epicsStateUpdate: EpicsStateUpdateType,
	batchedDispatchBatches: DispatchMsgsBatchesType,
	executionLevelTrace: ExecutionLevelInfoType | void,
	lastReducerValuesByEpicVcetUpdaterKey: { [string]: Object },
	messagesToSendOutside: Array<AnyMsgType>,
	prevConditionsValues: ConditonsValuesType,
	level: number,
|}
type CreateExecuteMsgPropsType = {|
	dispatch: DispatchType,
	effectManagers: { [string]: EffectManager<any, any, any> },
	epicKeyByVcet: { [string]: string },
	epicsMapByVcet: { [string]: EpicType<any, any, any, any> },
	rootConditionsByMsgType: { [string]: AnyConditionType },
	trace: Function,
	warn: Function,
|}
type EpicSubsType = { [epicVcet: string]: { [updaterKey: string]: Array<string> } }

type ErrorTransferPayloadType = {|
	msgsChain: Array<AnyMsgType>,
	reproductionData: ReproductionDataType,
	sourceMsg: AnyMsgType,
|}

type ConditionSelectorCallReproductionDataType = {|
	type: 'EPIC_CONDITION_SELECTOR_CALL',
	conditionValueKey: string,
	childConditionIndex: number,
	value: AnyValueType,
	prevValue: AnyValueType | void,
	triggerMsg: AnyMsgType,
|}

type ConditionGuardCallReproductionDataType = {|
	type: 'EPIC_CONDITION_GUARD_CALL',
	conditionValueKey: string,
	childConditionIndex: number,
	value: AnyValueType,
	triggerMsg: AnyMsgType,
|}

type ThenCallReproductionDataType = {|
	type: 'EPIC_THEN_CALL',
	epicVcet: string,
	updaterKey: string,
	updaterValues: Object,
	epicState: AnyValueType,
	epicScope: AnyValueType,
	sourceMsg: AnyMsgType,
	changedActiveConditionsKeys: Array<string>,
|}

type UnexpectedErrorReproductionDataType = {|
	type: 'EPIC_UNEXPECTED_ERROR',
|}

type ReproductionDataType = ConditionGuardCallReproductionDataType | ConditionSelectorCallReproductionDataType | ThenCallReproductionDataType | UnexpectedErrorReproductionDataType

type ErrorDataType = {|
	error: Error,
	msgsChain: Array<AnyMsgType>,
	sourceMsg: AnyMsgType,
	reproductionData: ReproductionDataType,
|}

opaque type EpicsStoreType<Epics: Object>: {
	dispatch: DispatchType,
	_getServiceState: () => { conditions: ConditionsValuesType, effectManagers: EffectManagersStateType<*, *>, epics: EpicsStateType },
	_setState: ServiceStateType => void,
	_setOutsideState: Object => void,
	destroyEffects: () => void,
	recreateEffects: () => void,
	getAllPendingEffectsPromises: () => PendingEffectPromisesType,
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	subscribeOnDispatch: (AnyMsgType => any) => () => void,
	subscribeOutMsg: any => any,
	subscribeOnError: (ErrorDataType => any) => () => void,
	subscribe: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	replaceConfig: (CreateStorePropsType<Epics>) => void,
	resetToInitialState: () => void,
	warn: Function,
} = {|
	_getNextStateForMsgWithoutUpdatingStoreState: (AnyMsgType) => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	_getServiceState: () => { conditions: ConditionsValuesType, effectManagers: EffectManagersStateType<*, *>, epics: EpicsStateType },
	_setState: ServiceStateType => void,
	_setOutsideState: Object => void,
	destroyEffects: () => void,
	recreateEffects: () => void,
	replaceConfig: (CreateStorePropsType<Epics>) => void,
	resetToInitialState: () => void,
	dispatch: DispatchType,
	getAllPendingEffectsPromises: () => PendingEffectPromisesType,
	getState: () => $Exact<$ObjMap<Epics, typeof getInitialState>>,
	subscribeOutMsg: any => any,
	subscribeOnDispatch: (AnyMsgType => any) => () => void,
	subscribeOnError: (ErrorDataType => any) => () => void,
	subscribe: (sub: ($Exact<$ObjMap<Epics, typeof getInitialState>>) => any) => any,
	warn: Function,
|}

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

const createConditionMatcher = <V>(condition: Condition<V>): (AnyMsgType => V | void) => {
	const valueSelector = buildValueSelector(condition)

	return (msg: AnyMsgType): V | void => {
		if (condition.msgType === msg.type) {
			return valueSelector((msg: any))
		}
	}
}

function getFields(condition: AnyConditionType): {| ...CompulsoryConditionFieldsType, parentCondition: AnyConditionType |} {
	const {
		msgType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		sealed,
		isEpicCondition,
	} = condition

	return {		msgType,
		passive,
		optional,
		resetConditionsByKeyKeys,
		resetConditionsByKeyAfterReducerCallKeys,
		parentCondition: condition,
		sealed,
		isEpicCondition,
	}
}
const dispatchMsgEffectType: 'dispatch_msg' = 'dispatch_msg'
const dispatchBatchedMsgsEffectType: 'dispatch_batch_msgs_into_epics' = 'dispatch_batch_msgs_into_epics' // dispatch multiple msgs into epic, but notify everybody only once

const sendMsgOutsideEpicsEffectType: 'send_msg_outside_of_epics' = 'send_msg_outside_of_epics'
const dispatchMsgEffectCreator = (msg: AnyMsgType): DispatchMsgEffectType => ({ type: dispatchMsgEffectType, msg })
const dispatchBatchedMsgsEffectCreator = (batches: DispatchMsgsBatchesType): DispatchBatchedMsgsEffectType => ({ type: dispatchBatchedMsgsEffectType, batches })
const daEC = dispatchMsgEffectCreator
const sendMsgOutsideEpicsEffectCreator = (msg: any): SendMsgOutsideEpicsEffectType => ({ type: sendMsgOutsideEpicsEffectType, msg })

class ReducerResult<S, SC, SE> {
	_state: S;
	_scope: SC;
	_sideEffects: Array<SE>;
	_updateReasons: Array<string>;
	_customEpicChangedEventFields: Object;
	constructor(state: S, scope: SC) {
		this._state = state
		this._updateReasons = []
		this._scope = scope
		this._sideEffects = []
		this._customEpicChangedEventFields = {}
		this.doNothing = this
	}
	doNothing: ReducerResult<S, SC, SE> // TODO make not chainable, throw on mixed and variance
	sideEffect(effect: SE): ReducerResult<S, SC, SE> {
		this._sideEffects.push(effect)
		return this
	}
	// update reason will be taken only if updater returned updated state
	mapState(updater: S => S, updateReason?: string, customEpicChangedEventFields?: Object): ReducerResult<S, SC, SE> {
		const nextState = updater(this._state)

		if (nextState !== this._state) {
			if (updateReason) {
				this._updateReasons.push(updateReason)
			}
			if (customEpicChangedEventFields) {
				this._customEpicChangedEventFields = { ...this._customEpicChangedEventFields, ...customEpicChangedEventFields }
			}
		}
		this._state = nextState
		return this
	}
	mapScope(updater: SC => SC): ReducerResult<S, SC, SE> {
		const nextScope = updater(this._scope)

		this._scope = nextScope
		return this
	}
}

type MergeType<T, T1> = {| ...$Exact<T>, ...$Exact<T1> |}
function createUpdater<S: AnyValueType, SC: Object, DO: { [string]: { msgType: string } & Object }, ReactsTo: { [string]: { msgType: string } & Object }, E> ({ given, when, then }: {|
	given: DO,
	when: ReactsTo,
	then: ({| R: ReducerResult<S, SC, E>, changedActiveConditionsKeysMap: $ObjMap<MergeType<DO, ReactsTo>, typeof toTrueV>, scope: SC, sourceMsg: AnyMsgType, state: S, values: $Exact<$ObjMap<MergeType<DO, ReactsTo>, typeof extractConditionV>> |}) => ReducerResult<S, SC, E>,
|}): UpdaterType<S, SC, any, E> {
	let noActiveConditions = true
	const conditionKeysToConditionUpdaterKeys = []
	const compulsoryConditionsKeys = []
	const conditions = given ? ({ ...Object.keys(given).reduce((r, k: string) => ({ ...r, [k]: given[k].toPassive() }), {}), ...when }) : when

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

	if (given) {
		Object.keys(given).forEach(k => {
			if (when[k]) throw new Error(`given can not contain same key as reacts to: ${k}`)
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

function createSimpleUpdater<S: AnyValueType, SC: Object, V: *, E> (
	condition: V,
	then: ({| R: ReducerResult<S, SC, E>, value: $Call<typeof extractConditionV, V>, scope: SC, sourceMsg: AnyMsgType, state: S |}) => ReducerResult<S, SC, E>
): UpdaterType<S, SC, any, E> {
	return createUpdater({
		given: {},
		when: { value: condition },
		then: ({ values, state, scope, R, sourceMsg }) => then({ value: values.value, state, scope, R, sourceMsg }),
	})
}

class EffectManagerResultType<S> {
	_state: S
	_msgsToDispatch: Array<{| msg: AnyMsgType, broadcast?: bool |}>
	_promise: Promise<void>
	constructor(state: S) {
		this._state = state
		this._msgsToDispatch = []
		this.doNothing = this
	}
	doNothing: EffectManagerResultType<S>
	mapState(updater: S => S): EffectManagerResultType<S> {
		this._state = updater(this._state)
		return this
	}
	dispatchMsg(msg: AnyMsgType, broadcast?: true): EffectManagerResultType<S> {
		this._msgsToDispatch.push(({
			msg,
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
	destroyEffects,
	recreateEffects,
}: CreateEffectManagerPropsType<E, S, SC>): EffectManager<S, SC, E> {
	return {
		requestType,
		initialState,
		initialScope,
		onEffectRequest,
		destroyEffects,
		recreateEffects,
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
const MatchAnyMsgType: '*' = '*'

function validateUniqVcet(epics) {
	const allEpicsKeys = Object.keys(epics)
	const allVcet = allEpicsKeys.map(k => epics[k].vcet)
	const vcetsCountMap = allVcet.reduce((r, v) => {
		if (r[v]) {
			r[v]++
		} else {
			r[v] = 1
		}
		return r
	}, {})
	const duplicatedVcet = Object.keys(vcetsCountMap)
		.filter(v => vcetsCountMap[v] > 1)

	if (duplicatedVcet.length) {
		throw new Error(`duplicate vcets:\n${duplicatedVcet.map(v => `Epics ${allEpicsKeys.filter(k => epics[k].vcet === v).join(', ')} has same vcet ${v}`).join('\n')}`)
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
	u.updaterEpicStateChange !== undefined ? (u.updaterEpicStateChange === nothingChangedButObjectRecreatedWarn ? 'SW' : 'S') : '',
	u.updaterEpicScopeChange !== undefined ? (u.updaterEpicScopeChange === nothingChangedButObjectRecreatedWarn ? 'SCW' : 'SC') : '',
	u.updaterReqestedEffects !== undefined ? 'E' : '',
	u.error ? 'ERR' : '',
].filter(x => x).join(',')})`
const printEpicExecutionInfo = (epicExecutionInfo: EpicExecutionInfoType) => {
	const { updaters, epicKey } = epicExecutionInfo

	if (!updaters) return ''
	const result = updaters.filter(u => u.updaterEpicStateChange !== undefined || u.updaterEpicScopeChange !== undefined || u.updaterReqestedEffects !== undefined || u.error).map(printUpdater).join('')

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
		return `${trace.triggerMsg.type} does not have any effect`
	}
	const branches = executedEpicsOutputs.map(({ output, epicExecutionInfo }) => {
		const whitespace = new Array(whitespaceLength).join(' ')
		const isEpicVcet = trace.triggerMsg.type.indexOf('_VCET') !== -1
		const prevPrefix = `${whitespace}${level !== 0 && isEpicVcet ? '' : trace.triggerMsg.type}${level !== 0 ? '|':' '}=> `
		const prefix = `${prevPrefix}${output}`

		if (!epicExecutionInfo.childrenLayers) return prefix
		return [prefix, ...epicExecutionInfo.childrenLayers.map(childLayer => traceToString(childLayer, executedEpicsFilter, prevPrefix.length + 1, level + 1))]
	})

	return unnest/* ::<string> */(branches).filter(x => x).join('\n')
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

const findChangedConditions = (condition, value: Object, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate, sourceMsg, msgsChain) => {
	// $FlowFixMe condition.childrenConditionsWithSelectorOrGuard checked outside
	condition.childrenConditionsWithSelectorOrGuard.forEach((childCondition, childConditionIndex) => {
		const { valueKey, guard } = childCondition
		let newChildValue

		if (guard) {
			newChildValue = value
			try {
				if (guard && !guard(value)) return
			} catch (e) {
				const reproductionData: ConditionGuardCallReproductionDataType = {
					type: 'EPIC_CONDITION_GUARD_CALL',
					conditionValueKey: condition.valueKey,
					childConditionIndex,
					value,
					triggerMsg: msgsChain[0],
				}

				errorPayloadTransfer.putPayloadIntoError(e, { msgsChain, reproductionData, sourceMsg })
				throw e
			}
			conditionsValuesUpdate[valueKey] = value // used for next msg, will come in conditionsValues
			changedConditions.push(childCondition)
		} else {
			const _prevChildValue = prevConditionsValues[valueKey]
			const _prevChildValueIsUndefined = _prevChildValue === undefined
			const prevChildValue = _prevChildValueIsUndefined ? conditionsValues[valueKey] : _prevChildValue
			const _prevValue = prevConditionsValues[valueKey]
			const _prevValueIsUndefined = _prevValue === undefined
			const prevValue = _prevValueIsUndefined ? conditionsValues[condition.valueKey] : _prevValue

			try {
				newChildValue = childCondition.selector ? childCondition.selector(value, prevValue) : value[childCondition.selectorKey]
			} catch (e) {
				const reproductionData: ConditionSelectorCallReproductionDataType = {
					type: 'EPIC_CONDITION_SELECTOR_CALL',
					conditionValueKey: condition.valueKey,
					childConditionIndex,
					value,
					prevValue,
					triggerMsg: msgsChain[0],
				}

				errorPayloadTransfer.putPayloadIntoError(e, { msgsChain, reproductionData, sourceMsg })
				throw e
			}
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
		findChangedConditions(childCondition, newChildValue, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate, sourceMsg, msgsChain)
	})
}

const createEffectManagersByRequestType = (effectManagers): { [string]: EffectManager<*, *, *> } => Object.keys(effectManagers).reduce((m, emk) => {
	const effectManager = { ...effectManagers[emk] }

	effectManager.key = emk
	if (!m[effectManager.requestType]) {
		m[effectManager.requestType] = effectManager
	} else {
		throw new Error(`duplicate effect manager request type ${effectManagers[emk].requestType} for [${emk} and ${m[effectManager.requestType].key}]`)
	}
	return m
}, {})

const errorPayloadTransfer = {
	transferKey: 'payload',
	putPayloadIntoError: (error: Error, transferPayload: ErrorTransferPayloadType): void => {
		(error: any)[errorPayloadTransfer.transferKey] = transferPayload
	},
	readPayloadFromError: (error: Error): ErrorTransferPayloadType => (error: any)[errorPayloadTransfer.transferKey],
	cleanUpError: (error: Error) => delete (error: any)[errorPayloadTransfer.transferKey],
}

const nothingChangedButObjectRecreatedWarn = 'WARN: nothing changed, but new objects with same data was created'
const createExecuteMsg = ({
	trace,
	epicsMapByVcet,epicKeyByVcet,
	effectManagers,
	dispatch,
	rootConditionsByMsgType,
}: CreateExecuteMsgPropsType) => {
	const effectManagersByRequestType = createEffectManagersByRequestType(effectManagers)
	const orderOfEpicsVcet = Object.keys(epicsMapByVcet).reduce((r, vcet, index) => ({ ...r, [vcet]: index }), {})
	const vcetToSortValue = (vcet, currentMsgType, initiatedByEpic) => {
		if (vcet === currentMsgType || (initiatedByEpic && initiatedByEpic.type === vcet)) return -Infinity
		return orderOfEpicsVcet[vcet]
	}
	const getTraceUpdaters = ({ executionLevelTrace, subVcet }) => {
		let updaters
		const exsistingEpicTraceInfo = executionLevelTrace.executedEpics.find(t => t.epicVcet === subVcet)

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
				epicVcet: subVcet,
				epicKey: epicKeyByVcet[subVcet],
				updaters,
			})
		}
		return updaters
	}
	const getNextLevelTrace = ({ executionLevelTrace, subVcet, triggerMsg }) => {
		const executedEpic = executionLevelTrace.executedEpics.find(e => e.epicVcet === subVcet)

		if (!executedEpic) { throw new Error ('Unexpected trace error, please investigate how this happend.') } // should never happen, but flow can not check it
		if (!executedEpic.childrenLayers) {
			executedEpic.childrenLayers = []
		}
		const nextLevelTrace = { triggerMsg,
			executedEpics: [] }

		executedEpic.childrenLayers.push(nextLevelTrace)
		return nextLevelTrace
	}

	const isEpicMsg = (msg) => !!(msg.type && epicsMapByVcet[msg.type])

	function executeMsg({
		msgsChain,
		conditionsValues,
		prevConditionsValues,
		conditionsValuesUpdate,
		epicsState,
		epicsStateUpdate,
		effectManagersState,
		effectManagersStateUpdate,
		lastReducerValuesByEpicVcetUpdaterKey,
		messagesToSendOutside,
		batchedDispatchBatches,
		executionLevelTrace,
		level,
	}: ExecuteMsgPropsType): void {
		if (level > 100) {
			throw new Error(`Unresolvable cyclic chain detected, ${msgsChain.map(a => a.type).join(' => ')}`)
		}
		function getEpicStateUpdate(epicVcet) {
			let epicStateUpdate: EpicStateUpdateType = epicsStateUpdate[epicVcet]

			if (!epicStateUpdate) {
				epicStateUpdate = ({ updatersState: {} }: EpicStateUpdateType)
				epicsStateUpdate[epicVcet] = epicStateUpdate // eslint-disable-line no-param-reassign
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
		const sourceMsg = last(msgsChain)
		const msg = msgsChain[0]
		const rootCondition: AnyConditionType | void = rootConditionsByMsgType[msg.type]

		executeRootCondition(rootCondition)
		executeRootCondition(rootConditionsByMsgType[MatchAnyMsgType])
		function executeRootCondition(rootCondition) {
			if (!rootCondition) return
			const subscriptions: Array<SubscriptionType> = []

			conditionsValuesUpdate[rootCondition.valueKey] = msg
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

				findChangedConditions(rootCondition, msg, changedConditions, conditionsValues, prevConditionsValues, conditionsValuesUpdate, sourceMsg, msgsChain)
				changedConditions.forEach(cac => {
					const { subscriptions: cacSub } = cac

					if (cacSub) {
						subscriptions.push(...cacSub)
					}
				})
			}
			subscriptions.forEach(sub => {
				const { epicVcet, updaterKey, conditionKey } = sub
				const epicStateUpdate = getEpicStateUpdate(epicVcet)
				const epicState: EpicStateType = epicsState[epicVcet]
				const updaterState = epicState.updatersState[updaterKey]
				const updaterStateUpdate = getUpdaterStateUpdate(epicStateUpdate, updaterState, updaterKey)

				updaterStateUpdate.valuesFullfilled[conditionKey] = true
			})
			const activeSubs = subscriptions.filter(s => !s.passive)

			if (!activeSubs.length) return
			const epicSubs: EpicSubsType = activeSubs.reduce((r: EpicSubsType, sub) => {
				const { updaterKey, epicVcet } = sub
				let updatersByVcet: { [updaterKey: string]: Array<string> } | void = r[epicVcet]

				if (!updatersByVcet) {
					r[epicVcet] = updatersByVcet = {}
				}
				let conditionKeysByUpdaterKey: Array<string> | void = updatersByVcet[updaterKey]

				if (!conditionKeysByUpdaterKey) {
					updatersByVcet[updaterKey] = conditionKeysByUpdaterKey = []
				}
				conditionKeysByUpdaterKey.push(sub.conditionKey)
				return r
			}, {})
			const msgType: string = msg.type
			const { initiatedByEpic } = (msg: any)
			const epicVcetToBeExecuted = Object.keys(epicSubs).sort((vcet1: string, vcet2: string) => vcetToSortValue(vcet1, msgType, initiatedByEpic) - vcetToSortValue(vcet2, msgType, initiatedByEpic))

			epicVcetToBeExecuted.forEach((subVcet: string) => {
				// $FlowFixMe
				if (msg.targetEpicVcetMap && !msg.targetEpicVcetMap[subVcet]) {
					if (trace && executionLevelTrace) {
						executionLevelTrace.executedEpics.push({
							epicVcet: subVcet,
							epicKey: epicKeyByVcet[subVcet],
							epicNotExecutedBecause: `msg.targetEpicVcetMap ${Object.keys(msg.targetEpicVcetMap).join(', ')} does not contain ${subVcet}`,
						})
					}
					return
				}
				const updaterSubs = epicSubs[subVcet]
				const epic = epicsMapByVcet[subVcet]
				const epicState: EpicStateType = epicsState[subVcet]
				const updateReasons = []
				let customEpicChangedEventFields = {}
				const allEffects = []
				const updaterKeysThatChangedState = []
				const epicStateUpdate = getEpicStateUpdate(subVcet)

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
								subVcet }).push({
								updaterKey,
								changedActiveConditionsKeys,
								reducerNotExecutedBecause: `compulsory conditions keys ${updater.compulsoryConditionsKeys.filter(k => !valuesFullfilled[k]).join(', ')} are not fullifilled`,
							})
						}
						return
					}
					let atLeastOneValueIsDifferent = false
					const epicUpdaterKey = `${subVcet}.${updaterKey}`
					const lastReducerValues = lastReducerValuesByEpicVcetUpdaterKey[epicUpdaterKey]
					const getEpicStateMsg = (msg) => {
						const epicStateUpdate = (epicsStateUpdate[msg.type] || {}).state

						return ({ ...msg, payload: epicStateUpdate === undefined ? epicsState[msg.type].state : epicStateUpdate })
					}
					const thenValues: Object = updater.conditionKeysToConditionUpdaterKeys.reduce((v, [conditionKey, conditionUpdaterKey]) => {
						const shouldLookForDifferentValuesFromLastExecution = lastReducerValues && !atLeastOneValueIsDifferent

						const condition = updater.conditions[conditionUpdaterKey]
						const { isEpicCondition } = condition

						if (!valuesFullfilled[conditionUpdaterKey]) {
							if (shouldLookForDifferentValuesFromLastExecution && isEpicCondition && lastReducerValues[conditionUpdaterKey] !== undefined) {
								atLeastOneValueIsDifferent = true
							}
							return v
						}
						const valueUpdate = condition.msgType === MatchAnyMsgType ? (isEpicMsg(msg) ? getEpicStateMsg(msg) : msg) : conditionsValuesUpdate[conditionKey]
						const nextValue = v[conditionUpdaterKey] = valueUpdate === undefined ? conditionsValues[conditionKey] : valueUpdate

						if (shouldLookForDifferentValuesFromLastExecution) {
							if (isEpicCondition) {
								if (lastReducerValues[conditionUpdaterKey] !== nextValue) {
									atLeastOneValueIsDifferent = true
								}
							} else if (!condition.selector) { // This hack should be removed from epicsFlow lib (USED only in wsb)
								atLeastOneValueIsDifferent = true
							}
						}

						return v
					}, {}) // epic value can be changed multiple times for single user action, this ensures that epic subscribers are called only once if nothing is changed from last call

					if (lastReducerValues && !atLeastOneValueIsDifferent && changedActiveConditionsKeys.every(ck => updater.conditions[ck].msgType !== MatchAnyMsgType)) {
						if (trace && executionLevelTrace) {
							getTraceUpdaters({ executionLevelTrace,
								subVcet }).push({
								updaterKey,
								changedActiveConditionsKeys,
								thenValues,
								reducerNotExecutedBecause: 'It was called before in execution chain and values not changed since then',
							})
						}
						return
					}
					lastReducerValuesByEpicVcetUpdaterKey[epicUpdaterKey] = thenValues
					const prevState = epicStateUpdate.state === undefined ? epicState.state : epicStateUpdate.state
					const prevScope = epicStateUpdate.scope === undefined ? epicState.scope : epicStateUpdate.scope

					if (__DEV__) {
						deepFreeze(thenValues)
						deepFreeze(prevState)
						deepFreeze(prevScope)
					}

					let result

					try {
						// TODO flow - mark everything passed inside then as $ReadOnly
						result = updater.then({
							values: thenValues,
							state: prevState,
							scope: prevScope,
							sourceMsg,
							changedActiveConditionsKeysMap: changedActiveConditionsKeys.reduce((m, k) => { m[k] = true; return m }, {}),
							R: new ReducerResult(prevState, prevScope),
						})
					} catch (e) {
						if (trace && executionLevelTrace) {
							const updaters = getTraceUpdaters({ executionLevelTrace, subVcet })
							const updaterTraceInfo: EpicUpdaterExecutionInfoType = {
								updaterKey,
								changedActiveConditionsKeys,
								error: e,
							}

							updaterTraceInfo.thenValues = thenValues

							updaters.push(updaterTraceInfo)
						}
						const reproductionData: ThenCallReproductionDataType = {
							type: 'EPIC_THEN_CALL',
							epicVcet: subVcet,
							updaterKey,
							updaterValues: thenValues,
							epicState: prevState,
							epicScope: prevScope,
							sourceMsg,
							changedActiveConditionsKeys,
						}

						errorPayloadTransfer.putPayloadIntoError(e, { msgsChain, reproductionData, sourceMsg })

						throw e
					}

					if (__DEV__) {
						if (typeof result._state === 'function') {
							throw Error(`${subVcet}[${updaterKey}] Function returned as new state of epic`)
						}
						if (typeof result._scope === 'function') {
							throw Error(`${subVcet}[${updaterKey}] Function returned as new scope of epic`)
						}
					}

					const stateUpdated = prevState !== result._state
					const scopeUpdated = prevScope !== result._scope

					if (trace && executionLevelTrace) {
						const updaters = getTraceUpdaters({ executionLevelTrace, subVcet })
						const updaterTraceInfo: EpicUpdaterExecutionInfoType = {
							updaterKey,
							changedActiveConditionsKeys,
						}

						if (!stateUpdated && !scopeUpdated && !result._sideEffects.length) {
							updaterTraceInfo.didNothing = true
						} else {
							updaterTraceInfo.thenValues = thenValues
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
						customEpicChangedEventFields = { ...customEpicChangedEventFields, ...result._customEpicChangedEventFields }
					// TODO is this epic has subs to it self, execute them immideately, skipping after update
					}
					const { _sideEffects } = result

					if (_sideEffects.length) {
						_sideEffects.forEach(e => {
							if (e.type === dispatchBatchedMsgsEffectType) {
								batchedDispatchBatches.push(...e.batches)
							} else {
								allEffects.push(e)
							}
						})
					}

					if (__DEV__) {
						deepFreeze(result._state)
						deepFreeze(result._scope)
					}
				})
				if (updaterKeysThatChangedState.length) {
					const epicChangedEvent: EpicStateChangedEventType = {
						type: subVcet,
						payload: epicStateUpdate.state,
						...customEpicChangedEventFields,
					}

					msgsChain.forEach(msg => {
						if (msg.type === subVcet) {
							const urs = (msg: any).updateReasons

							if (urs) {
								updateReasons.push(...urs)
							}
						}
					})

					epicChangedEvent.updateReasons = updateReasons
					executeMsg({
						msgsChain: [epicChangedEvent, ...msgsChain],
						conditionsValues,
						prevConditionsValues,
						conditionsValuesUpdate,
						epicsState,
						epicsStateUpdate,
						effectManagersState,
						effectManagersStateUpdate,
						lastReducerValuesByEpicVcetUpdaterKey,
						messagesToSendOutside,
						batchedDispatchBatches,
						executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
							subVcet,
							triggerMsg: epicChangedEvent,
						}) : undefined,
						level: level + 1,
					})
				}
				if (allEffects.length) {
					allEffects.forEach(e => {
						const effectRequestType = e.type

						switch (effectRequestType) {
						case dispatchMsgEffectType: {
							// we dispatching msg immediately as it may update state of same epic (e1) that requested msg dispatch
							// this way if some other epic(e2) has subscription to e1, e2 will we called only once, with latest updated epic state
							const dispatchMsgEffect: DispatchMsgEffectType = (e: any)
							const msgToDispatch: Object = { ...dispatchMsgEffect.msg }

							msgToDispatch.initiatedByEpic = { updaterKey: e.updaterKey, type: subVcet }
							executeMsg({
								msgsChain: [dispatchMsgEffect.msg, ...msgsChain],
								conditionsValues,
								prevConditionsValues,
								conditionsValuesUpdate,
								epicsState,
								epicsStateUpdate,
								effectManagersState,
								effectManagersStateUpdate,
								lastReducerValuesByEpicVcetUpdaterKey,
								messagesToSendOutside,
								batchedDispatchBatches,
								executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
									subVcet,
									triggerMsg: dispatchMsgEffect.msg }) : undefined,
								level: level + 1,
							})
							break
						}
						case sendMsgOutsideEpicsEffectType: {
							const sendMsgOusideOfEpicsEffect: SendMsgOutsideEpicsEffectType = (e: any)

							messagesToSendOutside.push(sendMsgOusideOfEpicsEffect.msg)
							break
						}
						default: {
							const effectManager: EffectManager<*, *, *> = effectManagersByRequestType[effectRequestType]
							const effectManagerStateUpdate = effectManagersStateUpdate[effectRequestType]
							const effectManagerState = effectManagersState[effectRequestType]
							const state = (effectManagerStateUpdate && effectManagerStateUpdate.state) ? effectManagerStateUpdate.state : effectManagerState.state
							let isSyncDispatch = true
							const result = effectManager.onEffectRequest({
								effect: e,
								requesterEpicVcet: subVcet,
								state,
								scope: effectManagerState.scope,
								dispatch() {
									if (isSyncDispatch) {
										// Effect managers replying to requirest consitently in async manner, to simplify trace and reasoning
										setTimeout(() => dispatch(...arguments), 0)
									} else {
										dispatch(...arguments)
									}
								},
								R: new EffectManagerResultType(state),
							})

							isSyncDispatch = false

							if (result._state !== state) {
								effectManagersStateUpdate[effectRequestType] = { ...effectManagerStateUpdate, state: result._state }
							}

							result._msgsToDispatch.forEach(({ msg, broadcast }) => {
								if (!broadcast) {
									(msg: any).targetEpicVcetMap = { [subVcet]: true }
								}
								executeMsg({
									msgsChain: [msg, ...msgsChain],
									conditionsValues,
									prevConditionsValues,
									conditionsValuesUpdate,
									epicsState,
									epicsStateUpdate,
									effectManagersState,
									effectManagersStateUpdate,
									lastReducerValuesByEpicVcetUpdaterKey,
									messagesToSendOutside,
									batchedDispatchBatches,
									executionLevelTrace: trace && executionLevelTrace ? getNextLevelTrace({ executionLevelTrace,
										subVcet,
										triggerMsg: msg,
									}) : undefined,
									level: level + 1,
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
	}
	return executeMsg
}

const printExecuteMsgExeption = ({ trace, executionLevelTrace, msg, e }) => {
	if (trace) {
		trace(executionLevelTrace)
	}
	// eslint-disable-next-line no-console
	console.error(`error during executing msg ${msg.type}`, '\nmsg: ', msg, '\ne: ', e, '\nexecutionLevelTrace: ', executionLevelTrace)
}

function computeInitialStates({ epicsArr, warn, executeMsg, trace, onError }) {
	const epicsState: EpicsStateType = epicsArr.reduce((state, epic) => {
		return {
			...state,
			[epic.vcet]: {
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
			if (epicsStateUpdate[epic.vcet] && epicsStateUpdate[epic.vcet].state) {
				return epicsState
			}
			const messagesToSendOutside = []
			const msg = { type: epic.vcet, payload: epic.initialState }
			const batchedDispatchBatches = []
			const executionLevelTrace = { triggerMsg: msg, executedEpics: [] }

			try {
				executeMsg({
					msgsChain: [(msg: EpicStateChangedEventType)],
					conditionsValues,
					prevConditionsValues: {},
					conditionsValuesUpdate,
					epicsState,
					epicsStateUpdate,
					effectManagersState: {},
					effectManagersStateUpdate,
					lastReducerValuesByEpicVcetUpdaterKey: {},
					messagesToSendOutside,
					batchedDispatchBatches,
					executionLevelTrace,
					level: 0,
				})
			} catch (e) {
				printExecuteMsgExeption({ trace, executionLevelTrace, msg, e })
				onError(e)
				throw e
			}
			if (trace) {
				trace(executionLevelTrace)
			}
			if (messagesToSendOutside.length) {
				const msg = 'epics should not send messages outside on initializing default state. use storeCreatedEvent.condition instead.'

				warn(msg, messagesToSendOutside)
				throw new Error(msg)
			}
			if (batchedDispatchBatches.length) {
				const msg = 'epics should not then batched dispatch on initializing default state. use storeCreatedEvent.condition instead.'

				warn(msg, batchedDispatchBatches)
				throw new Error(msg)
			}
			if (Object.keys(effectManagersStateUpdate).length) {
				const msg = 'effect managers should not be toched during intial state initialization. use storeCreatedEvent.condition instead.'

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
const createComputeOutsideState = ({ epicsVcetToStateKeyMap }) => (state) => Object.keys(state).reduce((s, vcet) => {
	s[epicsVcetToStateKeyMap[vcet]] = state[vcet].state
	return s
}, {})

function findRootCondition(condition: AnyConditionType): AnyConditionType {
	if (condition.parentCondition) {
		return findRootCondition(condition.parentCondition)
	}
	return condition
}

function processConditionsSubscriptions(epics) {
	const rootConditionsByMsgType = {}

	Object.keys(epics).forEach(epicKey => {
		const epic = epics[epicKey]

		Object.keys(epic.updaters).forEach(updaterKey => {
			const updater = epic.updaters[updaterKey]

			Object.keys(updater.conditions).forEach(conditionKey => {
				const condition: AnyConditionType = updater.conditions[conditionKey]
				const rootCondition = findRootCondition(condition)

				if (!rootConditionsByMsgType[rootCondition.msgType]) {
					rootConditionsByMsgType[rootCondition.msgType] = rootCondition
				}

				if (!condition.subscriptions) {
					condition.subscriptions = []
				}
				condition.subscriptions.push({
					epicVcet: epic.vcet,
					updaterKey,
					conditionKey,
					passive: condition.passive,
				})
			})
		})
	})

	return rootConditionsByMsgType
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

				if (epicsArray.some(e => e.vcet === condition.msgType) && !condition.isEpicCondition) {
					throw new Error(`${epicKey}.${updaterKey}.${conditionKey} has epic valueChangedEventType: ${condition.msgType}, but was created as non epic condition`)
				}
				if (!epicsArray.some(e => e.vcet === condition.msgType) && condition.isEpicCondition) {
					throw new Error(`${epicKey}.${updaterKey}.${conditionKey} was created as epic condition, but there is no epic registered with valueChangedEventType: ${condition.msgType}`)
				}
			})
		})
	})
}
type CreateConditionType = <V: Object>(msgType: string) => Condition<V>
const globalRootConditionsByMsgType = {}
const globalSelectorsInUse = []
const globalGuardsInUse = []

function _createCondition({
	msgType,
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
		valueKey: `${parentCondition ? parentCondition.valueKey : msgType}${selectorKey ? `.${selectorKey}` : ''}${selector ? (`.$$selector${ globalSelectorsInUse.indexOf(selector)}`) : ''}${guard ? `.$$guard${ globalGuardsInUse.indexOf(guard)}` : ''}`,
		parentCondition,
		msgType,
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
		globalRootConditionsByMsgType[msgType] = condition
	}

	condition.match = createConditionMatcher(condition)
	return condition
}
function createCondition<V: Object> (msgType: string, isEpicCondition?: bool = false): Condition<V> {
	if (globalRootConditionsByMsgType[msgType]) {
		return globalRootConditionsByMsgType[msgType]
	}
	return (_createCondition({
		msgType,
		passive: false,
		optional: false,
		resetConditionsByKeyKeys: null,
		resetConditionsByKeyAfterReducerCallKeys: null,
		sealed: false,
		isEpicCondition,
	}, true): any)
}
function createEpicConditionReceiveFullMsg<State>(vcet: string): Condition<EpicValueChangedEventType<State>> {
	return createCondition/* ::<EpicValueChangedEventType<State>> */(vcet, true)
}
function createEpicCondition<State>(vcet: string): Condition<State> {
	return createEpicConditionReceiveFullMsg(vcet).withSelectorKey('payload')
}
function createEpicWithScope<S, SC, E, PC>({ vcet, updaters, initialState, initialScope, pluginConfig }: CreateEpicWithScopePropsType<S, SC, E, PC>): EpicType<S, SC, E, PC> {
	const c = createEpicCondition/* ::<S> */(vcet)

	return ({
		vcet,
		updaters,
		initialState,
		initialScope,
		c,
		condition: c,
		pluginConfig,
	})
}
function createEpic<S, E, PC>({ vcet, updaters, initialState, pluginConfig }: CreateEpicPropsType<S, E, PC>): EpicType<S, void, E, PC> {
	return createEpicWithScope({
		vcet,
		updaters,
		initialState,
		initialScope: undefined,
		pluginConfig,
	})
}

type ReduxReducerType<S> = (S | void, AnyMsgType) => S

function getReducerInitialState<S>(reducer: ReduxReducerType<S>): S {
	return reducer(undefined, { type: '@INIT' })
}
const autoGenerateVcet = '@auto_generate_vcet'

function createEpicFromReduxReducer<S>(reducer: ReduxReducerType<S>): EpicType<S, void, void, void> {
	return createEpic({
		vcet: autoGenerateVcet,
		updaters: {
			redux: createUpdater({
				given: {},
				when: { action: matchAnyMsgCondition },
				then: ({ values: { action }, R }) => R.mapState(state => reducer(state, action)),
			}),
		},
		initialState: getReducerInitialState(reducer),
	})
}

const matchAnyMsgCondition: Condition<Object> = createCondition(MatchAnyMsgType)

const createPluginStateKey = (key: string) => `plugin/${key}`

function createEpicsSubStoresByVcet(epics: { [string]: EpicType<*, *, *, *> }): { [epicKey: string]: EpicsStoreType<any> } {
	return getObjectKeys(epics).reduce((result, epicKey) => {
		const epic = epics[epicKey]

		result[epic.vcet] = createStore({ epics: { [epicKey]: epic }, isSubStore: true })
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
	debug?: bool | {| devTools?: { config: DevToolsConfigType }, trace?: Function, warn?: Function |},
	effectManagers?: { [string]: EffectManager<*, *, *> },
	epics: Epics,
	plugins?: { [string]: PluginType },
	isSubStore?: true,
|}

const unknownMsg = { type: '@UNKNOWN' }

function createStore<Epics: { [string]: EpicType<*, *, *, *> }> ({
	epics,
	effectManagers = {},
	plugins = {},
	debug,
	isSubStore,
}: CreateStorePropsType<Epics>, hotReload?: true): EpicsStoreType<Epics> {
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

	function onError(error) {
		const { reproductionData, msgsChain, sourceMsg } = errorPayloadTransfer.readPayloadFromError(error)
			|| { reproductionData: { type: 'EPIC_UNEXPECTED_ERROR' }, msgsChain: [unknownMsg], sourceMsg: unknownMsg }

		errorPayloadTransfer.cleanUpError(error)

		const errorData: ErrorDataType = { error, reproductionData, msgsChain, sourceMsg }

		onErrorSubscribers.forEach(sub => sub(errorData))
	}

	function dispatch(msg: AnyMsgType, meta?: MetaType = ({}: any)) {
		onDispatchSubscribers.forEach(sub => sub(msg))

		msg = { ...msg } // eslint-disable-line no-param-reassign
		const messagesToSendOutside = []
		const epicsStateUpdate = {}
		const effectManagersStateUpdate = {}

		if (meta.targetEpicVcet) {
			(msg: any).targetEpicVcetMap = meta.targetEpicVcet.reduce(
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

		if (msg.type === effectPromiseCompleteAT) {
			const { effect, error, effectRequestType } = ((msg: any): {| effect: {||}, effectRequestType: string, error: Error |})
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
			const executionLevelTrace = { triggerMsg: msg, executedEpics: [] }

			try {
				executeMsg({
					msgsChain: [msg],
					conditionsValues: serviceState.conditions,
					prevConditionsValues: {},
					conditionsValuesUpdate,
					epicsState: serviceState.epics,
					epicsStateUpdate,
					effectManagersState: serviceState.effectManagers,
					effectManagersStateUpdate,
					lastReducerValuesByEpicVcetUpdaterKey: {},
					messagesToSendOutside,
					batchedDispatchBatches,
					executionLevelTrace,
					level: 0,
				})
			} catch (e) {
				printExecuteMsgExeption({ trace, executionLevelTrace, msg, e })
				onError(e)
				throw e
			}
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
				messagesToSendOutside.forEach(m => outMsgSubscribers.forEach(sub => sub(m)))
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

				Object.keys(epicsStateUpdate).forEach(vcet => {
					if (atLeastOneChange) return
					const epicState = serviceState.epics[vcet]
					const epicStateUpdate = epicsStateUpdate[vcet]

					if (
						(epicStateUpdate.state !== undefined && !deepEqual(epicState.state, epicStateUpdate.state))
						|| (epicStateUpdate.scope !== undefined && !deepEqual(epicState.scope, epicStateUpdate.scope))
						|| (epicStateUpdate.updatersState !== undefined && !deepEqual(epicState.updatersState, epicStateUpdate.updatersState))
					) {
						atLeastOneChange = true
					}
				})
				if (atLeastOneChange) {
					devTools.send(msg, nextServiceState)
				}
			}
			serviceState = nextServiceState

			if (batchedDispatchBatches.length) {
				batchDispatchIsInProgress = true

				let atLeastOneChange = false

				batchedDispatchBatches.forEach(({ msgs, targetEpicVcet }) => {
					const epicSubStore = epicsSubStoresByVcet[targetEpicVcet]

					epicSubStore._setState({
						epics: { [targetEpicVcet]: serviceState.epics[targetEpicVcet] },
						conditions: {},
						effectManagers: {},
					})
					msgs.forEach(a => epicSubStore.dispatch(a))

					const currentEpicState = serviceState.epics[targetEpicVcet]
					const newEpicStateState = epicSubStore.getState()[targetEpicVcet]

					dispatch({ type: targetEpicVcet, payload: newEpicStateState })

					if (currentEpicState.state !== newEpicStateState) {
						serviceState.epics = { ...serviceState.epics, [targetEpicVcet]: { ...currentEpicState, state: newEpicStateState } }
						atLeastOneChange = true
					}
				})
				if (atLeastOneChange || updatedEpicsState) {
					onEpicsStateChange(serviceState.epics)
				}

				messagesAccumulatedDuringBatchDispatch.forEach(m => outMsgSubscribers.forEach(sub => sub(m)))
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
	getObjectKeys(epics).forEach(epicKey => {
		const epic = epics[epicKey]

		if (epic.vcet === autoGenerateVcet) {
			epic.vcet = `${epicKey}_VCET`
		}
	})
	const epicsSubStoresByVcet = isSubStore ? {} : createEpicsSubStoresByVcet(epics)

	if (!isSubStore) {
		validateUniqVcet(epics)
		validateResetConditions(epics)
		validateEpicConditions(epics)
	}

	const rootConditionsByMsgType = processConditionsSubscriptions(epics)

	if (__DEV__) {
		deepFreeze(epics)
		deepFreeze(effectManagers)
		deepFreeze(plugins)
	}
	const epicKeyByVcet = getObjectKeys(epics).reduce((m, epicKey) => ({ ...m, [epics[epicKey].vcet]: epicKey }), {})
	const epicsArr = values(epics)
	const epicsMapByVcet = values(epics).reduce((a, e) => ({ ...a, [e.vcet]: e }), {})
	const executeMsg = createExecuteMsg({
		trace,
		epicsMapByVcet,
		epicKeyByVcet,
		warn,
		effectManagers,
		dispatch,
		rootConditionsByMsgType,
	})
	const epicsVcetToStateKeyMap = Object.keys(epics).reduce((r, epicStateKey) => {
		r[epics[epicStateKey].vcet] = epicStateKey
		return r
	}, {})
	const computeOutsideState = createComputeOutsideState({ epicsVcetToStateKeyMap })
	const { initialEpicsState, initialCondtionsValues } = computeInitialStates({
		epicsArr,
		warn,
		executeMsg,
		trace,
		onError,
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
	let stateChangedSubscribers = []
	let onDispatchSubscribers = []
	let onErrorSubscribers = []

	const outMsgSubscribers = []

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
	if (!isSubStore && !hotReload) {
		dispatch(storeCreatedEvent.create())
	}

	let storeReplacement

	const initialState = serviceState

	const doForEachEffectManager = (fn: ({ effectManager: EffectManager<*, *, *>, state: any, scope: any }) => void) => {
		const effectManagersByRequestType = createEffectManagersByRequestType(effectManagers)

		Object.keys(effectManagersByRequestType).forEach(effectRequestType => {
			const effectManager: EffectManager<*, *, *> = effectManagersByRequestType[effectRequestType]
			const { state, scope } = serviceState.effectManagers[effectRequestType]

			fn({ effectManager, state, scope })
		})
	}

	return {
		_getServiceState: () => {
			if (storeReplacement) return storeReplacement._getServiceState()
			return serviceState
		},
		_getNextStateForMsgWithoutUpdatingStoreState: (msg) => {
			if (storeReplacement) {
				return storeReplacement._getNextStateForMsgWithoutUpdatingStoreState(msg)
			}
			const epicsStateUpdate = {}
			const conditionsValuesUpdate = {}
			const effectManagersStateUpdate = {}

			executeMsg({
				msgsChain: [msg],
				conditionsValues: serviceState.conditions,
				prevConditionsValues: {},
				conditionsValuesUpdate,
				epicsState: serviceState.epics,
				epicsStateUpdate,
				effectManagersState: serviceState.effectManagers,
				effectManagersStateUpdate,
				lastReducerValuesByEpicVcetUpdaterKey: {},
				messagesToSendOutside: [],
				batchedDispatchBatches: [],
				executionLevelTrace: undefined,
				level: 0,
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
			} else {
				serviceState = _serviceState
				outsideState = computeOutsideState(serviceState.epics)
			}
		},
		// may be used to trigger render exception
		_setOutsideState(_outsideState) {
			if (storeReplacement) {
				storeReplacement._setOutsideState(_outsideState)
			} else {
				outsideState = _outsideState
			}
		},
		destroyEffects: () => {
			if (storeReplacement) {
				storeReplacement.destroyEffects()
			} else {
				doForEachEffectManager(({ effectManager, state, scope }) => {
					effectManager.destroyEffects({ state, scope })
				})
			}
		},
		recreateEffects: () => {
			if (storeReplacement) {
				storeReplacement.recreateEffects()
			} else {
				doForEachEffectManager(({ effectManager, state, scope }) => {
					effectManager.recreateEffects({ state, scope })
				})
			}
		},

		replaceConfig: (creaceEpicsStoreConfig) => {
			const currentState: any = storeReplacement ? storeReplacement._getServiceState() : serviceState

			storeReplacement = createStore(creaceEpicsStoreConfig, true)
			storeReplacement._setState(currentState)
			stateChangedSubscribers.forEach(sub => storeReplacement.subscribe(sub))
			outMsgSubscribers.forEach(sub => storeReplacement.subscribeOutMsg(sub))
			// TODO dispose side effects
		},
		resetToInitialState: () => {
			serviceState = initialState
		},
		dispatch: (a: AnyMsgType, meta?: MetaType) => {
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
		subscribe: subscriber => {
			if (storeReplacement) {
				storeReplacement.subscribe(subscriber)
			}
			stateChangedSubscribers.push(subscriber)
			return () => {
				stateChangedSubscribers = stateChangedSubscribers.filter(s => s !== subscriber)
			}
		},
		subscribeOnDispatch: subscriber => {
			if (storeReplacement) {
				storeReplacement.subscribeOnDispatch(subscriber)
			}
			onDispatchSubscribers.push(subscriber)
			return () => { onDispatchSubscribers = onDispatchSubscribers.filter(sub => sub !== subscriber) }
		},
		subscribeOnError: subscriber => {
			if (storeReplacement) {
				storeReplacement.subscribeOnError(subscriber)
			}
			onErrorSubscribers.push(subscriber)
			return () => { onErrorSubscribers = onErrorSubscribers.filter(sub => sub !== subscriber) }
		},
		// subscribe to messages that can be send from epics to 3rd party
		subscribeOutMsg: sub => {
			if (storeReplacement) {
				storeReplacement.subscribeOutMsg(sub)
			}
			outMsgSubscribers.push(sub)
		},
		warn,
	}
}

function makeMsg<MsgExtraFields>(msgType: string): {|
	create: MsgExtraFields => {| ...MsgExtraFields, type: string |},
	condition: Condition<{| ...MsgExtraFields, type: string |}>,
	match: AnyMsgType => {| ...MsgExtraFields, type: string |} | void,
	type: string,
|} {
	const create = extraFields => ({ type: msgType, ...extraFields })
	const condition = createCondition(msgType)

	return ({
		create,
		condition,
		match: createConditionMatcher(condition),
		type: msgType,
	})
}

function makeSimpleMsg(msgType: string): {|
	create: () => {| type: string |},
	condition: Condition<{| type: string |}>,
	match: AnyMsgType => {| type: string |} | void,
	type: string,
|} {
	const create = () => ({ type: msgType })
	const condition = createCondition(msgType)

	return ({
		create,
		condition,
		match: createConditionMatcher(condition),
		type: msgType,
	})
}

const makeSimpleEvent = makeSimpleMsg
const makeEvent = makeMsg
const makeSimpleCommand = makeSimpleMsg
const makeCommand = makeMsg

const storeCreatedEvent = makeSimpleEvent('@STORE_CREATED')

export type { // eslint-disable-line import/group-exports
	CreateStorePropsType,
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
	AnyMsgType,
	EpicUpdaterExecutionInfoType,
	EpicExecutionInfoType,
	ExecutionLevelInfoType,
	ErrorDataType,
	ReproductionDataType,
}

export { // eslint-disable-line import/group-exports
	unnest,
	makeSimpleEvent,
	makeEvent,
	makeSimpleCommand,
	makeCommand,
	createEpic,
	createEpicFromReduxReducer,
	createEpicWithScope,
	matchAnyMsgCondition,
	createStore,
	dispatchMsgEffectCreator,
	daEC,
	dispatchBatchedMsgsEffectCreator,
	sendMsgOutsideEpicsEffectCreator,
	createCondition,
	createEpicCondition,
	createUpdater,
	createSimpleUpdater,
	createEffectManager,
	deepCopy,
	deepEqual,
	traceToString,
	storeCreatedEvent,
	createPluginStateKey,
	getObjectKeys,
	createConditionMatcher,
}
