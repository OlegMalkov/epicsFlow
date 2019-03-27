// @flow strict

import { type DimensionsType } from '../../types'
import { browserDimensions } from '../env/envACAC'
import { leftPanelEpic } from '../leftPanel/leftPanelEpic'
import { TopBarHeight } from '../topBar/topBarConstants'
import { setPropDeepCompare } from '../../../../../src/utils'
import { createEpic, createUpdater } from '../../../../../src/epics'

type WorkspaceViewportStateType = {|
    dimensions: DimensionsType,
|}

const setDimensions = setPropDeepCompare<WorkspaceViewportStateType, *>('dimensions')
const workspaceViewportEpic = createEpic<WorkspaceViewportStateType, empty, empty>({
	vat: 'WORKSPACE_VIEWPORT_VAT',
	initialState: { dimensions: { width: 0, height: 0 } },
	updaters: {
		compute: createUpdater({
			dependsOn: {},
			when: {
				browserDimensions: browserDimensions.condition,
				leftPanelWidth: leftPanelEpic.condition.withSelectorKey('width'),
			},
			then: ({ values: { browserDimensions, leftPanelWidth }, R }) =>
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
