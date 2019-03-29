// @flow strict

import { setProp } from '../../../../../src/utils'

type AddComponentsPanelStateType = {| expanded: bool, width: number |}

const addComponentPanelSetWidth = setProp<AddComponentsPanelStateType, *>('width')
const addComponentPanelSetExpanded = setProp<AddComponentsPanelStateType, *>('expanded')

const addComponentPanelInitialState: AddComponentsPanelStateType = { width: 200, expanded: true }

export {
	addComponentPanelSetWidth,
	addComponentPanelSetExpanded,
	addComponentPanelInitialState,
}
