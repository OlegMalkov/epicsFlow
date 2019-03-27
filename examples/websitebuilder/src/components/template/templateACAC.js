// @flow strict

import { type TemplateStateType } from './templateState'
import { createEpicCondition, makeSimpleActionCreatorAndCondition } from '../../../../../src/epics'

const templateVat = 'TEMPLATE_VAT'
const templateCondition = createEpicCondition<TemplateStateType>(templateVat)
const templateWidthCondition = templateCondition.withSelectorKey('width')
const templateWidthLeftResizeHandleMouseDown = makeSimpleActionCreatorAndCondition('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN')
const templateWidthRightResizeHandleMouseDown = makeSimpleActionCreatorAndCondition('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')
const templateAreaMouseDown = makeSimpleActionCreatorAndCondition('TEMPLATE_AREA_MOUSE_DOWN')

export {
	templateVat,
	templateCondition,
	templateWidthCondition,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
	templateAreaMouseDown,
}
