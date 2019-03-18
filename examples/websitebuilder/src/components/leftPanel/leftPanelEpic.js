// @flow strict

import { wsbE } from "../../wsbE";
import { leftPanelToggleExpansionButtonPressed } from './leftPanelACAC';
import { setProp } from '../../utils';

const { makeEpic, makeUpdater } = wsbE

type LeftPanelState = {| width: number, expanded: boolean |}

const 
    LeftPanelWidthExpanded = 200,
    LeftPanelWidthCollapsed = 50,

    setWidth = setProp<LeftPanelState, *>('width'),
    setExpanded = setProp<LeftPanelState, *>('expanded')

export const leftPanelEpic = makeEpic<LeftPanelState, empty>({
    vat: 'LEFT_PANEL_VAT',
    initialState: { width: 200, expanded: true },
    updaters: {
        compute: makeUpdater({
            conditions: { _: leftPanelToggleExpansionButtonPressed.condition },
            reducer: ({ values: { browserDimensions, leftPanelWidth }, R, state }) => {
                return R
                    .updateState(setWidth(state.expanded ? LeftPanelWidthCollapsed : LeftPanelWidthExpanded))
                    .updateState(setExpanded(expanded => !expanded))
            }
        })
    }
})