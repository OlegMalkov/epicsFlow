// @flow strict
import { type LTPositionType } from './types'
import { createACAC, createSACAC } from '../../../src/epics';

const	windowMouseMove = createACAC<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position')
const windowMouseUp = createSACAC('WINDOW_MOUSE_UP')
const keyDown = createACAC<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDown.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMove,
	windowMousePositionCondition,
	windowMouseUp,
	keyDown,
	keyboardEscDownCondition,
}
