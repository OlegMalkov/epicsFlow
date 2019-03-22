// @flow strict

import { type YStateType, initialYState } from './yState'
import { yUpdaters } from './yUpdaters'
import { yVat } from './yAAC'
import { makeEpic } from '../../../src/epics'

export const y = makeEpic<YStateType, empty>({
	vat: yVat,
	initialState: initialYState,
	updaters: yUpdaters,
})
