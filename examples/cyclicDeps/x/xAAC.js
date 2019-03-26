// @flow strict
import { type XStateType } from './xState'
import { createEpicCondition, createSACAC } from '../../../src/epics'

const xVat = 'X_VAT'
const xCondition = createEpicCondition<XStateType>(xVat)
const xValueCondition = xCondition.wsk('value')
const xClicked = createSACAC('X_CLICKED')


export {
	xVat,
	xClicked,
	xValueCondition,
}
