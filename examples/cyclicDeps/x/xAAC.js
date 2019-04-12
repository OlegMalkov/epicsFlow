// @flow strict
import { type XStateType } from './xState'
import { createEpicCondition, makeSimpleEvent } from '../../../src/epics'

const xVcet = 'X_VCET'
const xCondition = createEpicCondition<XStateType>(xVcet)
const xValueCondition = xCondition.wsk('value')
const xClicked = makeSimpleEvent('X_CLICKED')


export {
	xVcet,
	xClicked,
	xValueCondition,
}
