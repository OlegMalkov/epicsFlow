// @flow
import { type DispatchType, type AnyMsgType } from '../../../../../src/epics'
import { DispatchCmdWithDelayCmd } from './dispatchActionWithDelayMiddlewareMsgs'

const dispatchActionWithDelayMiddleware = (store: { dispatch: DispatchType }) => {
	const timeoutIdByKeyMap = {}
	// it would be nice to recover timeouts during time traveling or remote state reproduction
	// it would be nice to have promises for pending side effects to not terminate tests until they are resolved and fail the test if something is unresolved withing given time

	return (next: DispatchType) => (action: AnyMsgType) => {
		const dispatchActionWithDelayCmd = DispatchCmdWithDelayCmd.match(action)

		if (dispatchActionWithDelayCmd) {
			const { cmd, delayMs, key } = dispatchActionWithDelayCmd

			if (timeoutIdByKeyMap[key]) clearTimeout(timeoutIdByKeyMap[key])
			timeoutIdByKeyMap[key] = setTimeout(() => {
				delete timeoutIdByKeyMap[key]
				store.dispatch(cmd)
			}, delayMs)
		}

		return next(action)
	}
}

export {
	dispatchActionWithDelayMiddleware,
}
