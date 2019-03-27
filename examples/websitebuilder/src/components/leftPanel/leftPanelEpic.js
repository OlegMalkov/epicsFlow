// @flow strict

import { leftPanelToggleExpansionButtonPressed } from './leftPanelACAC'
import { setProp } from '../../../../../src/utils'
import { createEpic, createUpdater } from '../../../../../src/epics'

type LeftPanelStateType = {| expanded: bool, width: number |}

const LeftPanelWidthExpanded = 200
const LeftPanelWidthCollapsed = 50
const setWidth = setProp<LeftPanelStateType, *>('width')
const setExpanded = setProp<LeftPanelStateType, *>('expanded')

export const leftPanelEpic = createEpic<LeftPanelStateType, empty, empty>({
	vat: 'LEFT_PANEL_VAT',
	initialState: { width: 200, expanded: true },
	updaters: {
		compute: createUpdater({
			dependsOn: {},
			when: { _: leftPanelToggleExpansionButtonPressed.condition },
			then: ({ R, state }) => {
				return R
					.updateState(setWidth(state.expanded ? LeftPanelWidthCollapsed : LeftPanelWidthExpanded))
					.updateState(setExpanded(expanded => !expanded))
			},
		}),
	},
})
