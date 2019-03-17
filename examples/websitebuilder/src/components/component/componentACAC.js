// @flow strict

import { type ComponentState } from './componentState'
import { wsbE } from "../../wsbE";

const { makeEpicCondition, makeSACAC } = wsbE

export const 
  componentVat = 'COMPONENT_VAT',
  componentMouseDown = makeSACAC('COMPONENT_MOUSE_DOWN'),
  componentResizeNMouseDown = makeSACAC('COMPONENT_RESIZE_N_MOUSE_DOWN'),
  componentCondition = makeEpicCondition<ComponentState>(componentVat),
  componentRightCondition = componentCondition.withSelector<number>(({ position: { left }, dimensions: { width } }) => left + width),
  componentRightPassiveCondition = componentRightCondition.toPassive(),
  componentPositionCondition = componentCondition.withSelectorKey('position'),
  componentDimensionsCondition = componentCondition.withSelectorKey('dimensions'),
  componentSelectedCondition = componentCondition.withSelectorKey('selected'),
  componentIsMovingCondition = componentCondition.withSelectorKey('isMoving'),
  componentIsResizingCondition = componentCondition.withSelectorKey('isResizing'),
  componentMoved = makeSACAC('COMPONENT_MOVED')
