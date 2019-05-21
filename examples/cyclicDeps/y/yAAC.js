// @flow strict
import { type YStateType } from './yState'
import { createSimpleEvent, createEpicCondition } from '../../../src/epics'

const yVcet = 'Y_VCET'
const yC = createEpicCondition<YStateType>(yVcet)
const yValueC = yC.wsk('value')
const yColorC = yC.wsk('color')
const yClicked = createSimpleEvent('Y_CLICKED')

export {
	yVcet,
	yValueC,
	yColorC,
	yClicked,
}
