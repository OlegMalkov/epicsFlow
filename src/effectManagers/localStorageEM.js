// @flow strict

import {
	makeEffectManager,
	EMRT,
	type AnyValueType,
	makeSACAC,
	makeACAC,
	getObjectKeys,
} from '../epics'

opaque type LocalStorageCommandType =
	| {| type: 'CHECK' |}
	| {| key: string, type: 'GET_ITEM' |}
	| {| keys: Array<string>, type: 'GET_ITEMS' |}
	| {| key: string, type: 'SET_ITEM', value: AnyValueType |}
	| {| items: { [key: string]: AnyValueType }, type: 'SET_ITEMS' |}
	| {| key: string, type: 'REMOVE_ITEM' |}
	| {| keys: Array<string>, type: 'REMOVE_ITEMS' |}
	| {| type: 'GET_KEYS' |}
	| {| type: 'CLEAR' |}

opaque type LocalStorageEffectType = {| cmd: LocalStorageCommandType, type: typeof requestType |}

const requestType: 'local_storage_effect' = 'local_storage_effect'
const localStorageCheckQuotaExceededEC = (): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'CHECK' } })
const localStorageGetItemEC = (key: string): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'GET_ITEM', key } })
const localStorageGetItemsEC = (keys: Array<string>): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'GET_ITEMS', keys } })
const localStorageSetItemEC = (key: string, value: AnyValueType): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'SET_ITEM', key, value } })
const localStorageSetItemsEC = (items: { [key: string]: AnyValueType }): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'SET_ITEMS', items } })
const localStorageRemoveItemEC = (key: string): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'REMOVE_ITEM', key } })
const localStorageRemoveItemsEC = (keys: Array<string>): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'REMOVE_ITEMS', keys } })
const localStorageGetKeysEC = (): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'GET_KEYS' } })
const localStorageClearEC = (): LocalStorageEffectType => ({ type: requestType, cmd: { type: 'CLEAR' } })

const localStorageUnavailableResult = makeSACAC('LOCAL_STORAGE_UNAVAILABLE_RESULT')
const localStorageQuotaExceededResult = makeSACAC('LOCAL_STORAGE_QUOTA_EXCEEDED_RESULT')
const localStorageGetItemResult = makeACAC<{| value: ?string |}>('LOCAL_STORAGE_GET_ITEM_RESULT')
const localStorageGetItemsResult = makeACAC<{| values: { [key: string]: ?string } |}>('LOCAL_STORAGE_GET_ITEMS_RESULT')
const localStorageGetKeysResult = makeACAC<{| keys: Array<string> |}>('LOCAL_STORAGE_GET_KEYS_RESULT')

function isQuotaExceededError(e) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_availability
	// $FlowFixMe
	return e instanceof DOMException && (
		e.code === 22 ||
		e.code === 1014 ||
		e.name === 'QuotaExceededError' ||
		e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
		localStorage.length !== 0
}

function getLocalStorageStatus() {
	if (typeof localStorage !== 'undefined') {
		const testKey = '_@$testkey@#_'

		try {
			localStorage.setItem(testKey, testKey)
			if (localStorage.getItem(testKey) === testKey) {
				localStorage.removeItem(testKey)
				return { available: true, quotaExceeded: false }
			}
		} catch (e) {
			if (isQuotaExceededError(e)) return { available: true, quotaExceeded: true }
		}
	}
	return { available: false, quotaExceeded: false }
}

const localStorageEM = makeEffectManager<LocalStorageEffectType, {| available: bool, quotaExceeded: bool |}, null>({
	requestType,
	initialState: getLocalStorageStatus(),
	initialScope: null,
	onEffectRequest: ({ effect, requesterEpicVat, state, dispatch }) => {
		const dispatchBackToRequester = (action) => dispatch(action, { targetEpicVats: [requesterEpicVat] })

		if (!state.available) {
			dispatchBackToRequester(localStorageUnavailableResult.ac())
			return EMRT.doNothing
		}

		switch (effect.cmd.type) {
		case 'CHECK':
			if (state.quotaExceeded) {
				dispatchBackToRequester(localStorageQuotaExceededResult.ac())
				return EMRT.doNothing
			}
			break
		case 'GET_ITEM':
			dispatchBackToRequester(localStorageGetItemResult.ac({ value: localStorage.getItem(effect.cmd.key) }))
			break
		case 'GET_ITEMS': {
			const { keys } = effect.cmd

			dispatchBackToRequester(localStorageGetItemsResult.ac({
				values: keys.reduce((acc, key) => {
					acc[key] = localStorage.getItem(key)
					return acc
				}, {}),
			}))
			break
		}
		case 'SET_ITEM':
			try {
				const { key, value } = effect.cmd

				localStorage.setItem(key, JSON.stringify(value))
			} catch (e) {
				return EMRT.updateState({ ...state, quotaExceeded: true })
			}
			break
		case 'SET_ITEMS': {
			const { items } = effect.cmd
			const itemsKeys = getObjectKeys(items)

			try {
				itemsKeys.forEach(key => localStorage.setItem(key, JSON.stringify(items[key])))
			} catch (e) {
				itemsKeys.forEach(key => localStorage.removeItem(key))
				dispatchBackToRequester(localStorageQuotaExceededResult.ac())
				return EMRT.updateState({ ...state, quotaExceeded: true })
			}
			break
		}
		case 'REMOVE_ITEM':
			localStorage.removeItem(effect.cmd.key)
			return EMRT.updateState({ ...state, quotaExceeded: false })
		case 'REMOVE_ITEMS':
			effect.cmd.keys.forEach(key => localStorage.removeItem(key))
			return EMRT.updateState({ ...state, quotaExceeded: false })
		case 'CLEAR':
			localStorage.clear()
			return EMRT.updateState({ ...state, quotaExceeded: false })
		case 'GET_KEYS':
			dispatchBackToRequester(localStorageGetKeysResult.ac({ keys: Object.keys(localStorage) }))
			break
		default:
			// eslint-disable-next-line no-unused-expressions
			(effect.cmd.type: empty)
		}
		return EMRT.doNothing
	},
})

export type { // eslint-disable-line import/group-exports
	LocalStorageEffectType,
}

export { // eslint-disable-line import/group-exports
	localStorageEM,

	localStorageCheckQuotaExceededEC,
	localStorageGetItemEC,
	localStorageGetItemsEC,
	localStorageSetItemEC,
	localStorageSetItemsEC,
	localStorageRemoveItemEC,
	localStorageRemoveItemsEC,
	localStorageGetKeysEC,
	localStorageClearEC,

	localStorageUnavailableResult,
	localStorageQuotaExceededResult,
	localStorageGetItemResult,
	localStorageGetItemsResult,
	localStorageGetKeysResult,
}
