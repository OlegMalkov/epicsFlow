// @flow strict
import { type YStateType } from './yState'
import { makeSACAC, makeEpicCondition } from '../../../epics'

const yVat = 'Y'
const yC = makeEpicCondition<YStateType>(yVat)
const yValueC = yC.wsk('value')
const yColorC = yC.wsk('color')
const yClicked = makeSACAC('Y_CLICKED')

export {
	yVat,
	yValueC,
	yColorC,
	yClicked,
}
