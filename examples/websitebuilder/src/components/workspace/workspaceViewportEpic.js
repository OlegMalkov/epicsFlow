// @flow strict

import { type DimensionsType } from '../../types'
import { browserDimensions } from '../env/envACAC'
import { leftPanelEpic } from '../leftPanel/leftPanelEpic'
import { TopBarHeight } from '../topBar/topBarConstants'
import { setPropDeepCompare } from '../../utils'
import { makeEpic, makeUpdater } from '../../epics'

type WorkspaceViewportStateType = {|
    dimensions: DimensionsType,
|}

const setDimensions = setPropDeepCompare<WorkspaceViewportStateType, *>('dimensions')
const workspaceViewportEpic = makeEpic<WorkspaceViewportStateType, empty>({
	vat: 'WORKSPACE_VIEWPORT_VAT',
	initialState: { dimensions: { width: 0, height: 0 } },
	updaters: {
		compute: makeUpdater({
			conditions: {
				browserDimensions: browserDimensions.condition,
				leftPanelWidth: leftPanelEpic.condition.withSelectorKey('width'),
			},
			reducer: ({ values: { browserDimensions, leftPanelWidth }, R }) =>
				R.updateState(setDimensions({
					width: browserDimensions.width - leftPanelWidth,
					height: browserDimensions.height - TopBarHeight,
				})),
		}),
	},
})

export {
	workspaceViewportEpic,
}
