// @flow strict
import { makeSimpleActionCreatorAndCondition, createEpicCondition } from '../../../src/epics'
import { initialYState } from './yState'

const yVat = 'Y_VAT'
const yC = createEpicCondition<typeof initialYState>(yVat)
const yValueC = yC.wsk('value')
const yColorC = yC.wsk('color')
const yClicked = makeSimpleActionCreatorAndCondition('Y_CLICKED')

export {
	yVat,
	yValueC,
	yColorC,
	yClicked,
}
