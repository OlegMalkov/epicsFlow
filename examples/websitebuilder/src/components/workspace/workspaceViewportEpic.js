// @flow strict

import { type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";
import { browserDimensions } from '../env/envACAC';
import { leftPanelEpic } from '../leftPanel/leftPanelEpic';
import { TopBarHeight } from '../topBar/topBarConstants';
import { setPropDeepCompare } from '../../utils';

type WorkspaceViewportState = {|
    dimensions: Dimensions
|}

const
 { makeEpic, makeUpdater } = wsbE,

 setDimensions = setPropDeepCompare<WorkspaceViewportState, *>('dimensions')

export const workspaceViewportEpic = makeEpic<WorkspaceViewportState, empty>({
    vat: 'WORKSPACE_VIEWPORT_VAT',
    initialState: { dimensions: { width: 0, height: 0 } },
    updaters: {
        compute: makeUpdater({
            conditions: { 
                browserDimensions: browserDimensions.condition,
                leftPanelWidth: leftPanelEpic.condition.withSelectorKey('width')
            },
            reducer: ({ values: { browserDimensions, leftPanelWidth }, R }) => 
                R.updateState(setDimensions({ 
                    width: browserDimensions.width - leftPanelWidth,
                    height: browserDimensions.height - TopBarHeight
                }))
        })
    }
})