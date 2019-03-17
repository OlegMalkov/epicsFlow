// @flow strict

import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC'
import { type TemplateState, templateInitialState, setTemplateWidth } from './templateState';
import { wsbE } from '../../wsbE'
import { componentRightPassiveCondition, componentMoved } from '../component/componentACAC';
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateVat } from './templateACAC';
import { templateInitialScope, type TemplateScope, resetTemplateDnd, templateInitDnd } from './templateScope';

const
  { makeEpicWithScope, makeUpdater } = wsbE,

  templateEpic = makeEpicWithScope<TemplateState, TemplateScope, empty>({
    vat: templateVat,
    initialState: templateInitialState,
    initialScope: templateInitialScope,
    updaters: {
      dnd: makeUpdater({
        conditions: {
          componentRight: componentRightPassiveCondition,
          mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
          leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
          rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional()
        },
        reducer: ({ state, scope, values: { mouseLeft, leftDown, rightDown, componentRight }, changedActiveConditionsKeysMap, R }) => { 
          if (!leftDown && !rightDown) return R.doNothing
          
          if (changedActiveConditionsKeysMap.mouseUp) {
            return R.updateScope(resetTemplateDnd)
          }

          const { dnd } = scope
          if (dnd.type === 'idle') {
            return R.updateScope(templateInitDnd({ startWidth: state.width, mouseStartLeft: mouseLeft }))
          }

          const 
            { startWidth, mouseStartLeft } = dnd,
            leftDiff = mouseStartLeft - mouseLeft,
            nextWidth = Math.max(300, componentRight, leftDown ? startWidth + 2 * leftDiff : startWidth - 2 * leftDiff)

          return R.updateState(setTemplateWidth(nextWidth)) 
        }
      }),
      componentMoved: makeUpdater({
        conditions: { _: componentMoved.condition },
        reducer: ({ R }) => R.updateState(state => setTemplateWidth(state.width + 50)(state))
      })
    }
  })

  export {
    templateEpic
  }