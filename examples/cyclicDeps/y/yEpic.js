// @flow

import { type yState, initialYState } from './yState'
import {  makeEpic } from '../../../src/epics'
import { yUpdaters } from './yUpdaters'
import { yVat } from './yAAC'

export const y = makeEpic<yState, empty>({
	vat: yVat,
	initialState: initialYState,
	updaters: yUpdaters
})