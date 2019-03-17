// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";
import { componentPositionCondition } from '../component/componentACAC';
import { setPropDeepCompare } from '../../utils';
import { componentResizeHandleNTopCondition, componentResizeDecorationsVisibleCondition } from '../componentResizeDecorations/componentResizeDecorationsEpic';

const { makeUpdater, makeEpic, makeEpicCondition } = wsbE

export type ComponentMainActionsState = {|
    visible: boolean,
    position: LTPosition,
    dimensions: Dimensions
|}

const 
    setVisible = setPropDeepCompare<ComponentMainActionsState, *>('visible'),
    setPosition = setPropDeepCompare<ComponentMainActionsState, *>('position')

const 
    componentMainActionsEpicVat = 'COMPONENT_MAIN_ACTIONS_VAT',
    componentMainActionsCondition = makeEpicCondition<ComponentMainActionsState>(componentMainActionsEpicVat)

export const
    componentMainActionsEpic = makeEpic<ComponentMainActionsState, *>({ 
        vat: componentMainActionsEpicVat,
        initialState: { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false },
        updaters: {
            showHide: makeUpdater({
                conditions: { resizeDecorationsVisible: componentResizeDecorationsVisibleCondition },
                reducer: ({ values: { resizeDecorationsVisible }, R }) => R.updateState(setVisible(resizeDecorationsVisible))
            }),
            computePosition: makeUpdater({ 
                conditions: { 
                    componentMainActionsIsVisible: componentMainActionsCondition.withSelectorKey('visible'),
                    componentPosition: componentPositionCondition.toPassive(),
                    componentResizeHandleNTop: componentResizeHandleNTopCondition.toPassive()
                },
                reducer: ({ values: { componentMainActionsIsVisible, componentPosition, componentResizeHandleNTop }, R, state }) => {
                    if (componentMainActionsIsVisible) {
                        return R.updateState(setPosition({ left: componentPosition.left, top: componentResizeHandleNTop - 10 - state.dimensions.height }))
                    }
                    return R.doNothing
                }
            })
        }
    })