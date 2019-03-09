// @flow strict

import { type LTPosition } from "../../types.js";
import { makeSetter } from "../../utils.js";
import { type DndIdle, dndTypeProgress, dndInitialState } from '../shared/dnd.js'


const setMovingDnd = makeSetter<ComponentScope, *>('movingDnd')    

export opaque type ComponentScope: { movingDnd: * } = {| movingDnd: DndIdle | {| type: typeof dndTypeProgress, componentStartPos: LTPosition, mouseStartPos: LTPosition |} |}

export const 
    componentInitialScope: ComponentScope = { movingDnd: dndInitialState },
    resetComponentMovingDnd = (s: ComponentScope): ComponentScope => setMovingDnd(dndInitialState)(s),
    initComponentMovingDnd = ({ componentStartPos, mouseStartPos }: {| componentStartPos: LTPosition, mouseStartPos: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setMovingDnd({ type: dndTypeProgress, componentStartPos, mouseStartPos })(s)