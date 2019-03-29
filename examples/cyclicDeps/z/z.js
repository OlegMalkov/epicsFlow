// @flow strict

import { initialZState } from './zState'
import { zCondition } from './zVAT'
import { zUpdaters } from './zUpdaters'
import { createEpic } from '../../../src/epics'

const z = createEpic<typeof initialZState, empty, empty>({
	vat: zCondition.actionType,
	initialState: initialZState,
	updaters: zUpdaters,
})

export { z }
