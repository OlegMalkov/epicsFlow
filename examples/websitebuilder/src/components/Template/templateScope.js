// @flow strict
import { makeSetter } from '../../utils';

export type TemplateScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', startWidth: number, mouseStartLeft: number |} |}

const setDnd = makeSetter<TemplateScope, *>('dnd')

export const
    dndInitialState = { type: 'idle' },
    templateInitialScope = { dnd: dndInitialState },
    resetTemplateDnd = setDnd(dndInitialState),
    templateInitDnd = ({ startWidth, mouseStartLeft }: {| startWidth: number, mouseStartLeft: number |}) => 
        setDnd({ type: 'progress', startWidth, mouseStartLeft })