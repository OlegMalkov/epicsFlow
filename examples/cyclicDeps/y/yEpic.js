// @flow strict

import { type YStateType, initialYState } from './yState'
import { yUpdaters } from './yUpdaters'
import { yVat } from './yAAC'
import { createEpic } from '../../../src/epics'

export const y = createEpic<YStateType, empty, empty>({
	vat: yVat,
	initialState: initialYState,
	updaters: yUpdaters,
})
