// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import {
    setPropDeepCompare,
    setPathDeepCompare2,
    T,
    F
} from '../../utils';

export opaque type ComponentState: { position: *, dimensions: *, selected: *, isMoving: *, isResizing: * } =  {|
    position: LTPosition,
    dimensions: Dimensions, 
    selected: boolean,
    isMoving: boolean,
    isResizing: boolean
|}

export const
    setComponentIsMoving = setPropDeepCompare<ComponentState, *>('isMoving'),
    setComponentIsResizing = setPropDeepCompare<ComponentState, *>('isResizing'),
    setComponentPosition = setPropDeepCompare<ComponentState, *>('position'),
    setComponentTop = setPathDeepCompare2<ComponentState, *, *>('position', 'top'),
    setComponentLeft = setPathDeepCompare2<ComponentState, *, *>('position', 'left'),
    setComponentDimensions = setPropDeepCompare<ComponentState, *>('dimensions'),
    setComponentWidth = setPathDeepCompare2<ComponentState, *, *>('dimensions', 'width'),
    setComponentHeight = setPathDeepCompare2<ComponentState, *, *>('dimensions', 'height'),
    setComponentHeightTo1 = setComponentHeight(1),
    setComponentSelected = setPropDeepCompare<ComponentState, *>('selected'),
    setComponentTopToZero = setComponentTop(0),

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
    componentTopCanNotBeLessThan0Adjuster = (componentState: ComponentState): ComponentState => {
        if (componentState.position.top < 0) {
            return setComponentTopToZero(componentState)
        }
        return componentState
    },
    componentHeightCanNotBeLessThan1Adjuster = (componentState: ComponentState): ComponentState => {
        if (componentState.dimensions.height < 1) {
            return setComponentHeightTo1(componentState)
        }
        return componentState
    },
    componentWithinTemplateAdjuster = (templateWidth: number) => (componentState: ComponentState): ComponentState => {
        const { position: { left }, dimensions: { width } } = componentState
        let adjustedLeft
        if (left < 0) {
            adjustedLeft = 0
        }
        const right = width + left
        if (right > templateWidth) {
            adjustedLeft = templateWidth - width
        }

        if (adjustedLeft !== undefined && adjustedLeft !== componentState.position.left) {
            return setComponentLeft(adjustedLeft)(componentState)
        }

        return componentState
    }