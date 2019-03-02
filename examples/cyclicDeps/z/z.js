// @flow strict

import { type zState, initialZState } from './zState'
import { zCondition } from './zVat'
import { zUpdaters } from './zUpdaters'
import { CDE } from '../utils'

const z = CDE.makeEpic<zState, empty>({
	vat: zCondition.actionType,
	initialState: initialZState,
	updaters: zUpdaters
})

export { z }