// @flow strict
import { makeSimpleActionCreatorAndCondition } from '../../../../../src/epics'

const leftPanelToggleExpansionButtonPressed = makeSimpleActionCreatorAndCondition('LEFT_PANEL_TOGGLE_EXPANSION')

export {
	leftPanelToggleExpansionButtonPressed,
}
