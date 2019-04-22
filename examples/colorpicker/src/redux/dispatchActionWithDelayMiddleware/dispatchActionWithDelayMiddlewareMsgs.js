// @flow
import { makeCommand, type AnyMsgType } from '../../../../../src/epics'

const DispatchCmdWithDelayCmd = makeCommand<{| cmd: AnyMsgType, delayMs: number, key: string |}>('DISPATCH_ACTION_WITH_DELAY')

export {
	DispatchCmdWithDelayCmd,
}
