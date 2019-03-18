// @flow strict

import { type TemplateState } from './templateState'
import { wsbE } from "../../wsbE"

const { makeEpicCondition, makeSACAC } = wsbE

export const 
    templateVat = 'TEMPLATE_VAT',
    templateCondition = makeEpicCondition<TemplateState>(templateVat),
    templateWidthCondition = templateCondition.withSelectorKey('width'),
    // $FlowFixMe
    templateWidthPC = templateWidthCondition.tp(),
    templateWidthLeftResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN'),
    templateWidthRightResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN'),
    templateAreaMouseDown = makeSACAC('TEMPLATE_AREA_MOUSE_DOWN')