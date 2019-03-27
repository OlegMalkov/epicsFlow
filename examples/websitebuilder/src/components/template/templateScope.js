// @flow strict
import { setProp } from '../../../../../src/utils'

type TemplateScopeType = {| dnd: {| type: 'idle' |} | {| mouseStartLeft: number, startWidth: number, type: 'progress' |} |}

const setDnd = setProp<TemplateScopeType, *>('dnd')
const dndInitialState = { type: 'idle' }
const templateInitialScope = { dnd: dndInitialState }
const resetTemplateDnd = setDnd(dndInitialState)
const templateInitDnd = ({ startWidth, mouseStartLeft }: {| mouseStartLeft: number, startWidth: number |}) =>
	setDnd({ type: 'progress', startWidth, mouseStartLeft })


// eslint-disable-next-line import/group-exports
export type {
	TemplateScopeType,
}

// eslint-disable-next-line import/group-exports
export {
	setDnd,
	dndInitialState,
	templateInitialScope,
	resetTemplateDnd,
	templateInitDnd,
}
