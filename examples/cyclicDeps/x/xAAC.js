// @flow strict
import { type XStateType } from './xState'
import { createEpicCondition, createSimpleEvent } from '../../../src/epics'

const xVcet = 'X_VCET'
const xCondition = createEpicCondition<XStateType>(xVcet)
const xValueCondition = xCondition.wsk('value')
const xClicked = createSimpleEvent('X_CLICKED')


export {
	xVcet,
	xClicked,
	xValueCondition,
}
