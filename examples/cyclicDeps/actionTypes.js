// @flow 
import { makeCondition } from '../../src/epics'

const MOUSE_MOVE = 'MOUSE_MOVE'
type MouseMoveAction = {| type: string, x: number, y: number |}
export const mouseMoveAC = (x: number, y: number): MouseMoveAction => ({ type: MOUSE_MOVE, x, y })

export const mouseMoveCondition = makeCondition<MouseMoveAction>(MOUSE_MOVE)
