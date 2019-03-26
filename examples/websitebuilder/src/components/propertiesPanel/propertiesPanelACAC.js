// @flow
import { createSACAC } from '../../epics'

const propertiesPanelNextPageButtonPress = createSACAC('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED')
const propertiesPanelDragMouseDown = createSACAC('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')

export {
	propertiesPanelNextPageButtonPress,
	propertiesPanelDragMouseDown,
}
