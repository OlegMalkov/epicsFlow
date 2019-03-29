// @flow strict
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type TemplateStateType: {| width: * |} = {| width: number |}

const templateInitialState: TemplateStateType = { width: 940 }
const setTemplateWidth = setPropDeepCompare<TemplateStateType, *>('width')

export {
	templateInitialState,
	setTemplateWidth,
}
