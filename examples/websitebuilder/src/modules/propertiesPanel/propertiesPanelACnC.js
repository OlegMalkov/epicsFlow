// @flow
import { makeSimpleActionCreatorAndCondition } from '../../../../../src/epics'

const propertiesPanelNextPageButtonPress = makeSimpleActionCreatorAndCondition('PROPERTIES_PANEL_NEXT_PAGE_BUTTON_PRESSED')
const propertiesPanelDragMouseDown = makeSimpleActionCreatorAndCondition('PROPERTIES_PANEL_DRAG_MOUSE_DOWN')

export {
	propertiesPanelNextPageButtonPress,
	propertiesPanelDragMouseDown,
}
