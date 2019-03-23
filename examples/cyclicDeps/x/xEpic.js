// @flow strict

import { type XStateType, initialXState } from './xState'
import { xUpdaters } from './xUpdaters'
import { xVat } from './xAAC'
import { makeEpic } from '../../../src/epics'

const x = makeEpic<XStateType, empty, empty>({
	vat: xVat,
	initialState: initialXState,
	updaters: xUpdaters,
})

export {
	x,
}
