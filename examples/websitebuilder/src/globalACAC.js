// @flow strict
import { type LTPositionType } from './types'
import { makeACAC, makeSACAC } from './epics'

const	windowMouseMove = makeACAC<{| position: LTPositionType |}>('WINDOW_MOUSE_MOVE')
const windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position')
const windowMouseUp = makeSACAC('WINDOW_MOUSE_UP')
const keyDown = makeACAC<{| keyCode: number |}>('KEY_DOWN')
const keyboardEscDownCondition = keyDown.condition.withGuard<{| keyCode: number, type: string |}>(({ keyCode }) => keyCode === 27)

export {
	windowMouseMove,
	windowMousePositionCondition,
	windowMouseUp,
	keyDown,
	keyboardEscDownCondition,
}
