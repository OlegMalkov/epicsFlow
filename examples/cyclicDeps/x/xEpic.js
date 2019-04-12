// @flow strict

import { type XStateType, initialXState } from './xState'
import { xUpdaters } from './xUpdaters'
import { xVcet } from './xAAC'
import { createEpic } from '../../../src/epics'

const x = createEpic<XStateType, empty, empty>({
	vcet: xVcet,
	initialState: initialXState,
	updaters: xUpdaters,
})

export {
	x,
}
