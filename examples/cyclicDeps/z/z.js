// @flow strict

import { type ZStateType, initialZState } from './zState'
import { zCondition } from './zVAT'
import { zUpdaters } from './zUpdaters'
import { makeEpic } from '../../../src/epics'

const z = makeEpic<ZStateType, empty>({
	vat: zCondition.actionType,
	initialState: initialZState,
	updaters: zUpdaters,
})

export { z }
