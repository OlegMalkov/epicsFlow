// @flow strict

import { type DimensionsType } from '../../types'
import { browserDimensions } from '../env/envACnC'
import { TopBarHeight } from '../topBar/topBarConstants'
import { setPropDeepCompare } from '../../../../../src/utils'
import { createEpic, createUpdater } from '../../../../../src/epics'
import { addComponentPanelEpic } from '../addComponentPanel/addComponentPanelEpic'

type WorkspaceViewportStateType = {|
    dimensions: DimensionsType,
|}

const setDimensions = setPropDeepCompare<WorkspaceViewportStateType, *>('dimensions')
const workspaceViewportEpic = createEpic<WorkspaceViewportStateType, empty, empty>({
	vat: 'WORKSPACE_VIEWPORT_VAT',
	initialState: { dimensions: { width: 0, height: 0 } },
	updaters: {
		compute: createUpdater({
			given: {},
			when: {
				browserDimensions: browserDimensions.condition,
				addComponentPanelWidth: addComponentPanelEpic.condition.withSelectorKey('width'),
			},
			then: ({ values: { browserDimensions, addComponentPanelWidth }, R }) =>
				R.mapState(setDimensions({
					width: browserDimensions.width - addComponentPanelWidth,
					height: browserDimensions.height - TopBarHeight,
				})),
		}),
	},
})

export {
	workspaceViewportEpic,
}
