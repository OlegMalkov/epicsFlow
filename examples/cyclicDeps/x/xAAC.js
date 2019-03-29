// @flow strict
import { createEpicCondition, makeSimpleActionCreatorAndCondition } from '../../../src/epics'
import { initialXState } from './xState'

const xVat = 'X_VAT'
const xCondition = createEpicCondition<typeof initialXState>(xVat)
const xValueCondition = xCondition.wsk('value')
const xClicked = makeSimpleActionCreatorAndCondition('X_CLICKED')


export {
	xVat,
	xClicked,
	xValueCondition,
}
