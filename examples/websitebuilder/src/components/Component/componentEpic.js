// @flow strict

import { type ComponentState, componentInitialState, componentWithinTemplateAdjuster, setComponentPosition } from './componentState';
import { wsbE } from "../../wsbE";
import { componentVat, componentMouseDown } from './componentACAC';
import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC.js'
import { templateWidthPC } from '../Template/templateACAC';
import { SingleTypeContainer } from '../../utils';
import { componentInitialScope, type ComponentScope, resetComponentDnd, initComponentDnd } from './componentScope';

const { makeEpicWithScope, makeUpdater } = wsbE

const
  componentEpic = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: componentVat,
    initialState: componentInitialState,
    initialScope: componentInitialScope,
    updaters: {
      dnd: makeUpdater({
        conditions: {
          templateWidth: templateWidthPC,
          mousePosition: windowMousePositionCondition,
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
          mouseDown: componentMouseDown.condition,
        },
        reducer: ({ 
          state, state: { position }, scope, values: { mousePosition, templateWidth }, changedActiveConditionsKeys, R }) => { 
          if (changedActiveConditionsKeys[0] === 'mouseUp') {
            return R.updateScope(resetComponentDnd)
          }
          const { dnd } = scope
          if (dnd.type === 'idle') {
            return R.updateScope(initComponentDnd({ componentStartPos: position, mouseStartPos: mousePosition }))
          }
          const 
            { componentStartPos, mouseStartPos } = dnd,
            diffLeft = mouseStartPos.left - mousePosition.left,
            diffTop = mouseStartPos.top - mousePosition.top

          return R
            .updateState(setComponentPosition({ left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop }))
            .updateState(componentWithinTemplateAdjuster(templateWidth))
        }
      })
    }
  })

export {
    componentEpic
}