// @flow strict
import { type LTPositionType } from './types'
import { makeActionCreatorAndCondition, makeSimpleActionCreatorAndCondition } from '../../../src/epics'

const	windowMouseMove = makeActionCreatorAndCondition<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position')
const windowMouseUp = makeSimpleActionCreatorAndCondition('WINDOW_MOUSE_UP')
const keyDown = makeActionCreatorAndCondition<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDown.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMove,
	windowMousePositionCondition,
	windowMouseUp,
	keyDown,
	keyboardEscDownCondition,
}
