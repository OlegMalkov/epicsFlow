// @flow strict
import { type XStateType } from './xState'
import { makeEpicCondition, makeSACAC } from '../../../src/epics';

const xVat = 'X'
const xCondition = makeEpicCondition<XStateType>(xVat)
const xValueCondition = xCondition.wsk('value')
const xClicked = makeSACAC('X_CLICKED')


export {
	xVat,
	xClicked,
	xValueCondition,
}
