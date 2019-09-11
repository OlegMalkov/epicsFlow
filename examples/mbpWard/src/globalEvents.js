// @flow strict
import { type LTPositionType } from './types'
import { createEvent, createSimpleEvent } from '../../../src/epics'

const	windowMouseMoveEvent = createEvent<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMoveEvent.condition.withSelectorKey('position')
const windowMouseUpEvent = createSimpleEvent('WINDOW_MOUSE_UP')
const keyDownEvent = createEvent<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDownEvent.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMoveEvent,
	windowMousePositionCondition,
	windowMouseUpEvent,
	keyDownEvent,
	keyboardEscDownCondition,
}
