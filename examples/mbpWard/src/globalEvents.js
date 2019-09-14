// @flow strict
import { createEvent, createSimpleEvent } from '../../../src/epics'
import { type PositionType } from './components/types'

const windowMouseMoveEvent = createEvent<{| position: PositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMoveEvent.condition.withSelectorKey('position')
const windowMouseUpEvent = createSimpleEvent('WINDOW_MOUSE_UP')
const windowMouseDownEvent = createSimpleEvent('WINDOW_MOUSE_DOWN')
const keyDownEvent = createEvent<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDownEvent.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMoveEvent,
	windowMousePositionCondition,
	windowMouseUpEvent,
	windowMouseDownEvent,
	keyDownEvent,
	keyboardEscDownCondition,
}
