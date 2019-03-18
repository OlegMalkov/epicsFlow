// @flow strict

import { wsbE } from "../../wsbE";
import { componentPositionCondition } from '../component/componentACAC';
import { componentResizeHandleNTopCondition, componentResizeDecorationsVisibleCondition } from '../componentResizeDecorations/componentResizeDecorationsEpic';
import { componentMainActionsInitialState, type ComponentMainActionsState, componentMainActionsSetVisible, componentMainActionsSetPosition } from './componentMainActionsState';
import { componentMainActionsEpicVat, componentsMainActionsIsVisibleCondition } from './componentMainActionsACAC';

const { makeUpdater, makeEpic } = wsbE

export const
    componentMainActionsEpic = makeEpic<ComponentMainActionsState, *>({ 
        vat: componentMainActionsEpicVat,
        initialState: componentMainActionsInitialState,
        updaters: {
            showHide: makeUpdater({
                conditions: { resizeDecorationsVisible: componentResizeDecorationsVisibleCondition },
                reducer: ({ values: { resizeDecorationsVisible }, R }) => R.updateState(componentMainActionsSetVisible(resizeDecorationsVisible))
            }),
            computePosition: makeUpdater({ 
                conditions: { 
                    componentMainActionsIsVisible: componentsMainActionsIsVisibleCondition,
                    componentPosition: componentPositionCondition.toPassive(),
                    componentResizeHandleNTop: componentResizeHandleNTopCondition.toPassive()
                },
                reducer: ({ values: { componentMainActionsIsVisible, componentPosition, componentResizeHandleNTop }, R, state }) => {
                    if (componentMainActionsIsVisible) {
                        return R.updateState(componentMainActionsSetPosition({ left: componentPosition.left, top: componentResizeHandleNTop - 10 - state.dimensions.height }))
                    }
                    return R.doNothing
                }
            })
        }
    })