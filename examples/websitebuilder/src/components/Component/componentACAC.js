// @flow strict

import { type ComponentState } from './componentState'
import { wsbE } from "../../wsbE";

const { makeEpicCondition, makeSACAC } = wsbE

export const 
  componentVat = 'COMPONENT',
  componentMouseDown = makeSACAC('COMPONENT_MOUSE_DOWN'),
  componentCondition = makeEpicCondition<ComponentState>(componentVat),
  componentRightCondition = componentCondition.withSelector<number>(({ left, width }) => left + width),
  componentRightPassiveCondition = componentRightCondition.toPassive()
