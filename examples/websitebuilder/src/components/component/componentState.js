// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import {
    setPropDeepCompare,
    T,
    F,
    SingleTypeContainer
} from '../../utils';
import './component.css';

export opaque type ComponentState: { position: *, dimensions: *, selected: *, isMoving: *, isResizing: * } = {|
    position: LTPosition,
    dimensions: Dimensions, 
    selected: boolean,
    isMoving: boolean,
    isResizing: boolean
|}

const 
    _setComponentPosition = setPropDeepCompare<ComponentState, *>('position'),
    _setComponentDimensions = setPropDeepCompare<ComponentState, *>('dimensions')

type DimensionsUpdate = {| width?: number, height?: number |}
type PositionUpdate = {| left?: number, top?: number |}
export const
    setComponentIsMoving = setPropDeepCompare<ComponentState, *>('isMoving'),
    setComponentIsResizing = setPropDeepCompare<ComponentState, *>('isResizing'),
    setComponentSelected = setPropDeepCompare<ComponentState, *>('selected'),

    componentInitialState: ComponentState = { 
        position: { left: 100, top: 100 }, 
        dimensions: { width: 300, height: 200 },
        selected: false,
        isMoving: false,
        isResizing: false
    },
    setComponentIsMovingTrue = setComponentIsMoving(T),
    setComponentIsMovingFalse = setComponentIsMoving(F),
    setComponentIsResizingTrue = setComponentIsResizing(T),
    setComponentIsResizingFalse = setComponentIsResizing(F),
    adjustComponentPosition = ({ templateWidth, componentWidth }: {| templateWidth: number, componentWidth: number |}) =>
        (position: LTPosition): LTPosition => {
            let result = position
            if (result.top < 0) {
                result = { ...result, top: 0 }
            }

            if (result.left < 0) {
                result = { ...result, left: 0 }
            }

            const newRight = componentWidth + result.left
            if (newRight > templateWidth) {
                result = { ...result, left: templateWidth - componentWidth }
            }

            return result
        },
    adjustComponentDimensions = (dimensions: Dimensions): Dimensions => {
        let result = dimensions

        if (result.width < 1) {
            result = { ...result, width: 1 }
        }

        if (result.height < 1) {
            result = { ...result, height: 1 }
        }

        return result
    },
    updateComponentBBox = ({ bboxUpdate, templateWidth }: {| bboxUpdate: {| ...PositionUpdate, ...DimensionsUpdate |}, templateWidth: number |}) =>
        (componentState: ComponentState): ComponentState => {
             const 
                newDimensions = { 
                    width: bboxUpdate.width || componentState.dimensions.width,
                    height: bboxUpdate.height || componentState.dimensions.height
                },
                adjustedDimensions = adjustComponentDimensions(newDimensions),
                newPosition = { left: bboxUpdate.left || componentState.position.left, top:  bboxUpdate.top || componentState.position.top },
                adjustedPosition = adjustComponentPosition({ templateWidth, componentWidth: componentState.dimensions.width })(newPosition)
                
                let 
                    finalPosition = adjustedPosition,
                    finalDimensions = adjustedDimensions

                if (newDimensions !== adjustedDimensions) {
                    const adjustedHeightDiff = adjustedDimensions.height - newDimensions.height
                    if (adjustedHeightDiff !== 0 && adjustedPosition.top !== componentState.position.top) {
                        finalPosition = { ...finalPosition, top: adjustedPosition.top - adjustedHeightDiff } 
                    }
                    
                    const adjustedWidthDiff = adjustedDimensions.width - newDimensions.width
                    if (adjustedWidthDiff !== 0 && adjustedPosition.left !== componentState.position.left) {
                        finalPosition = { ...finalPosition, left: adjustedPosition.left - adjustedWidthDiff } 
                    }
                }

                if (newPosition !== adjustedPosition) {
                    const adjustedTopDiff = adjustedPosition.top - newPosition.top
                    if (adjustedTopDiff !== 0 && adjustedDimensions.height !== componentState.dimensions.height) {
                        finalDimensions = { ...finalDimensions, height: adjustedDimensions.height - adjustedTopDiff } 
                    }

                    const adjustedLeftDiff = adjustedPosition.left - newPosition.left
                    if (adjustedLeftDiff !== 0 && adjustedDimensions.width !== componentState.dimensions.width) {
                        finalDimensions = { ...finalDimensions, width: adjustedDimensions.width - adjustedTopDiff } 
                    }
                }

                // if left was adjusted and width changed, width should be readjusted

            return SingleTypeContainer(componentState)
                .pipe(_setComponentPosition(finalPosition))
                .pipe(_setComponentDimensions(finalDimensions))
                .value()
        }
    