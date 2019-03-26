// @flow strict
import { type YStateType } from './yState'
import { createSACAC, createEpicCondition } from '../../../src/epics'

const yVat = 'Y_VAT'
const yC = createEpicCondition<YStateType>(yVat)
const yValueC = yC.wsk('value')
const yColorC = yC.wsk('color')
const yClicked = createSACAC('Y_CLICKED')

export {
	yVat,
	yValueC,
	yColorC,
	yClicked,
}
