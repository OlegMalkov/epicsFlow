// @flow strict

import { type ComponentState, componentInitialState, componentWithinTemplateAdjuster, setComponentPosition } from './componentState';
import { type LTPosition } from '../../types'
import { wsbE } from "../../wsbE";
import { componentVat, componentMouseDown } from './componentACAC';
import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC.js'
import { templateWidthPC } from '../Template/templateACAC';
import { StateContainer } from '../../utils';

const { makeEpicWithScope, makeUpdater, ResultType } = wsbE
type ComponentScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', componentStartPos: LTPosition, mouseStartPos: LTPosition |} |}

const
  dndInitialState = { type: 'idle' },
  componentEpic = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: componentVat,
    initialState: componentInitialState,
    initialScope: { dnd: dndInitialState },
    updaters: {
      dnd: makeUpdater({
        conditions: {
          templateWidth: templateWidthPC,
          mousePosition: windowMousePositionCondition,
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
          mouseDown: componentMouseDown.condition,
        },
        reducer: ({ state, state: { position: { left, top } }, scope, values: { mousePosition, templateWidth }, changedActiveConditionsKeys }) => { 
          if (changedActiveConditionsKeys[0] === 'mouseUp') {
            return ResultType.updateScope({ ...scope, dnd: dndInitialState })
          }
          const { dnd } = scope
          if (dnd.type === 'idle') {
            return ResultType.updateScope({ ...scope, dnd: { type: 'progress', componentStartPos: { left, top }, mouseStartPos: mousePosition } })
          }
          const 
            { componentStartPos, mouseStartPos } = dnd,
            diffLeft = mouseStartPos.left - mousePosition.left,
            diffTop = mouseStartPos.top - mousePosition.top

          return ResultType.updateState(
            StateContainer(state)
              .pipe(setComponentPosition({ left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop }))
              .pipe(componentWithinTemplateAdjuster(templateWidth))
              .value()
          ) 
        }
      })
    }
  })

export {
    componentEpic
}