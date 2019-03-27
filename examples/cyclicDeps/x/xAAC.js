// @flow strict
import { type XStateType } from './xState'
import { createEpicCondition, makeSimpleActionCreatorAndCondition } from '../../../src/epics'

const xVat = 'X_VAT'
const xCondition = createEpicCondition<XStateType>(xVat)
const xValueCondition = xCondition.wsk('value')
const xClicked = makeSimpleActionCreatorAndCondition('X_CLICKED')


export {
	xVat,
	xClicked,
	xValueCondition,
}
