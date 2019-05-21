// @flow
import { createSimpleEvent } from '../../../../../src/epics'

const propertiesPanelNextPageButtonPress = createSimpleEvent('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED')
const propertiesPanelDragMouseDown = createSimpleEvent('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')

export {
	propertiesPanelNextPageButtonPress,
	propertiesPanelDragMouseDown,
}
