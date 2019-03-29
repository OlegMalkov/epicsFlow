// @flow strict
import { type LTPositionType } from './types'
import { makeActionCreatorAndCondition, makeSimpleActionCreatorAndCondition } from '../../../src/epics'

const windowMouseMove = makeActionCreatorAndCondition<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position')
// prefer windowMouseDown and windowMouseUp not to have payload, as including them increase chance of having inconsistent input
// pick single source of truth for mousePosition (windowMouseMove) and use it everywhere
const windowMouseDown = makeSimpleActionCreatorAndCondition('WINDOW_MOUSE_DOWN')
const windowMouseUp = makeSimpleActionCreatorAndCondition('WINDOW_MOUSE_UP')
const keyDown = makeActionCreatorAndCondition<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDown.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseDown,
	windowMouseMove,
	windowMousePositionCondition,
	windowMouseUp,
	keyDown,
	keyboardEscDownCondition,
}
