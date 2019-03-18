// @flow strict

import { type LTPosition, type Dimensions } from '../../types'
import { setPropDeepCompare } from '../../utils';

export opaque type ComponentMainActionsState: {| visible: *, position: *, dimensions: * |} = {|
    visible: boolean,
    position: LTPosition,
    dimensions: Dimensions
|}


export const
    componentMainActionsInitialState: ComponentMainActionsState = { position: { left: 0, top: -99999 }, dimensions: { width: 500, height: 30 }, visible: false },
    componentMainActionsSetVisible = setPropDeepCompare<ComponentMainActionsState, *>('visible'),
    componentMainActionsSetPosition = setPropDeepCompare<ComponentMainActionsState, *>('position')