// @flow strict

import { createEpic, createUpdater } from '../../../../../src/epics'
import { addComponentPanelToggleExpansionButtonPressed } from './addComponentPanelACnC'
import { addComponentPanelInitialState, addComponentPanelSetWidth, addComponentPanelSetExpanded } from './addComponentPanelState'

const AddComponentPanelWidthExpanded = 200
const AddComponentPanelWidthCollapsed = 50

export const addComponentPanelEpic = createEpic<typeof addComponentPanelInitialState, empty, empty>({
	vat: 'LEFT_PANEL_VAT',
	initialState: addComponentPanelInitialState,
	updaters: {
		compute: createUpdater({
			given: {},
			when: { _: addComponentPanelToggleExpansionButtonPressed.condition },
			then: ({ R, state }) => {
				return R
					.mapState(addComponentPanelSetWidth(state.expanded ? AddComponentPanelWidthCollapsed : AddComponentPanelWidthExpanded))
					.mapState(addComponentPanelSetExpanded(expanded => !expanded))
			},
		}),
	},
})
