// @flow strict
import { type LTPositionType } from './types'
import { makeEvent, makeSimpleEvent } from '../../../src/epics'

const	windowMouseMoveEvent = makeEvent<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMoveEvent.condition.withSelectorKey('position')
const windowMouseUpEvent = makeSimpleEvent('WINDOW_MOUSE_UP')
const keyDownEvent = makeEvent<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDownEvent.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMoveEvent,
	windowMousePositionCondition,
	windowMouseUpEvent,
	keyDownEvent,
	keyboardEscDownCondition,
}
