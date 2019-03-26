// @flow strict

import { type ZStateType, initialZState } from './zState'
import { zCondition } from './zVAT'
import { zUpdaters } from './zUpdaters'
import { createEpic } from '../../../src/epics'

const z = createEpic<ZStateType, empty, empty>({
	vat: zCondition.actionType,
	initialState: initialZState,
	updaters: zUpdaters,
})

export { z }
