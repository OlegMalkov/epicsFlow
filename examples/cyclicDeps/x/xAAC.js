// @flow strict
import { type XStateType } from './xState'
import { makeEpicCondition } from '../../../src/epics'
import { makeSACAC } from '../../websitebuilder/src/epics'

const xVat = 'X'
const xCondition = makeEpicCondition<XStateType>(xVat)
const xValueCondition = xCondition.wsk('value')
const xClicked = makeSACAC('X_CLICKED')


export {
	xVat,
	xClicked,
	xValueCondition,
}
