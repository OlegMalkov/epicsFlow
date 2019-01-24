// @flow

import { type zState, initialZState } from './zState'
import { makeEpic } from '../../../src/epics'
import { zCondition } from './zVat'
import { zUpdaters } from './zUpdaters'

const z = makeEpic<zState, empty>({
	vat: zCondition.actionType,
	initialState: initialZState,
	updaters: zUpdaters
})

export { z }