// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";
import { componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentResizeNMouseDown, componentPositionCondition, componentDimensionsCondition } from '../Component/componentACAC';
import { setProp, setPathDeepCompare3 } from '../../utils';

const { makeUpdater, makeEpic, makeEpicCondition } = wsbE

type ResizeHandles = {|
    n: {| position: LTPosition, dimensions: Dimensions |}
|}

export type ResizeDecorationsState = {|
    visible: boolean,
    activeHandleKey: $Keys<ResizeHandles> | null,
    handles: ResizeHandles
|}

const 
    ResizeHandleSidePx = 20,
    HalfResizeHandleSidePx = ResizeHandleSidePx / 2,

    setVisible = setProp<ResizeDecorationsState, *>('visible'),
    setActiveHandleKey = setProp<ResizeDecorationsState, *>('activeHandleKey'),
    resetActiveHandleKey = setActiveHandleKey(null),
    setResizeNHandlePosition = setPathDeepCompare3<ResizeDecorationsState, *, *, *>('handles', 'n', 'position'),

    handleInitialPosition: LTPosition = { left: 0, top: -99999 },
    handleInitialDimensions: Dimensions = { width: ResizeHandleSidePx, height: ResizeHandleSidePx },
    initialResizeHandlesState = { n: { position: handleInitialPosition, dimensions: handleInitialDimensions } },

    // Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
    verticalResizeHandleTreshold = 50

const 
    resizeDecorationsEpicVat = 'COMPONENT_RESIZE_DECORATIONS',
    resizeDecorationsCondition = makeEpicCondition<ResizeDecorationsState>(resizeDecorationsEpicVat)

export const
    resizeDecorationsEpic = makeEpic<ResizeDecorationsState, *>({ 
        vat: resizeDecorationsEpicVat,
        initialState: { activeHandleKey: null, handles: initialResizeHandlesState, visible: false },
        updaters: {
            detectActiveHandleKey: makeUpdater({
                conditions: { 
                    nMouseDown: componentResizeNMouseDown.condition.toOptional(),
                    componentIsResizing: componentIsResizingCondition.resetConditionsByKeyAfterReducerCall(['nMouseDown']),                    
                },
                reducer: ({ values: { nMouseDown, componentIsResizing }, R, changedActiveConditionsKeysMap }) => {
                    if (changedActiveConditionsKeysMap.componentIsResizing && componentIsResizing === false) {
                        return R.updateState(resetActiveHandleKey)
                    }

                    if (nMouseDown) {
                        return R.updateState(setActiveHandleKey('n'))
                    }

                    return R.doNothing
                }
            }),
            computeVisibile: makeUpdater({
                conditions: { 
                    componentIsMoving: componentIsMovingCondition,
                    componentIsResizing: componentIsResizingCondition,
                    componentSelected: componentSelectedCondition
                },
                reducer: ({ values: { componentIsMoving, componentIsResizing, componentSelected }, R }) =>
                    R.updateState(setVisible(componentSelected && !componentIsMoving && !componentIsResizing))
            }),
            computePositionsForHandles: makeUpdater({
                conditions: { 
                    componentPosition: componentPositionCondition,
                    componentDimensions: componentDimensionsCondition,
                    isVisible: resizeDecorationsCondition.withSelectorKey('visible'),
                    activeHandleKey: resizeDecorationsCondition.withSelectorKey('activeHandleKey')
                },
                reducer: ({ values: { componentPosition, componentDimensions, isVisible, activeHandleKey }, R }) => {
                    if (isVisible || activeHandleKey === 'n') {
                        return R.updateState(setResizeNHandlePosition({
                            left: componentPosition.left + componentDimensions.width / 2 - HalfResizeHandleSidePx,
                            top: componentPosition.top - HalfResizeHandleSidePx - Math.max(0, (verticalResizeHandleTreshold - componentDimensions.height))
                        }))
                    }
                    return R.doNothing
                }
            })
        }
    })