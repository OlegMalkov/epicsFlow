// @flow strict

import { type LTPosition } from "../../types";
import { makeSetter } from "../../utils";

export opaque type ComponentScope: { dnd: * } = {| dnd: {| type: 'idle' |} | {| type: 'progress', componentStartPos: LTPosition, mouseStartPos: LTPosition |} |}

const setDnd = makeSetter<ComponentScope, *>('dnd')

export const 
    dndInitialState = { type: 'idle' },
    componentInitialScope: ComponentScope = { dnd: dndInitialState },
    resetComponentDnd = (s: ComponentScope): ComponentScope => setDnd(dndInitialState)(s),
    initComponentDnd = ({ componentStartPos, mouseStartPos }: {| componentStartPos: LTPosition, mouseStartPos: LTPosition |}) => 
        (s: ComponentScope): ComponentScope => setDnd({ type: 'progress', componentStartPos, mouseStartPos })(s)