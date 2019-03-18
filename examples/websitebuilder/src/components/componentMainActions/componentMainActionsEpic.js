// @flow strict

import { wsbE } from "../../wsbE";
import { componentPositionCondition, componentRightPassiveCondition } from '../component/componentACAC';
import { componentResizeHandleNTopCondition, componentResizeDecorationsVisibleCondition } from '../componentResizeDecorations/componentResizeDecorationsEpic';
import { componentMainActionsInitialState, type ComponentMainActionsState, componentMainActionsSetVisible, componentMainActionsSetPosition } from './componentMainActionsState';
import { componentMainActionsEpicVat, componentsMainActionsIsVisibleCondition } from './componentMainActionsACAC';
import {
    propertiesPanelEpic,
    type PropertiesPanelState,
    makeComputePropertiesPanelBBoxWithRespectToTemplateArea
} from '../propertiesPanel/propertiesPanelEpic';
import { workspaceViewportEpic } from "../workspace/workspaceViewportEpic";
import { templateWidthCondition } from "../template/templateACAC";
import { areBBoxIntersect, computeBBoxFromPositionAndDimensions } from '../../utils';
import { workspaceScroll } from "../workspace/workspaceACAC";

const { makeUpdater, makeEpic } = wsbE

const
    computeLeftAlignedPosition = ({ componentLeft, componentResizeHandleNTop, componentMainActionsHeight }) => 
        ({ left: componentLeft, top: componentResizeHandleNTop - 10 - componentMainActionsHeight }),
    computeRightAlignedPosition = ({ componentRight, componentResizeHandleNTop, componentMainActionsDimensions }) => 
        ({ left: componentRight - componentMainActionsDimensions.width, top: componentResizeHandleNTop - 10 - componentMainActionsDimensions.height }),
    componentResizeHandleNTopPassiveCondition = componentResizeHandleNTopCondition.toPassive()

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
                    componentResizeHandleNTop: componentResizeHandleNTopPassiveCondition
                },
                reducer: ({ values: { componentMainActionsIsVisible, componentPosition, componentResizeHandleNTop, propertiesPanelRTPositionAndHeight }, R, state }) => {
                    if (componentMainActionsIsVisible) {
                        const position = computeLeftAlignedPosition({ 
                            componentLeft: componentPosition.left,
                            componentResizeHandleNTop,
                            componentMainActionsHeight: state.dimensions.height
                        })

                        return R.updateState(componentMainActionsSetPosition(position))
                    }
                    return R.doNothing
                }
            }),
            adjustPositionIfOverlapWithPropertiesPanel: makeUpdater({
                conditions: {
                    componentRight: componentRightPassiveCondition,
                    componentResizeHandleNTop: componentResizeHandleNTopPassiveCondition,
                    
                    templateWidth: templateWidthCondition,
                    workspaceWidth: workspaceViewportEpic.condition.wsk('dimensions').wsk('width'),
                    propertiesPanelRTPositionAndHeight: propertiesPanelEpic.condition.wg<PropertiesPanelState>(pp => pp.visible).ws(pp => ({ rtPosition: pp.positonRT, height: pp.height })),
                    workspaceScroll: workspaceScroll.condition,
                    resetPropertiesPanelRTPositionAndHeightWhenPropPanelIsNotVisible: propertiesPanelEpic.condition.wg<PropertiesPanelState>(pp => !pp.visible).resetConditionsByKey(['propertiesPanelRTPositionAndHeight']).toOptional()
                },
                reducer: ({ values: { workspaceScroll, componentRight, componentResizeHandleNTop, propertiesPanelRTPositionAndHeight, workspaceWidth, templateWidth }, R, state }) => {
                    const propertiesPanelBBoxWithRespectToTemplateArea = makeComputePropertiesPanelBBoxWithRespectToTemplateArea({
                        workspaceWidth,
                        templateWidth,
                        propertiesPanelHeight: propertiesPanelRTPositionAndHeight.height,
                        workspaceScroll
                    })(propertiesPanelRTPositionAndHeight.rtPosition)

                    const componentMainActionsBBox = computeBBoxFromPositionAndDimensions(state.position, state.dimensions)

                    if (areBBoxIntersect(propertiesPanelBBoxWithRespectToTemplateArea, componentMainActionsBBox)) {
                        const position = computeRightAlignedPosition({ 
                            componentRight,
                            componentResizeHandleNTop,
                            componentMainActionsDimensions: state.dimensions
                        })
                        return R.updateState(componentMainActionsSetPosition(position))
                    }

                    return R.doNothing
                }
            })
        }
    })