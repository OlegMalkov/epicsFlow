// @flow strict

import { createEpicCondition, makeSimpleActionCreatorAndCondition } from '../../../../../src/epics'
import { templateInitialState } from './templateState'

const templateVat = 'TEMPLATE_VAT'
const templateCondition = createEpicCondition<typeof templateInitialState>(templateVat)
const templateWidthCondition = templateCondition.withSelectorKey('width')
const templateWidthLeftResizeHandleMouseDown = makeSimpleActionCreatorAndCondition('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN')
const templateWidthRightResizeHandleMouseDown = makeSimpleActionCreatorAndCondition('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')

export {
	templateVat,
	templateCondition,
	templateWidthCondition,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
}
