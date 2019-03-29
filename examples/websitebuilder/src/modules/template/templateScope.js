// @flow strict

import { setProp } from '../../../../../src/utils'
import { dndInitialState } from '../shared/dnd'

type TemplateScopeType = {| dnd: typeof dndInitialState | {| mouseStartLeft: number, startWidth: number, type: 'progress' |} |}

const setDnd = setProp<TemplateScopeType, *>('dnd')
const templateInitialScope: TemplateScopeType = { dnd: dndInitialState }
const resetTemplateDnd = setDnd(dndInitialState)
const templateInitDnd = ({ startWidth, mouseStartLeft }: {| mouseStartLeft: number, startWidth: number |}) =>
	setDnd({ type: 'progress', startWidth, mouseStartLeft })


export {
	setDnd,
	templateInitialScope,
	resetTemplateDnd,
	templateInitDnd,
}
