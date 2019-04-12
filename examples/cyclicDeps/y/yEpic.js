// @flow strict

import { type YStateType, initialYState } from './yState'
import { yUpdaters } from './yUpdaters'
import { yVcet } from './yAAC'
import { createEpic } from '../../../src/epics'

export const y = createEpic<YStateType, empty, empty>({
	vcet: yVcet,
	initialState: initialYState,
	updaters: yUpdaters,
})
