// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { makeSetter } from '../../utils';

export opaque type ComponentState: { position: LTPosition, dimensions: Dimensions } =  {| position: LTPosition, dimensions: Dimensions |}

export const 
    componentInitialState: ComponentState = { position: { left: 100, top: 100 }, dimensions: { width: 300, height: 200 } },
    setPosition = makeSetter<ComponentState, *>('position'),
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
        if (adjustedLeft !== undefined) {
            nextState = { ...nextState, position: { ...nextState.position, left: adjustedLeft } }
        }
        if (adjustedTop !== undefined) {
            nextState = { ...nextState, position: { ...nextState.position, top: adjustedTop } }
        }
        return nextState
    }