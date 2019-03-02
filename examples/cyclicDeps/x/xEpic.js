// @flow strict

import { type xState, initialXState } from './xState'
import { xUpdaters } from './xUpdaters'
import { xVat } from './xAAC'
import { CDE } from '../utils'


export const x = CDE.makeEpic<xState, empty>({
	vat: xVat,
	initialState: initialXState,
	updaters: xUpdaters
})