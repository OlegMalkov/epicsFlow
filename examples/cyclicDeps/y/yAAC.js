// @flow strict
import { type YStateType } from './yState'
import { makeSimpleEvent, createEpicCondition } from '../../../src/epics'

const yVcet = 'Y_VCET'
const yC = createEpicCondition<YStateType>(yVcet)
const yValueC = yC.wsk('value')
const yColorC = yC.wsk('color')
const yClicked = makeSimpleEvent('Y_CLICKED')

export {
	yVcet,
	yValueC,
	yColorC,
	yClicked,
}
