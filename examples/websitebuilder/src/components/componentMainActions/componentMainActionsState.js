// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { setPropDeepCompare } from '../../utils';

export opaque type ComponentMainActionsState: {| visible: *, position: *, dimensions: * |} = {|
    visible: boolean,
    position: LTPosition,
    dimensions: Dimensions
|}


const _setPosition = setPropDeepCompare<ComponentMainActionsState, *>('position')

export const
    componentMainActionsInitialState: ComponentMainActionsState = { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false },
    componentMainActionsSetVisible = setPropDeepCompare<ComponentMainActionsState, *>('visible'),
    componentMainActionsSetPosition = (position: LTPosition) => {
        let { left, top } = position

        const minTop = 0
        if (top < minTop) {
            top = minTop
        }

        const minLeft = 0
        if (left < minLeft) {
            left = minLeft
        }

        return _setPosition({ top, left })
    }