// @flow strict

import { type LTPosition, type Dimensions } from "../../types.js";
import { setProp } from "../../utils.js";
import { type DndIdle, dndTypeProgress, dndInitialState } from '../shared/dnd.js'


const 
    setMoveDnd = setProp<ComponentScope, *>('movingDnd'),
    setResizeDnd = setProp<ComponentScope, *>('resizeDnd')

export opaque type ComponentScope: { movingDnd: *, resizeDnd: * } = {| 
    movingDnd: DndIdle | {| type: typeof dndTypeProgress, componentStartPos: LTPosition, mouseStartPos: LTPosition |},
    resizeDnd: DndIdle | {| type: typeof dndTypeProgress, componentStartDimensions: Dimensions, componentStartPosition: LTPosition, mouseStartPos: LTPosition |}
|}

export const 
    componentInitialScope: ComponentScope = { 
        movingDnd: dndInitialState,  
        resizeDnd: dndInitialState
    },
    resetComponentMoveDnd = (s: ComponentScope): ComponentScope => setMoveDnd(dndInitialState)(s),
    resetComponentResizeDnd = (s: ComponentScope): ComponentScope => setResizeDnd(dndInitialState)(s),
    initComponentMoveDnd = ({ componentStartPos, mouseStartPos }: {| componentStartPos: LTPosition, mouseStartPos: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setMoveDnd({ type: dndTypeProgress, componentStartPos, mouseStartPos })(s),
    initComponentResizeDnd = ({ componentStartDimensions, componentStartPosition, mouseStartPos }: {| componentStartDimensions: Dimensions, componentStartPosition: LTPosition, mouseStartPos: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setResizeDnd({ type: dndTypeProgress, componentStartDimensions, componentStartPosition, mouseStartPos })(s)