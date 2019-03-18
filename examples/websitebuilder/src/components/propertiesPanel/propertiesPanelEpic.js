// @flow strict

import { type DndIdle, dndTypeProgress, dndInitialState, dndTypeIdle } from '../shared/dnd'
import { type RTPosition, type LTPosition, type Dimensions } from '../../types'
import { windowMousePositionCondition, keyboardEscDownCondition, windowMouseUp } from '../../globalACAC'
import { wsbE } from "../../wsbE";
import {
    setPropDeepCompare,
    areBBoxIntersect,
    computeBBoxFromPositionAndDimensions
} from '../../utils';
import { componentsMainActionsIsVisibleCondition, componentsMainActionsPositionWhenVisiblePassiveCondition, componentsMainActionsDimensionsWhenVisiblePassiveCondition } from '../componentMainActions/componentMainActionsACAC';
import { componentPositionPassiveCondition, componentDimensionsPassiveCondition, componentSelectedCondition } from '../component/componentACAC';
import { templateWidthPC } from '../template/templateACAC';
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACAC';
import { workspaceViewportEpic, } from '../workspace/workspaceViewportEpic';
import { workspaceScroll } from '../workspace/workspaceACAC';

const { makeUpdater, makeEpicWithScope, makeEpicCondition } = wsbE

export type PropertiesPanelState = {|
    visible: boolean,
    positonRT: RTPosition,
    height: number
|}

type PropertiesPanelScope = {|
    moveDnd: DndIdle | {| type: typeof dndTypeProgress, propertiesPanelStartPosition: RTPosition, mouseStartPosition: LTPosition |}    
|}

const 
    MarginFromWorspaceViewportPx = 20,

    setVisible = setPropDeepCompare<PropertiesPanelState, *>('visible'),
    _setPosition = setPropDeepCompare<PropertiesPanelState, *>('positonRT'),
    setPosition = ({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight }) => {
        let { right, top } = propertiesPanelPositionRT

        const maxRight = workspaceViewportDimensions.width - PropertiesPanelWidth / 2
        if (right > maxRight) { 
            right = maxRight
        }
        const minRight = -(PropertiesPanelWidth / 2)
        if (right < minRight) {
            right = minRight
        }
        const maxTop = workspaceViewportDimensions.height - propertiesPanelHeight / 2
        if (top > maxTop) {
            top = maxTop
        }
        const minTop = 0
        if (top < minTop) {
            top = minTop
        }

        return _setPosition({ top, right })
    },
    setHeight = setPropDeepCompare<PropertiesPanelState, *>('height'),
    setMoveDnd = setPropDeepCompare<PropertiesPanelScope, *>('moveDnd'),
    initMoveDnd = ({ propertiesPanelStartPosition, mouseStartPosition }) => setMoveDnd({ type: dndTypeProgress, propertiesPanelStartPosition, mouseStartPosition }),
    resetMoveDnd = setMoveDnd(dndInitialState)

export const PropertiesPanelWidth = 300

const 
    propertiesPanelEpicVat = 'PROPERTIES_PANEL_VAT',
    propertiesPanelCondition = makeEpicCondition<PropertiesPanelState>(propertiesPanelEpicVat),
    propertiesPanelVisibleCondition = propertiesPanelCondition.withSelectorKey('visible'),
    initialState = { positonRT: { right: 0, top: -99999 }, height: 300, visible: false }


type GetPositionProps = {| workspaceViewportDimensions: Dimensions, propertiesPanelHeight: number |}
const
    computeRightTopPositionRT = ({ workspaceViewportDimensions }: GetPositionProps): RTPosition => ({
        right: MarginFromWorspaceViewportPx,
        top: MarginFromWorspaceViewportPx
    }),
    computeRightBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: MarginFromWorspaceViewportPx,
        top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx
    }),
    computeRightForLeftCase = (workspaceWidth) => workspaceWidth - PropertiesPanelWidth - MarginFromWorspaceViewportPx,
    computeLeftBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: computeRightForLeftCase(workspaceViewportDimensions.width),
        top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx
    }),
    computeLeftTopPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionProps): RTPosition => ({
        right: computeRightForLeftCase(workspaceViewportDimensions.width),
        top: MarginFromWorspaceViewportPx
    }),
    possiblePositionsRTComputers = [
        computeRightTopPositionRT,
        computeRightBottomPositionRT,
        computeLeftBottomPositionRT,
        computeLeftTopPositionRT
    ],
    makeComputePropertiesPanelBBoxWithRespectToTemplateArea = ({
        workspaceWidth,
        templateWidth,
        propertiesPanelHeight,
        workspaceScroll
    }: {|
        workspaceWidth: number,
        templateWidth: number,
        propertiesPanelHeight: number,
        workspaceScroll: { top: number }
    |}) => (propertiesPanelPositionRT: RTPosition) => {
        // |  | template |  |
        // |   workspace    |
        // properties panel is inside workspace
        // template is centered within workspace

        const 
            templateOffset = (workspaceWidth - templateWidth) / 2,
            right = Math.floor((workspaceWidth - propertiesPanelPositionRT.right) - templateOffset),
            top = propertiesPanelPositionRT.top + workspaceScroll.top

        const result = {
            left: right - PropertiesPanelWidth,
            top,
            right,
            bottom: top + propertiesPanelHeight
        }

        return result
    }

export const
    propertiesPanelEpic = makeEpicWithScope<PropertiesPanelState, PropertiesPanelScope, *>({ 
        vat: propertiesPanelEpicVat,
        initialState,
        initialScope: { moveDnd: dndInitialState },
        updaters: {
            showHide: makeUpdater({
                conditions: { componentMainActionsVisible: componentsMainActionsIsVisibleCondition },
                reducer: ({ values: { componentMainActionsVisible }, R }) => R.updateState(setVisible(componentMainActionsVisible)),
            }),
            computePosition: makeUpdater({ 
                conditions: {
                    workspaceScroll: workspaceScroll.condition.toPassive(),
                    componentPosition: componentPositionPassiveCondition,
                    componentDimensions: componentDimensionsPassiveCondition,
                    componentsMainActionsPosition: componentsMainActionsPositionWhenVisiblePassiveCondition,
                    componentsMainActionsDimensions: componentsMainActionsDimensionsWhenVisiblePassiveCondition,
                    templateWidth: templateWidthPC,
                    workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions').toPassive(),

                    propertiesPanelIsVisible: propertiesPanelVisibleCondition.withGuard<boolean>(visible => visible === true)
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
                        componentsMainActionsDimensions,
                        workspaceScroll
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
                                propertiesPanelHeight: state.height,
                                workspaceScroll
                            }),
                            componentBBox = computeBBoxFromPositionAndDimensions(componentPosition, componentDimensions),
                            componentMainActionsBBox = computeBBoxFromPositionAndDimensions(componentsMainActionsPosition, componentsMainActionsDimensions),

                            intersectsWithComponent = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentBBox),
                            intersectsWithComponentsMainActions = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentMainActionsBBox)

                        const propertiesPanelPositionRT = possiblePositionsRTComputers.reduce((positonRT, positionRTComputer) => {
                            if (positonRT) return positonRT
                            const 
                                possiblePositionRT = positionRTComputer(computePositionProps),
                                possibleBBoxWithRespectToTemplateArea = computePropertiesPanelBBoxWithRespectToTemplateArea(possiblePositionRT)

                            if (
                                intersectsWithComponent(possibleBBoxWithRespectToTemplateArea)
                                || intersectsWithComponentsMainActions(possibleBBoxWithRespectToTemplateArea)
                            ) return null
                            
                            return possiblePositionRT
                        }, null) || computeRightTopPositionRT(computePositionProps)

                        return R.updateState(setPosition({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight: state.height }))
                    }
                    return R.doNothing
                }
            }),
            moveDnd: makeUpdater({
                conditions: { 
                  workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions').toPassive(),

                  propertiesPanelDragMouseDown: propertiesPanelDragMouseDown.condition,
                  mousePosition: windowMousePositionCondition,
                  cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
                  mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown'])
                },
                reducer: ({ 
                  state,
                  scope,
                  values: { mousePosition, workspaceViewportDimensions }, 
                  changedActiveConditionsKeysMap: { cancel, mouseUp }, 
                  R
                }) => {
                  if (cancel) {
                    if (scope.moveDnd.type === dndTypeProgress) {
                      const { propertiesPanelStartPosition } = scope.moveDnd
                      return R
                          .updateState(_setPosition(propertiesPanelStartPosition))
                          .updateScope(resetMoveDnd)
                    }
                    return R.doNothing
                  }
        
                  if (mouseUp) {
                    return R.updateScope(resetMoveDnd)
                  }
        
                  if (scope.moveDnd.type === dndTypeIdle) {
                    return R.updateScope(initMoveDnd({ propertiesPanelStartPosition: state.positonRT, mouseStartPosition: mousePosition }))
                  }
        
                  const 
                    { propertiesPanelStartPosition, mouseStartPosition } = scope.moveDnd,
                    leftDiff = mouseStartPosition.left - mousePosition.left,
                    topDiff = mouseStartPosition.top - mousePosition.top
        
                  return R.updateState(setPosition({ 
                        workspaceViewportDimensions,
                        propertiesPanelPositionRT: { right: propertiesPanelStartPosition.right + leftDiff, top: propertiesPanelStartPosition.top - topDiff },
                        propertiesPanelHeight: state.height
                    }))
                }
            }),
            validateAndFixPosition: makeUpdater({
                conditions: {
                    workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions')
                },
                reducer: ({ values: { workspaceViewportDimensions }, R, state }) => 
                    R.updateState(
                        setPosition({ 
                            workspaceViewportDimensions,
                            propertiesPanelPositionRT: state.positonRT,
                            propertiesPanelHeight: state.height
                        })
                    )
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

export {
    makeComputePropertiesPanelBBoxWithRespectToTemplateArea
}