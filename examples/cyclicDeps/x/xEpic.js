// @flow

import { type xState, initialXState } from './xState'
import { makeEpic } from '../../../src/epics'
import { xUpdaters } from './xUpdaters'
import { xVat } from './xAAC'


export const x = makeEpic<xState, empty>({
	vat: xVat,
	initialState: initialXState,
	updaters: xUpdaters
})