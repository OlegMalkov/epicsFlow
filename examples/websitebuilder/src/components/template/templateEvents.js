// @flow strict

import { type TemplateStateType } from './templateState'
import { createEpicCondition, makeSimpleEvent } from '../../../../../src/epics'

const templateVcet = 'TEMPLATE_VCET'
const templateCondition = createEpicCondition<TemplateStateType>(templateVcet)
const templateWidthCondition = templateCondition.withSelectorKey('width')
const templateWidthLeftResizeHandleMouseDown = makeSimpleEvent('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN')
const templateWidthRightResizeHandleMouseDown = makeSimpleEvent('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')
const templateAreaMouseDownEvent = makeSimpleEvent('TEMPLATE_AREA_MOUSE_DOWN')

export {
	templateVcet,
	templateCondition,
	templateWidthCondition,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
	templateAreaMouseDownEvent,
}
