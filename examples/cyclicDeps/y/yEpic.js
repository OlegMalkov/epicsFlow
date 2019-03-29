// @flow strict

import { initialYState } from './yState'
import { yUpdaters } from './yUpdaters'
import { yVat } from './yAAC'
import { createEpic } from '../../../src/epics'

export const y = createEpic<typeof initialYState, empty, empty>({
	vat: yVat,
	initialState: initialYState,
	updaters: yUpdaters,
})
