// @flow
import { SaveStorageContentCmd, SaveStorageContentFailureEvent, SaveStorageContentSuccessEvent } from './storageMiddlewareMsgs'
import { type DispatchType, type AnyMsgType } from '../../../../../src/epics'

const storageMiddleware = (store: { dispatch: DispatchType }) => (next: DispatchType) => (action: AnyMsgType) => {
	const saveStorageContentCmd = SaveStorageContentCmd.match(action)

	if (saveStorageContentCmd) {
		try {
			localStorage.setItem(saveStorageContentCmd.key, JSON.stringify(saveStorageContentCmd.storageData))
			store.dispatch(SaveStorageContentSuccessEvent.create())
		} catch (e) {
			store.dispatch(SaveStorageContentFailureEvent.create())
		}
	}

	return next(action)
}

export {
	storageMiddleware,
}
