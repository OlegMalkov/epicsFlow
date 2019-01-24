// @flow 
import { type yState } from './yState'
import { makeEpicCondition, makeCondition } from '../../../src/epics'

export const 
	yVat = 'Y',
	yC = makeEpicCondition<yState>(yVat),
	yValueC = yC.sk('value'),
	yColorC = yC.sk('color')


const yClickedAT = 'Y_CLICKED'
export const 
	yClickedAC = () => ({ type: yClickedAT }),
	yClickedC = makeCondition<empty>(yClickedAT)
