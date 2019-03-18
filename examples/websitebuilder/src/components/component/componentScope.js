// @flow strict

import { type LTPosition, type Dimensions } from "../../types.js";
import { setProp } from "../../utils.js";
import { type DndIdle, dndTypeProgress, dndInitialState } from '../shared/dnd.js'


const 
    setMoveDnd = setProp<ComponentScope, *>('movingDnd'),
    setResizeDnd = setProp<ComponentScope, *>('resizeDnd')

export opaque type ComponentScope: { movingDnd: *, resizeDnd: * } = {| 
    movingDnd: DndIdle | {| type: typeof dndTypeProgress, componentStartPos: LTPosition, mouseStartPosition: LTPosition |},
    resizeDnd: DndIdle | {| type: typeof dndTypeProgress, componentStartDimensions: Dimensions, componentStartPosition: LTPosition, mouseStartPosition: LTPosition |}
|}

export const 
    componentInitialScope: ComponentScope = { 
        movingDnd: dndInitialState,  
        resizeDnd: dndInitialState
    },
    resetComponentMoveDnd = (s: ComponentScope): ComponentScope => setMoveDnd(dndInitialState)(s),
    resetComponentResizeDnd = (s: ComponentScope): ComponentScope => setResizeDnd(dndInitialState)(s),
    initComponentMoveDnd = ({ componentStartPos, mouseStartPosition }: {| componentStartPos: LTPosition, mouseStartPosition: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setMoveDnd({ type: dndTypeProgress, componentStartPos, mouseStartPosition })(s),
    initComponentResizeDnd = ({ componentStartDimensions, componentStartPosition, mouseStartPosition }: {| componentStartDimensions: Dimensions, componentStartPosition: LTPosition, mouseStartPosition: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setResizeDnd({ type: dndTypeProgress, componentStartDimensions, componentStartPosition, mouseStartPosition })(s)