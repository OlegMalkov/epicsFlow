// @flow strict

import { type TemplateStateType } from './templateState'
import { makeEpicCondition, makeSACAC } from '../../epics'

const templateVat = 'TEMPLATE_VAT'
const templateCondition = makeEpicCondition<TemplateStateType>(templateVat)
const templateWidthCondition = templateCondition.withSelectorKey('width')
const templateWidthLeftResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN')
const templateWidthRightResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')
const templateAreaMouseDown = makeSACAC('TEMPLATE_AREA_MOUSE_DOWN')

export {
	templateVat,
	templateCondition,
	templateWidthCondition,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
	templateAreaMouseDown,
}
