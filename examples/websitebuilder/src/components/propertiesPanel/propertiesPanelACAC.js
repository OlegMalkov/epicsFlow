// @flow
import { makeSACAC } from '../../epics'

const propertiesPanelNextPageButtonPress = makeSACAC('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED')
const propertiesPanelDragMouseDown = makeSACAC('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')

export {
	propertiesPanelNextPageButtonPress,
	propertiesPanelDragMouseDown,
}
