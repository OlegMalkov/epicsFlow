// @flow strict
import { wsbE } from './E'
import { type LTPosition } from './types' 

const { ACAC, SACAC } = wsbE

export const
  windowMouseMove = new ACAC<{| position: LTPosition |}>('WINDOW_MOUSE_MOVE'),
  windowMousePositionC = windowMouseMove.c.wsk('position'),
  windowMouseUp = new SACAC('WINDOW_MOUSE_UP')