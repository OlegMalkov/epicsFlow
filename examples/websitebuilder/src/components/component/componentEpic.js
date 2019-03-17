// @flow strict

import { type BuiltInEffect } from '../../epics'
import { type ComponentState, componentInitialState, updateComponentBBox, setComponentSelected, setComponentIsMovingFalse, setComponentIsMovingTrue, setComponentIsResizingFalse, setComponentIsResizingTrue } from './componentState';
import { wsbE } from "../../wsbE";
import { componentVat, componentMouseDown, componentResizeNMouseDown } from './componentACAC';
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition } from '../../globalACAC.js'
import { templateWidthPC, templateAreaMouseDown } from '../template/templateACAC';
import { componentInitialScope, type ComponentScope, initComponentMoveDnd, resetComponentMoveDnd, resetComponentResizeDnd, initComponentResizeDnd } from './componentScope';
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd';
import { T, F } from '../../utils';

const { makeEpicWithScope, makeUpdater } = wsbE

const
  componentEpic = makeEpicWithScope<ComponentState, ComponentScope, BuiltInEffect>({
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
          changedActiveConditionsKeysMap: { cancel, mouseUp }, 
          R 
        }) => {
          if (cancel) {
            if (scope.movingDnd.type === dndTypeProgress) {
              const { componentStartPos } = scope.movingDnd
              return R
                  .updateState(updateComponentBBox({ bboxUpdate: { ...componentStartPos }, templateWidth }))
                  .updateState(setComponentIsMovingFalse)
                  .updateScope(resetComponentMoveDnd)
            }
            return R.doNothing
          }

          if (mouseUp) {
            return R
                .updateState(setComponentIsMovingFalse)
                .updateState(setComponentSelected(T))
                .updateScope(resetComponentMoveDnd)
          }

          if (scope.movingDnd.type === dndTypeIdle) {
            return R.updateScope(initComponentMoveDnd({ componentStartPos: position, mouseStartPos: mousePosition }))
          }

          const 
            { componentStartPos, mouseStartPos } = scope.movingDnd,
            diffLeft = mouseStartPos.left - mousePosition.left,
            diffTop = mouseStartPos.top - mousePosition.top

          return R
            .updateState(setComponentIsMovingTrue)
            .updateState(updateComponentBBox({
              bboxUpdate: { left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop },
              templateWidth
            }))
        }
      }),
      dndResize: makeUpdater({
        conditions: { 
          templateWidth: templateWidthPC,
          resizeNMouseDown: componentResizeNMouseDown.condition,
          mousePosition: windowMousePositionCondition,
          cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeNMouseDown']),
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeNMouseDown'])
        },
        reducer: ({ 
          state,
          scope,
          values: { mousePosition, templateWidth }, 
          changedActiveConditionsKeysMap: { cancel, mouseUp }, 
          R
        }) => {

          if (cancel) {
            if (scope.resizeDnd.type === dndTypeProgress) {
              const { componentStartPosition, componentStartDimensions } = scope.resizeDnd
              return R
                  .updateState(updateComponentBBox({ bboxUpdate: { ...componentStartPosition, ...componentStartDimensions }, templateWidth }))
                  .updateState(setComponentIsResizingFalse)
                  .updateScope(resetComponentResizeDnd)
            }
            return R.doNothing
          }

          if (mouseUp) {
            return R
                  .updateState(setComponentIsResizingFalse)
                  .updateScope(resetComponentResizeDnd)
          }

          if (scope.resizeDnd.type === dndTypeIdle) {
            return R.updateScope(initComponentResizeDnd({ componentStartDimensions: state.dimensions, componentStartPosition: state.position, mouseStartPos: mousePosition }))
          }

          const 
            { componentStartPosition, componentStartDimensions, mouseStartPos } = scope.resizeDnd,
            diffTop = mouseStartPos.top - mousePosition.top

          return R
            .updateState(updateComponentBBox({ bboxUpdate: { top: componentStartPosition.top - diffTop, height: componentStartDimensions.height + diffTop }, templateWidth }))
            .updateState(setComponentIsResizingTrue)
        }
      }),
      deselection: makeUpdater({
        conditions: { templateAreaMouseDown: templateAreaMouseDown.condition.toOptional(), escPressed: keyboardEscDownCondition.toOptional() },
        reducer: ({ R }) => R.updateState(setComponentSelected(F))
      })
    }
  })

export {
    componentEpic
}