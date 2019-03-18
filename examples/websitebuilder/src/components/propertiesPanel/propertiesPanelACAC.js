// @flow

import { wsbE } from "../../wsbE";

const { makeSACAC } = wsbE

export const 
    propertiesPanelNextPageButtonPress = makeSACAC('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED'),
    propertiesPanelDragMouseDown = makeSACAC('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')