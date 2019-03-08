// @flow strict

import { type ComponentState } from './componentState'
import { type LTPosition } from '../../types'
import { wsbE } from "../../wsbE";
import { componentVat, componentMouseDown } from './componentACAC';
import { windowMousePositionCondition, windowMouseUp } from '../../globalACAC.js'
import { templateWidthPC } from '../Template/templateACAC';

const { makeEpicWithScope, makeUpdater, ResultType } = wsbE
type ComponentScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', componentStartPos: LTPosition, mouseStartPos: LTPosition |} |}

const
  makeComponentWithinTemplateAdjuster = (templateWidth: number) => (componentState: ComponentState) => {
    const { left, width, top } = componentState
    let adjustedLeft
    if (left < 0) {
      adjustedLeft = 0
    }
    const right = width + left
    if (right > templateWidth) {
      adjustedLeft = templateWidth - width
    }

    let adjustedTop

    if (top < 0) {
      adjustedTop = 0
    }

    let nextState = componentState
    if (adjustedLeft !== undefined) {
      nextState = { ...nextState, left: adjustedLeft }
    }
    if (adjustedTop !== undefined) {
      nextState = { ...nextState, top: adjustedTop }
    }
    return nextState
  },
  dndInitialState = { type: 'idle' },
  componentEpic = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: componentVat,
    initialState: { left: 100, top: 100, width: 300, height: 200 },
    initialScope: { dnd: dndInitialState },
    updaters: {
      dnd: makeUpdater({
        conditions: {
          templateWidth: templateWidthPC,
          mousePosition: windowMousePositionCondition,
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
          mouseDown: componentMouseDown.condition,
        },
        reducer: ({ state, state: { left, top }, scope, values: { mousePosition, templateWidth }, changedActiveConditionsKeys }) => { 
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
            diffTop = mouseStartPos.top - mousePosition.top,
            componentWithinTemplateAdjuster = makeComponentWithinTemplateAdjuster(templateWidth)

          return ResultType.updateState(componentWithinTemplateAdjuster({ ...state, left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop })) 
        }
      })
    }
  })

export {
    componentEpic
}