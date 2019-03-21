// @flow strict

import { setPropDeepCompare } from '../../utils'

opaque type TemplateStateType: {| width: * |} = {| width: number |}

const templateInitialState: TemplateStateType = { width: 940 }
const setTemplateWidth = setPropDeepCompare<TemplateStateType, *>('width')

// eslint-disable-next-line import/group-exports
export type {
	TemplateStateType,
}

// eslint-disable-next-line import/group-exports
export {
	templateInitialState,
	setTemplateWidth,
}
