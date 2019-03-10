// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { makeSetterOnAnyChangeDeepCompare } from '../../utils';

export type ResizeHandles = {|
    n: {| position: LTPosition, dimensions: Dimensions |}
|}

export opaque type ComponentState: { position: *, dimensions: *, handles: *, selected: * } =  {|
    position: LTPosition,
    dimensions: Dimensions, 
    handles: {
        resize: ResizeHandles | null
    },
    selected: boolean
|}

const 
    ResizeHandleSidePx = 20,
    HalfResizeHandleSidePx = ResizeHandleSidePx / 2

const
    setComponentHandles = makeSetterOnAnyChangeDeepCompare<ComponentState, *>('handles')

export const 
    componentInitialState: ComponentState = { 
        position: { left: 100, top: 100 }, 
        dimensions: { width: 300, height: 200 },
        handles: {
            resize: null
        },
        selected: false
    },
    setComponentPosition = makeSetterOnAnyChangeDeepCompare<ComponentState, *>('position'),
    setComponentSelected = makeSetterOnAnyChangeDeepCompare<ComponentState, *>('selected'),
    componentWithinTemplateAdjuster = (templateWidth: number) => (componentState: ComponentState): ComponentState => {
        const { position: { left, top }, dimensions: { width } } = componentState
        let adjustedLeft
        if (left < 0) {
            adjustedLeft = 0
        }
        const right = width + left
        if (right > templateWidth) {
            adjustedLeft = templateWidth - width
        }

        let adjustedTop

        if (top < 0) {
            adjustedTop = 0
        }

        let nextState = componentState
        if (adjustedLeft !== undefined && adjustedLeft !== nextState.position.left) {
            nextState = { ...nextState, position: { ...nextState.position, left: adjustedLeft } }
        }
        if (adjustedTop !== undefined && adjustedTop !== nextState.position.top) {
            nextState = { ...nextState, position: { ...nextState.position, top: adjustedTop } }
        }
        return nextState
    },
    // Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
    verticalResizeHandleTreshold = 50,
    computeHandles = (state: ComponentState): ComponentState => {
        if (!state.selected) {
            return setComponentHandles(componentInitialState.handles)(state)
        }
        
        const nextResizeNHandle = { 
            position: {
                left: (state.position.left + state.dimensions.width) / 2 - HalfResizeHandleSidePx,
                top: state.position.top - 20 - Math.max(0, (50 - state.dimensions.height))
            },
            dimensions: {
                width: HalfResizeHandleSidePx,
                height: HalfResizeHandleSidePx
            }
        }

        return setComponentHandles({ resize: { n: nextResizeNHandle } })(state)
    } 