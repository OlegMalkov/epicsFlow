// @flow strict

import { type ZStateType, initialZState } from './zState'
import { zCondition } from './zVCET'
import { zUpdaters } from './zUpdaters'
import { createEpic } from '../../../src/epics'

const z = createEpic<ZStateType, empty, empty>({
	vcet: zCondition.msgType,
	initialState: initialZState,
	updaters: zUpdaters,
})

export { z }
