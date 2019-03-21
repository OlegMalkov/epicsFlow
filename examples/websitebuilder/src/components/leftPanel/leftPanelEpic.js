// @flow strict

import { leftPanelToggleExpansionButtonPressed } from './leftPanelACAC'
import { setProp } from '../../utils'
import { makeEpic, makeUpdater } from '../../epics'

type LeftPanelStateType = {| expanded: bool, width: number |}

const LeftPanelWidthExpanded = 200
const LeftPanelWidthCollapsed = 50
const setWidth = setProp<LeftPanelStateType, *>('width')
const setExpanded = setProp<LeftPanelStateType, *>('expanded')

export const leftPanelEpic = makeEpic<LeftPanelStateType, empty>({
	vat: 'LEFT_PANEL_VAT',
	initialState: { width: 200, expanded: true },
	updaters: {
		compute: makeUpdater({
			conditions: { _: leftPanelToggleExpansionButtonPressed.condition },
			reducer: ({ R, state }) => {
				return R
					.updateState(setWidth(state.expanded ? LeftPanelWidthCollapsed : LeftPanelWidthExpanded))
					.updateState(setExpanded(expanded => !expanded))
			},
		}),
	},
})
