// @flow strict

import { type yState, initialYState } from './yState'
import { yUpdaters } from './yUpdaters'
import { yVat } from './yAAC'
import { CDE } from '../utils'

export const y = CDE.makeEpic<yState, empty>({
	vat: yVat,
	initialState: initialYState,
	updaters: yUpdaters
})