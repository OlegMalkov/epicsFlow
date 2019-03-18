// @flow strict

import { type LTPosition, type RTPosition, type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";
import {
    setPropDeepCompare,
    areBBoxIntersect,
    computeBBoxFromPositionAndDimensions
} from '../../utils';
import { componentsMainActionsIsVisibleCondition, componentsMainActionsPositionWhenVisiblePassiveCondition, componentsMainActionsDimensionsWhenVisiblePassiveCondition } from '../componentMainActions/componentMainActionsACAC';
import { componentPositionPassiveCondition, componentDimensionsPassiveCondition, componentSelectedCondition } from '../component/componentACAC';
import { templateWidthPC } from '../template/templateACAC';
import { propertiesPanelNextPageButtonPress } from './propertiesPanelACAC';
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic';

const { makeUpdater, makeEpic, makeEpicCondition } = wsbE

export type PropertiesPanelState = {|
    visible: boolean,
    position: RTPosition,
    height: number
|}

const 
    setVisible = setPropDeepCompare<PropertiesPanelState, *>('visible'),
    setPosition = setPropDeepCompare<PropertiesPanelState, *>('position'),
    setHeight = setPropDeepCompare<PropertiesPanelState, *>('height')

export const PropertiesPanelWidth = 300

const 
    propertiesPanelEpicVat = 'PROPERTIES_PANEL_VAT',
    propertiesPanelCondition = makeEpicCondition<PropertiesPanelState>(propertiesPanelEpicVat),
    propertiesPanelVisibleCondition = propertiesPanelCondition.withSelectorKey('visible'),
    initialState = { position: { right: 0, top: -99999 }, height: 300, visible: false }


type GetPositionProps = {| workspaceViewportDimensions: Dimensions, propertiesPanelHeight: number |}
const
    MarginFromWorspaceViewportPx = 20,
    computeRightTopPosition = ({ workspaceViewportDimensions }: GetPositionProps): RTPosition => ({
        right: MarginFromWorspaceViewportPx,
        top: MarginFromWorspaceViewportPx
    }),
    computeRightBottomPosition = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: MarginFromWorspaceViewportPx,
        top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx
    }),
    computeRightForLeftCase = (workspaceWidth) => workspaceWidth - PropertiesPanelWidth - MarginFromWorspaceViewportPx,
    computeLeftBottomPosition = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: computeRightForLeftCase(workspaceViewportDimensions.width),
        top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx
    }),
    computeLeftTopPosition = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: computeRightForLeftCase(workspaceViewportDimensions.width),
        top: MarginFromWorspaceViewportPx
    }),
    possiblePositionsComputers = [
        computeRightTopPosition,
        computeRightBottomPosition,
        computeLeftBottomPosition,
        computeLeftTopPosition
    ],
    makeComputePropertiesPanelBBoxWithRespectToTemplateArea = ({
        workspaceWidth,
        templateWidth,
        propertiesPanelHeight
    }: {|
        workspaceWidth: number,
        templateWidth: number,
        propertiesPanelHeight: number
    |}) => (propertiesPanelPosition: RTPosition) => {
        // |  | template |  |
        // |   workspace    |
        // properties panel is inside workspace
        // template is centered within workspace

        const 
            templateOffset = (workspaceWidth - templateWidth) / 2,
            right = Math.floor((workspaceWidth - propertiesPanelPosition.right) - templateOffset),
            top = propertiesPanelPosition.top

        const result = {
            left: right - PropertiesPanelWidth,
            top,
            right,
            bottom: top + propertiesPanelHeight
        }

        console.log('result', result)
        return result
    }

export const
    propertiesPanelEpic = makeEpic<PropertiesPanelState, *>({ 
        vat: propertiesPanelEpicVat,
        initialState,
        updaters: {
            showHide: makeUpdater({
                conditions: { componentMainActionsVisible: componentsMainActionsIsVisibleCondition },
                reducer: ({ values: { componentMainActionsVisible }, R }) => R.updateState(setVisible(componentMainActionsVisible)),
            }),
            computePosition: makeUpdater({ 
                conditions: { 
                    propertiesPanelIsVisible: propertiesPanelVisibleCondition.withGuard<boolean>(visible => visible === true),
                    componentPosition: componentPositionPassiveCondition,
                    componentDimensions: componentDimensionsPassiveCondition,
                    componentsMainActionsPosition: componentsMainActionsPositionWhenVisiblePassiveCondition,
                    componentsMainActionsDimensions: componentsMainActionsDimensionsWhenVisiblePassiveCondition,
                    templateWidth: templateWidthPC,
                    workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions').toPassive()
                },
                reducer: ({ 
                    values: {
                        propertiesPanelIsVisible,
                        componentBBox,
                        workspaceViewportDimensions,
                        templateWidth,
                        componentPosition,
                        componentDimensions,
                        componentsMainActionsPosition,
                        componentsMainActionsDimensions
                    },
                    R,
                    state
                }) => {
                    if (propertiesPanelIsVisible) {
                        const
                            computePositionProps = { workspaceViewportDimensions, propertiesPanelHeight: state.height },
                            computePropertiesPanelBBoxWithRespectToTemplateArea = makeComputePropertiesPanelBBoxWithRespectToTemplateArea({
                                workspaceWidth: workspaceViewportDimensions.width,
                                templateWidth,
                                propertiesPanelHeight: state.height
                            }),
                            componentBBox = computeBBoxFromPositionAndDimensions(componentPosition, componentDimensions),
                            componentMainActionsBBox = computeBBoxFromPositionAndDimensions(componentsMainActionsPosition, componentsMainActionsDimensions),

                            intersectsWithComponent = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentBBox),
                            intersectsWithComponentsMainActions = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentMainActionsBBox)

                        const position = possiblePositionsComputers.reduce((position, positionComputer) => {
                            if (position) return position
                            const 
                                possiblePosition = positionComputer(computePositionProps),
                                possibleBBoxWithRespectToTemplateArea = computePropertiesPanelBBoxWithRespectToTemplateArea(possiblePosition)

                            if (
                                intersectsWithComponent(possibleBBoxWithRespectToTemplateArea)
                                || intersectsWithComponentsMainActions(possibleBBoxWithRespectToTemplateArea)
                            ) return null
                            
                            return possiblePosition
                        }, null) || computeRightTopPosition(computePositionProps)

                        return R.updateState(setPosition(position))
                    }
                    return R.doNothing
                }
            }),
            resetStateOnComponentDeselection: makeUpdater({
                conditions: { componentDeselected: componentSelectedCondition.withGuard<boolean>(selected => selected === false) },
                reducer: ({ R }) => R.updateState(() => initialState)
            }),
            setHeightForNextPage: makeUpdater({
                conditions: { propertiesPanelNextPagePressed: propertiesPanelNextPageButtonPress.condition },
                reducer: ({ R }) => R.updateState(setHeight(h => h + 50))
            })
        }
    })