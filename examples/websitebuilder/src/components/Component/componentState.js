// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import {
    setPropDeepCompare,
    setPathDeepCompare2,
    T,
    F,
    setPathDeepCompare4
} from '../../utils';

export type ResizeHandles = {|
    n: {| position: LTPosition, dimensions: Dimensions |}
|}

export opaque type ComponentState: { position: *, dimensions: *, handles: *, selected: *, isMoving: *, isResizing: * } =  {|
    position: LTPosition,
    dimensions: Dimensions, 
    handles: {
        resize: ResizeHandles
    },
    selected: boolean,
    isMoving: boolean,
    isResizing: boolean
|}

const 
    ResizeHandleSidePx = 20,
    HalfResizeHandleSidePx = ResizeHandleSidePx / 2

export const
    setComponentHandles = setPropDeepCompare<ComponentState, *>('handles'),
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
    setResizeNHandlePosition = setPathDeepCompare4<ComponentState, *, *, *, *>('handles', 'resize', 'n', 'position'),

    handleInitialPosition: LTPosition = { left: 0, top: -99999 },
    handleInitialDimensions: Dimensions = { width: ResizeHandleSidePx, height: ResizeHandleSidePx },
    initialResizeHandlesState = { n: { position: handleInitialPosition, dimensions: handleInitialDimensions } },
    componentInitialState: ComponentState = { 
        position: { left: 100, top: 100 }, 
        dimensions: { width: 300, height: 200 },
        handles: {
            resize: initialResizeHandlesState
        },
        selected: false,
        isMoving: false,
        isResizing: false
    },
    resetHandles = setComponentHandles(componentInitialState.handles),
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
    },
    // Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
    verticalResizeHandleTreshold = 50,
    computeHandlesPosition = (state: ComponentState): ComponentState => {
        return setResizeNHandlePosition({
            left: state.position.left + state.dimensions.width / 2 - HalfResizeHandleSidePx,
            top: state.position.top - HalfResizeHandleSidePx - Math.max(0, (50 - state.dimensions.height))
        })(state)
    } 