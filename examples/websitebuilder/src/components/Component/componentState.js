// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { makeSetterOnAnyChangeDeepCompare } from '../../utils';

export opaque type ComponentState: { position: *, dimensions: * } =  {| position: LTPosition, dimensions: Dimensions |}

export const 
    componentInitialState: ComponentState = { position: { left: 100, top: 100 }, dimensions: { width: 300, height: 200 } },
    setComponentPosition = makeSetterOnAnyChangeDeepCompare<ComponentState, *>('position'),
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
    }