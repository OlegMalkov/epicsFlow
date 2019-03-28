// @flow strict

import { setProp } from '../../../../../src/utils'
import { createEpic, createUpdater } from '../../../../../src/epics'
import { addComponentPanelToggleExpansionButtonPressed } from './addComponentPanelACnC'

type AddComponentPanelStateType = {| expanded: bool, width: number |}

const AddComponentPanelWidthExpanded = 200
const AddComponentPanelWidthCollapsed = 50
const setWidth = setProp<AddComponentPanelStateType, *>('width')
const setExpanded = setProp<AddComponentPanelStateType, *>('expanded')

export const addComponentPanelEpic = createEpic<AddComponentPanelStateType, empty, empty>({
	vat: 'LEFT_PANEL_VAT',
	initialState: { width: 200, expanded: true },
	updaters: {
		compute: createUpdater({
			given: {},
			when: { _: addComponentPanelToggleExpansionButtonPressed.condition },
			then: ({ R, state }) => {
				return R
					.mapState(setWidth(state.expanded ? AddComponentPanelWidthCollapsed : AddComponentPanelWidthExpanded))
					.mapState(setExpanded(expanded => !expanded))
			},
		}),
	},
})
