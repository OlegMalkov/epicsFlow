// @flow

import { type Condition, type AnyEpicUpdaterResultType } from './epics'
import { wsbE } from './E'
import { type LTPosition } from './types'
import { windowMousePositionC, windowMouseUp } from './acac'


export type DndByMouseScope = {| type: 'idle' |} | {|
  type: 'in_progress',
  entityPositionOnStart: LTPosition,
  windowMousePositionOnStart: LTPosition
|}


const 
    { RT, makeUpdater } = wsbE,

  dndByMouseInitialScope = { type: 'idle' },
  makeDndByMouseUpdaters = <State>({ 
    key,
    mouseDownCondition,
    getEntityPositionOnStart,
    computeResult,
    reverse
  }: {|
    key: string,
    mouseDownCondition: Condition<{| type: string |}>,
    getEntityPositionOnStart: State => LTPosition,
    computeResult: ({ state: State, startPosition: LTPosition, positionDiff: LTPosition }) => AnyEpicUpdaterResultType<State, *, *>
  |}) => ({
      [key + 'MouseDownOnComponent']: makeUpdater<State, *, *, *>({ 
        conditions: { _: mouseDownCondition, mousePosition: windowMousePositionC.tp() },
        reducer: ({ values: { mousePosition }, scope, state }) => RT.updateScope({ 
          ...scope, 
          [key]: {
            type: 'in_progress',
            entityPositionOnStart: getEntityPositionOnStart(state),
            windowMousePositionOnStart: mousePosition
          }
        })
      }),
      [key + 'MouseMove']: makeUpdater<State, *, *, *>({
        conditions: { windowMousePosition: windowMousePositionC },
        reducer: ({ values: { windowMousePosition }, state, scope }) => {
          const dndByMouse: DndByMouseScope = scope[key]
          if (dndByMouse.type === 'idle') return RT.doNothing

          const { windowMousePositionOnStart, entityPositionOnStart } = dndByMouse

          return computeResult({ 
            state,
            startPosition: entityPositionOnStart,
            positionDiff: { 
              left: windowMousePositionOnStart.left - windowMousePosition.left,
              top: windowMousePositionOnStart.top - windowMousePosition.top
            } 
          })
        }
      }),
      [key + 'MouseUp']: makeUpdater<State, *, *, *>({ 
        conditions: { _: windowMouseUp.c },
        reducer: ({ scope }) => RT.updateScope({ ...scope, [key]: dndByMouseInitialScope })
      })
    })

export {
    makeDndByMouseUpdaters,
    dndByMouseInitialScope
}