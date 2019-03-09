// @flow strict
import { wsbE } from './wsbE.js'
import { type LTPosition } from './types.js' 

const { makeACAC, makeSACAC } = wsbE

export const
  windowMouseMove = makeACAC<{| position: LTPosition |}>('WINDOW_MOUSE_MOVE'),
  windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position'),
  windowMouseUp = makeSACAC('WINDOW_MOUSE_UP'),
  keyDown = makeACAC<{| keyCode: number |}>('KEY_DOWN'),
  keyboardEscDownCondition = keyDown.condition.withGuard<{| type: string, keyCode: number |}>(({ keyCode }) => keyCode === 27)