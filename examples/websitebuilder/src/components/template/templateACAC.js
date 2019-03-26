// @flow strict

import { type TemplateStateType } from './templateState'
import { createEpicCondition, createSACAC } from '../../epics'

const templateVat = 'TEMPLATE_VAT'
const templateCondition = createEpicCondition<TemplateStateType>(templateVat)
const templateWidthCondition = templateCondition.withSelectorKey('width')
const templateWidthLeftResizeHandleMouseDown = createSACAC('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN')
const templateWidthRightResizeHandleMouseDown = createSACAC('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')
const templateAreaMouseDown = createSACAC('TEMPLATE_AREA_MOUSE_DOWN')

export {
	templateVat,
	templateCondition,
	templateWidthCondition,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
	templateAreaMouseDown,
}
