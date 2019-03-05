// @flow strict
import { wsbE } from './E'
import { type LTPosition } from './types' 

const { makeACAC, makeSACAC } = wsbE

export const
  windowMouseMove = makeACAC<{| position: LTPosition |}>('WINDOW_MOUSE_MOVE'),
  windowMousePositionCondition = windowMouseMove.condition.withSelectorKey('position'),
  windowMouseUp = makeSACAC('WINDOW_MOUSE_UP')