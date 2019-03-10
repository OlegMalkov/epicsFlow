// @flow strict
import { setProp } from '../../utils';

export type TemplateScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', startWidth: number, mouseStartLeft: number |} |}

const setDnd = setProp<TemplateScope, *>('dnd')

export const
    dndInitialState = { type: 'idle' },
    templateInitialScope = { dnd: dndInitialState },
    resetTemplateDnd = setDnd(dndInitialState),
    templateInitDnd = ({ startWidth, mouseStartLeft }: {| startWidth: number, mouseStartLeft: number |}) => 
        setDnd({ type: 'progress', startWidth, mouseStartLeft })