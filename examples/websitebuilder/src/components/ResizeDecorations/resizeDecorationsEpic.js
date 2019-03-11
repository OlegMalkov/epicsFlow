// @flow strict

import { type ResizeHandles, initialResizeHandlesState } from '../Component/componentState'
import { wsbE } from "../../wsbE";
import { componentCondition, componentIsMovingCondition, componentSelectedCondition, componentIsResizingCondition, componentResizeNMouseDown } from '../Component/componentACAC';
import { setProp } from '../../utils';

const { makeUpdater, makeEpic } = wsbE

export type ResizeDecorationsState = {|
    visible: boolean,
    activeHandleKey: $Keys<ResizeHandles> | null,
    handles: ResizeHandles
|}

const 
    setHandles = setProp<ResizeDecorationsState, *>('handles'),
    setVisible = setProp<ResizeDecorationsState, *>('visible'),
    setActiveHandleKey = setProp<ResizeDecorationsState, *>('activeHandleKey'),
    resetActiveHandleKey = setActiveHandleKey(null)

export const
    resizeDecorationsEpic = makeEpic<ResizeDecorationsState, *>({ 
        vat: 'COMPONENT_RESIZE_DECORATIONS',
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
            syncHandlesFromComponent: makeUpdater({
                conditions: { resizeHandles: componentCondition.withSelectorKey('handles').withSelectorKey('resize') },
                reducer: ({ values: { resizeHandles }, R }) => R.updateState(setHandles(resizeHandles))
            }),
            computeVisibile: makeUpdater({
                conditions: { 
                    componentIsMoving: componentIsMovingCondition,
                    componentIsResizing: componentIsResizingCondition,
                    componentSelected: componentSelectedCondition
                },
                reducer: ({ values: { componentIsMoving, componentIsResizing, componentSelected }, R }) =>
                    R.updateState(setVisible(componentSelected && !componentIsMoving && !componentIsResizing))
            })
        }
    })