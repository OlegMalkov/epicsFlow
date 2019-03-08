// @flow strict
import { wsbE } from './wsbE.js'
import { type LTPosition } from './types.js' 

const { makeACAC, makeSACAC } = wsbE

export const
  windowMouseMove = makeACAC<{| position: LTPosition |}>('WINDOW_MOUSE_MOVE'),
  windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position'),
  windowMouseUp = makeSACAC('WINDOW_MOUSE_UP')