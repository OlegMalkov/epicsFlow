// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";
import { componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentPositionCondition, componentResizeHandleNTopCondition } from '../Component/componentACAC';
import { setPropDeepCompare } from '../../utils';

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
    componentMainActionsEpicVat = 'COMPONENT_MAIN_ACTIONS',
    componentMainActionsCondition = makeEpicCondition<ComponentMainActionsState>(componentMainActionsEpicVat)

export const
    componentMainActionsEpic = makeEpic<ComponentMainActionsState, *>({ 
        vat: componentMainActionsEpicVat,
        initialState: { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false },
        updaters: {
            showHide: makeUpdater({
                conditions: { 
                    componentIsMoving: componentIsMovingCondition,
                    componentIsResizing: componentIsResizingCondition,
                    componentSelected: componentSelectedCondition
                },
                reducer: ({ values: { componentIsMoving, componentIsResizing, componentSelected }, R }) =>
                    R.updateState(setVisible(componentSelected && !componentIsMoving && !componentIsResizing))
            }),
            computePosition: makeUpdater({ 
                conditions: { 
                    componentMainActionsIsVisible: componentMainActionsCondition.withSelectorKey('visible'),
                    componentPosition: componentPositionCondition,
                    componentResizeHandleNTop: componentResizeHandleNTopCondition
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