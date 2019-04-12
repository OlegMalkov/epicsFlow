// @flow
import { makeSimpleEvent } from '../../../../../src/epics'

const propertiesPanelNextPageButtonPress = makeSimpleEvent('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED')
const propertiesPanelDragMouseDown = makeSimpleEvent('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')

export {
	propertiesPanelNextPageButtonPress,
	propertiesPanelDragMouseDown,
}
