// @flow strict

import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC'
import { type TemplateState, templateInitialState, setTemplateWidth } from './templateState';
import { wsbE } from '../../wsbE'
import { componentRightPassiveCondition } from '../Component/componentACAC';
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown } from './templateACAC';

const 
    { makeEpicWithScope, makeUpdater, ResultType } = wsbE,
    dndInitialState = { type: 'idle' }

type TemplateScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', startWidth: number, mouseStartLeft: number |} |}

const
  templateEpic = makeEpicWithScope<TemplateState, TemplateScope, empty>({
    vat: 'TEMPLATE',
    initialState: templateInitialState,
    initialScope: { dnd: dndInitialState },
    updaters: {
      dnd: makeUpdater({
        conditions: {
          componentRight: componentRightPassiveCondition,
          mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
          leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
          rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional()
        },
        reducer: ({ state, scope, values: { mouseLeft, leftDown, rightDown, componentRight }, changedActiveConditionsKeys }) => { 
          if (!leftDown && !rightDown) return ResultType.doNothing
          
          if (changedActiveConditionsKeys[0] === 'mouseUp') {
            return ResultType.updateScope({ ...scope, dnd: dndInitialState })
          }

          const { dnd } = scope
          if (dnd.type === 'idle') {
            return ResultType.updateScope({ ...scope, dnd: { type: 'progress', startWidth: state.width, mouseStartLeft: mouseLeft } })
          }

          const 
            { startWidth, mouseStartLeft } = dnd,
            leftDiff = mouseStartLeft - mouseLeft,
            nextWidth = Math.max(300, componentRight, leftDown ? startWidth + 2 * leftDiff : startWidth - 2 * leftDiff)

          return ResultType.updateState(setTemplateWidth(nextWidth)(state)) 
        }
      })
    }
  })

  export {
    templateEpic
  }