// @flow strict

import { type ComponentState, componentInitialState, componentWithinTemplateAdjuster, setComponentPosition, setComponentSelected } from './componentState';
import { wsbE } from "../../wsbE";
import { componentVat, componentMouseDown } from './componentACAC';
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition } from '../../globalACAC.js'
import { templateWidthPC, templateAreaMouseDown } from '../Template/templateACAC';
import { componentInitialScope, type ComponentScope, initComponentMovingDnd, resetComponentMovingDnd } from './componentScope';
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd';

const { makeEpicWithScope, makeUpdater } = wsbE

const
  componentEpic = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: componentVat,
    initialState: componentInitialState,
    initialScope: componentInitialScope,
    updaters: {
      dndMoveAndSelection: makeUpdater({
        conditions: {
          templateWidth: templateWidthPC,
          mouseDown: componentMouseDown.condition,
          mousePosition: windowMousePositionCondition,
          cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown'])
        },
        reducer: ({ 
          state: { position },
          scope,
          values: { mousePosition, templateWidth }, 
          changedActiveConditionsKeysMap, 
          R 
        }) => {
          if (changedActiveConditionsKeysMap.cancel) {
            if (scope.movingDnd.type === dndTypeProgress) {
              return R
                  .updateState(setComponentPosition(scope.movingDnd.componentStartPos))
                  .updateScope(resetComponentMovingDnd)
            }
            return R.doNothing
          }

          if (changedActiveConditionsKeysMap.mouseUp) {
            if (scope.movingDnd.type === dndTypeProgress) {
              return R
                  .updateState(setComponentSelected(true))
                  .updateScope(resetComponentMovingDnd)
            }
            return R.doNothing
          }

          if (scope.movingDnd.type === dndTypeIdle) {
            return R.updateScope(initComponentMovingDnd({ componentStartPos: position, mouseStartPos: mousePosition }))
          }

          const 
            { componentStartPos, mouseStartPos } = scope.movingDnd,
            diffLeft = mouseStartPos.left - mousePosition.left,
            diffTop = mouseStartPos.top - mousePosition.top

          return R
            .updateState(setComponentPosition({ left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop }))
            .updateState(componentWithinTemplateAdjuster(templateWidth))
        }
      }),
      deselection: makeUpdater({
        conditions: { templateAreaMouseDown: templateAreaMouseDown.condition },
        reducer: ({ R }) => R.updateState(setComponentSelected(false))
      })
    }
  })

export {
    componentEpic
}