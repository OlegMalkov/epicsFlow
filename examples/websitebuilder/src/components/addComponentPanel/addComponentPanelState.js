// @flow strict

import { setProp } from '../../../../../src/utils'

type AddComponentPanelStateType = {| expanded: bool, width: number |}

const addComponentPanelSetWidth = setProp<AddComponentPanelStateType, *>('width')
const addComponentPanelSetExpanded = setProp<AddComponentPanelStateType, *>('expanded')

const addComponentPanelInitialState: AddComponentPanelStateType = { width: 200, expanded: true }

export {
	addComponentPanelSetWidth,
	addComponentPanelSetExpanded,
	addComponentPanelInitialState,
}
