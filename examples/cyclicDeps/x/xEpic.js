// @flow strict

import { initialXState } from './xState'
import { xUpdaters } from './xUpdaters'
import { xVat } from './xAAC'
import { createEpic } from '../../../src/epics'

const x = createEpic<typeof initialXState, empty, empty>({
	vat: xVat,
	initialState: initialXState,
	updaters: xUpdaters,
})

export {
	x,
}
